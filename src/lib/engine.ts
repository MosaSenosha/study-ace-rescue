/**
 * Study Rescue — Workload Intelligence Engine
 * Pure functions: no React, no side effects. All time in minutes unless noted.
 */

export type TaskType =
  | "assignment"
  | "exam"
  | "test"
  | "project"
  | "reading"
  | "problem-set"
  | "revision"
  | "lecture"
  | "other";

export type TaskStatus = "active" | "done" | "deferred";

export interface Subtask {
  id: string;
  name: string;
  done: boolean;
}

export interface Task {
  id: string;
  name: string;
  subject: string;
  type: TaskType;
  due: string; // ISO
  estMinutes: number;
  difficulty: number; // 1-5
  importance: number; // 1-5
  completion: number; // 0-100
  confidence: number; // 1-5
  energyRequired: number; // 1-5
  weighting?: number; // % of module grade
  notes?: string;
  status: TaskStatus;
  subtasks: Subtask[];
  createdAt: string;
  dependsOn?: string | null;
}

export interface EnergyBlock {
  start: number; // hour 0-23
  end: number;
  level: number; // 1-5
}

export interface Commitment {
  id: string;
  name: string;
  day: number; // 0-6 (Sun-Sat)
  start: number;
  end: number;
}

export interface SessionLog {
  id: string;
  taskId: string;
  taskName: string;
  subject: string;
  plannedMinutes: number;
  actualMinutes: number;
  outcome: "finished" | "partial" | "unfinished" | "faster";
  at: string; // ISO
}

export const ENERGY_LABELS = ["Exhausted", "Low", "Average", "Good", "Very high"];

export const DEFAULT_ENERGY_PATTERN: EnergyBlock[] = [
  { start: 8, end: 10, level: 5 },
  { start: 10, end: 13, level: 4 },
  { start: 13, end: 15, level: 2 },
  { start: 15, end: 18, level: 3 },
  { start: 18, end: 21, level: 4 },
  { start: 21, end: 23, level: 2 },
];

/* ---------------------------------- utils --------------------------------- */

export const uid = () => Math.random().toString(36).slice(2, 10);

export function hoursUntil(due: string, from = new Date()) {
  return (new Date(due).getTime() - from.getTime()) / 3_600_000;
}

export function fmtDuration(mins: number) {
  const m = Math.max(0, Math.round(mins));
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h === 0) return `${r}m`;
  if (r === 0) return `${h}h`;
  return `${h}h ${r}m`;
}

export function fmtDue(due: string, from = new Date()) {
  const h = hoursUntil(due, from);
  if (h < 0) return "Overdue";
  if (h < 1) return "Due within the hour";
  if (h < 24) return `Due in ${Math.round(h)}h`;
  const d = Math.round(h / 24);
  return d === 1 ? "Due tomorrow" : `Due in ${d} days`;
}

export function fmtClock(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}

/* ------------------------------ learning model ----------------------------- */

/** How much longer tasks actually take than estimated, learned from sessions. */
export function estimationMultiplier(sessions: SessionLog[]) {
  const useful = sessions.filter((s) => s.outcome === "finished" || s.outcome === "faster");
  if (useful.length < 3) return 1;
  const ratio =
    useful.reduce((a, s) => a + s.actualMinutes / Math.max(15, s.plannedMinutes), 0) / useful.length;
  return Math.min(1.8, Math.max(0.7, ratio));
}

export function completionRate(sessions: SessionLog[]) {
  if (!sessions.length) return 0.75;
  const good = sessions.filter((s) => s.outcome === "finished" || s.outcome === "faster").length;
  return Math.min(1, Math.max(0.3, good / sessions.length));
}

/* ------------------------------ remaining work ----------------------------- */

export function remainingMinutes(task: Task, multiplier = 1) {
  if (task.status !== "active") return 0;
  const sub = task.subtasks.length
    ? task.subtasks.filter((s) => !s.done).length / task.subtasks.length
    : 1 - task.completion / 100;
  const frac = task.subtasks.length ? Math.min(sub, 1 - task.completion / 100 + 0.001) : sub;
  return Math.max(0, task.estMinutes * Math.max(0, frac) * multiplier);
}

export function totalRemaining(tasks: Task[], multiplier = 1) {
  return tasks.reduce((a, t) => a + remainingMinutes(t, multiplier), 0);
}

/* -------------------------------- capacity -------------------------------- */

/** Efficiency of a study minute at a given energy level. */
function efficiency(level: number) {
  return [0.35, 0.5, 0.7, 0.85, 0.95][Math.min(4, Math.max(0, level - 1))]!;
}

function overlapsCommitment(day: number, start: number, end: number, commitments: Commitment[]) {
  return commitments.some((c) => c.day === day && start < c.end && end > c.start);
}

export interface CapacityResult {
  rawMinutes: number;
  realisticMinutes: number;
  days: number;
}

/**
 * Realistic productive capacity between now and a horizon date.
 * Applies energy efficiency, daily fatigue caps, breaks and a safety buffer.
 */
export function capacityUntil(
  horizon: Date,
  pattern: EnergyBlock[],
  commitments: Commitment[],
  from = new Date(),
  productivityFactor = 1,
): CapacityResult {
  let raw = 0;
  let realistic = 0;
  const cursor = new Date(from);
  let days = 0;
  while (cursor < horizon && days < 30) {
    const dayEnd = new Date(cursor);
    dayEnd.setHours(23, 59, 59, 999);
    const end = horizon < dayEnd ? horizon : dayEnd;
    const nowHour = cursor.getHours() + cursor.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;
    let dayRealistic = 0;
    for (const b of pattern) {
      const s = Math.max(b.start, days === 0 ? nowHour : 0);
      const e = Math.min(b.end, endHour);
      if (e <= s) continue;
      if (overlapsCommitment(cursor.getDay(), s, e, commitments)) continue;
      const mins = (e - s) * 60;
      raw += mins;
      // breaks + meals eat ~15% of any block
      dayRealistic += mins * 0.85 * efficiency(b.level);
    }
    // fatigue cap: nobody does more than ~6 truly productive hours a day
    realistic += Math.min(dayRealistic, 360);
    cursor.setDate(cursor.getDate() + 1);
    cursor.setHours(0, 0, 0, 0);
    days++;
  }
  // safety buffer for life happening
  return {
    rawMinutes: raw,
    realisticMinutes: Math.round(realistic * 0.9 * productivityFactor),
    days,
  };
}

/* ----------------------------- workload verdict ---------------------------- */

export type WorkloadLevel = "manageable" | "pressured" | "overloaded" | "critical";

export interface WorkloadAssessment {
  level: WorkloadLevel;
  remainingMinutes: number;
  capacityMinutes: number;
  deficitMinutes: number;
  ratio: number;
  horizon: Date;
  reasons: string[];
  label: string;
  emoji: string;
}

export function assessWorkload(
  tasks: Task[],
  pattern: EnergyBlock[],
  commitments: Commitment[],
  sessions: SessionLog[],
  from = new Date(),
): WorkloadAssessment {
  const active = tasks.filter((t) => t.status === "active");
  const mult = estimationMultiplier(sessions);
  const rem = totalRemaining(active, mult);

  const horizon = active.length
    ? new Date(
        Math.max(
          from.getTime() + 24 * 3_600_000,
          Math.min(
            ...active.map((t) => new Date(t.due).getTime()).filter((n) => n > from.getTime()),
            from.getTime() + 7 * 24 * 3_600_000,
          ),
        ),
      )
    : new Date(from.getTime() + 7 * 24 * 3_600_000);

  // capacity measured to the last relevant deadline within a week
  const weekHorizon = new Date(from.getTime() + 7 * 24 * 3_600_000);
  const cap = capacityUntil(weekHorizon, pattern, commitments, from, completionRate(sessions) + 0.2);
  const ratio = cap.realisticMinutes > 0 ? rem / cap.realisticMinutes : rem > 0 ? 99 : 0;

  let level: WorkloadLevel = "manageable";
  if (ratio > 1.35) level = "critical";
  else if (ratio > 1) level = "overloaded";
  else if (ratio > 0.75) level = "pressured";

  const reasons: string[] = [];
  const soon = active.filter((t) => hoursUntil(t.due, from) < 72);
  if (soon.length > 2) reasons.push(`${soon.length} things are due in the next 3 days.`);
  const heavy = active.filter((t) => remainingMinutes(t, mult) > 240);
  if (heavy.length) reasons.push(`${heavy.length} task${heavy.length > 1 ? "s are" : " is"} 4+ hours of work on their own.`);
  if (mult > 1.15) reasons.push(`Your tasks usually take ~${Math.round((mult - 1) * 100)}% longer than you estimate.`);
  const hard = active.filter((t) => t.difficulty >= 4 && t.confidence <= 2);
  if (hard.length) reasons.push(`${hard.length} task${hard.length > 1 ? "s feel" : " feels"} hard and you're not confident on ${hard.length > 1 ? "them" : "it"} yet.`);
  if (!reasons.length) reasons.push("Your workload fits inside the time you actually have.");

  const meta = {
    manageable: { label: "Manageable", emoji: "🟢" },
    pressured: { label: "Pressured", emoji: "🟡" },
    overloaded: { label: "Overloaded", emoji: "🟠" },
    critical: { label: "Critical", emoji: "🔴" },
  }[level];

  return {
    level,
    remainingMinutes: rem,
    capacityMinutes: cap.realisticMinutes,
    deficitMinutes: Math.max(0, rem - cap.realisticMinutes),
    ratio,
    horizon,
    reasons,
    ...meta,
  };
}

/* -------------------------------- priority -------------------------------- */

export interface ScoredTask {
  task: Task;
  score: number;
  remaining: number;
  urgency: number;
  impact: number;
  reasons: string[];
}

export function scoreTask(task: Task, mult = 1, from = new Date()): ScoredTask {
  const rem = remainingMinutes(task, mult);
  const hrs = hoursUntil(task.due, from);
  const hoursLeft = Math.max(0.5, hrs);

  // deadline risk: how much of the remaining time this task alone would eat
  const pressure = Math.min(3, rem / 60 / hoursLeft);
  const urgency = hrs < 0 ? 3 : Math.min(3, 24 / Math.max(6, hoursLeft) + pressure);

  const weight = task.weighting ? task.weighting / 20 : 0;
  const impact = task.importance / 5 + weight * 0.6;

  const confidenceGap = (6 - task.confidence) / 5; // low confidence => needs earlier start
  const difficulty = task.difficulty / 5;

  const score =
    urgency * 34 +
    impact * 30 +
    difficulty * 8 +
    confidenceGap * 10 +
    Math.min(1, rem / 300) * 10 +
    (task.type === "exam" || task.type === "test" ? 6 : 0);

  const reasons: string[] = [];
  reasons.push(fmtDue(task.due, from));
  if (task.weighting) reasons.push(`Worth ${task.weighting}% of ${task.subject}`);
  else if (task.importance >= 4) reasons.push("High academic impact");
  if (task.difficulty >= 4) reasons.push("Needs real concentration");
  if (task.confidence <= 2) reasons.push("You're not confident here yet");
  if (rem > 0) reasons.push(`${fmtDuration(rem)} of work left`);

  return { task, score, remaining: rem, urgency, impact, reasons };
}

export function prioritise(tasks: Task[], mult = 1, from = new Date()): ScoredTask[] {
  const done = new Set(tasks.filter((t) => t.status === "done").map((t) => t.id));
  return tasks
    .filter((t) => t.status === "active")
    .map((t) => scoreTask(t, mult, from))
    .map((s) =>
      s.task.dependsOn && !done.has(s.task.dependsOn)
        ? { ...s, score: s.score * 0.55, reasons: [...s.reasons, "Waiting on another task"] }
        : s,
    )
    .sort((a, b) => b.score - a.score);
}

/* ------------------------------ energy matching ---------------------------- */

export function energyAt(hour: number, pattern: EnergyBlock[]) {
  const b = pattern.find((x) => hour >= x.start && hour < x.end);
  return b ? b.level : 2;
}

export function energyMatch(task: Task, energy: number) {
  const diff = energy - task.energyRequired;
  if (diff >= 1) return { ok: true, label: "Great energy match" };
  if (diff === 0) return { ok: true, label: "Good energy match" };
  if (diff === -1) return { ok: true, label: "Slightly demanding for now" };
  return { ok: false, label: "Too demanding for your current energy" };
}

export const LOW_ENERGY_TYPES: TaskType[] = ["reading", "revision", "lecture", "other"];

/* ------------------------------- next move -------------------------------- */

export interface NextMove {
  task: Task;
  minutes: number;
  chunkLabel: string;
  reasons: string[];
  matchLabel: string;
}

export function nextMove(
  tasks: Task[],
  energy: number,
  windowMinutes: number,
  sessions: SessionLog[],
  from = new Date(),
): NextMove | null {
  const mult = estimationMultiplier(sessions);
  const ranked = prioritise(tasks, mult, from);
  if (!ranked.length) return null;

  const scored = ranked
    .map((s) => {
      const m = energyMatch(s.task, energy);
      const fit = m.ok ? 1 : 0.45;
      const sizeFit = s.remaining <= windowMinutes ? 1.05 : 0.95;
      return { ...s, adjusted: s.score * fit * sizeFit, matchLabel: m.label };
    })
    .sort((a, b) => b.adjusted - a.adjusted);

  const best = scored[0];
  if (!best) return null;
  const minutes = Math.max(20, Math.min(Math.round(best.remaining), windowMinutes, energy >= 4 ? 90 : 45));
  const partial = minutes < best.remaining;
  return {
    task: best.task,
    minutes,
    chunkLabel: partial ? `Next ${fmtDuration(minutes)} chunk` : "Finish it off",
    reasons: [...best.reasons, best.matchLabel].slice(0, 4),
    matchLabel: best.matchLabel,
  };
}

/* --------------------------------- planner -------------------------------- */

export type PlanKind = "study" | "break" | "buffer";

export interface PlanBlock {
  id: string;
  kind: PlanKind;
  start: string; // "09:00"
  end: string;
  minutes: number;
  taskId?: string;
  title: string;
  subject?: string;
  note?: string;
  energy?: number;
}

export interface StudyPlan {
  blocks: PlanBlock[];
  scheduledMinutes: number;
  realism: number;
  realismLabel: string;
  unscheduled: { task: Task; remaining: number }[];
}

const hhmm = (h: number) => {
  const hr = Math.floor(h);
  const mn = Math.round((h - hr) * 60);
  return `${String(hr).padStart(2, "0")}:${String(mn % 60).padStart(2, "0")}`;
};

export function generatePlan(
  tasks: Task[],
  pattern: EnergyBlock[],
  commitments: Commitment[],
  sessions: SessionLog[],
  from = new Date(),
  opts: { maxMinutes?: number; rescue?: boolean } = {},
): StudyPlan {
  const mult = estimationMultiplier(sessions);
  const ranked = prioritise(tasks, mult, from);
  const budget = new Map(ranked.map((r) => [r.task.id, r.remaining]));
  const blocks: PlanBlock[] = [];
  const nowHour = from.getHours() + from.getMinutes() / 60;
  const day = from.getDay();

  const cap = capacityUntil(
    new Date(new Date(from).setHours(23, 59, 59, 999)),
    pattern,
    commitments,
    from,
    completionRate(sessions) + 0.2,
  );
  const dailyBudget = Math.min(opts.maxMinutes ?? 999, Math.max(45, cap.realisticMinutes));
  let used = 0;
  let sinceBreak = 0;

  for (const b of pattern) {
    let cursor = Math.max(b.start, Math.ceil(nowHour * 4) / 4);
    while (cursor < b.end - 0.24 && used < dailyBudget) {
      if (overlapsCommitment(day, cursor, Math.min(b.end, cursor + 0.25), commitments)) {
        cursor += 0.25;
        continue;
      }
      const candidate = ranked.find((r) => {
        const left = budget.get(r.task.id) ?? 0;
        if (left < 15) return false;
        const m = energyMatch(r.task, b.level);
        if (!m.ok && !opts.rescue) return false;
        return true;
      });
      if (!candidate) break;

      const maxChunk = b.level >= 4 ? 90 : 50;
      const slotMinutes = Math.floor((b.end - cursor) * 60);
      const left = budget.get(candidate.task.id) ?? 0;
      const minutes = Math.max(
        15,
        Math.min(maxChunk, slotMinutes, Math.round(left), dailyBudget - used),
      );
      if (minutes < 15) break;

      blocks.push({
        id: uid(),
        kind: "study",
        start: hhmm(cursor),
        end: hhmm(cursor + minutes / 60),
        minutes,
        taskId: candidate.task.id,
        title: candidate.task.name,
        subject: candidate.task.subject,
        energy: b.level,
        note:
          b.level >= 4
            ? "High-energy slot — deep work"
            : "Lower energy — lighter, steady work",
      });
      budget.set(candidate.task.id, left - minutes);
      cursor += minutes / 60;
      used += minutes;
      sinceBreak += minutes;

      if (sinceBreak >= 50 && cursor < b.end && used < dailyBudget) {
        const brk = 15;
        blocks.push({
          id: uid(),
          kind: "break",
          start: hhmm(cursor),
          end: hhmm(cursor + brk / 60),
          minutes: brk,
          title: "Break — get up, drink water",
        });
        cursor += brk / 60;
        sinceBreak = 0;
      }
    }
  }

  // keep a buffer at the end of the day so life can happen
  if (blocks.length) {
    const last = blocks[blocks.length - 1]!;
    const [h, m] = last.end.split(":").map(Number) as [number, number];
    const startH = h + m / 60;
    if (startH < 22.5) {
      blocks.push({
        id: uid(),
        kind: "buffer",
        start: last.end,
        end: hhmm(startH + 0.5),
        minutes: 30,
        title: "Buffer — spillover or rest",
      });
    }
  }

  const unscheduled = ranked
    .map((r) => ({ task: r.task, remaining: budget.get(r.task.id) ?? 0 }))
    .filter((x) => x.remaining >= 15);

  const scheduled = blocks.filter((b) => b.kind === "study").reduce((a, b) => a + b.minutes, 0);
  const realism = realismScore(blocks, cap.realisticMinutes, sessions, ranked);

  return {
    blocks,
    scheduledMinutes: scheduled,
    realism,
    realismLabel:
      realism >= 80 ? "Highly achievable" : realism >= 60 ? "Doable with focus" : "Ambitious — trim it",
    unscheduled,
  };
}

export function realismScore(
  blocks: PlanBlock[],
  capacityMinutes: number,
  sessions: SessionLog[],
  ranked: ScoredTask[],
) {
  const study = blocks.filter((b) => b.kind === "study");
  const total = study.reduce((a, b) => a + b.minutes, 0);
  if (!total) return 100;
  const load = total / Math.max(60, capacityMinutes); // 0..>1
  let score = 100 - Math.max(0, load - 0.8) * 120;

  const misaligned = study.filter((b) => {
    const t = ranked.find((r) => r.task.id === b.taskId)?.task;
    return t && (b.energy ?? 3) < t.energyRequired;
  }).length;
  score -= misaligned * 6;

  const breaks = blocks.filter((b) => b.kind === "break").length;
  if (total > 120 && breaks === 0) score -= 12;
  if (blocks.some((b) => b.kind === "buffer")) score += 4;

  score -= Math.max(0, study.length - 6) * 4;
  score = score * (0.75 + completionRate(sessions) * 0.3);

  return Math.max(15, Math.min(99, Math.round(score)));
}

/* ------------------------------- rescue mode ------------------------------- */

export type Bucket = "must" | "should" | "maybe" | "defer";

export interface RescueTriage {
  must: ScoredTask[];
  should: ScoredTask[];
  maybe: ScoredTask[];
  defer: ScoredTask[];
}

export function triage(tasks: Task[], capacityMinutes: number, sessions: SessionLog[], from = new Date()): RescueTriage {
  const mult = estimationMultiplier(sessions);
  const ranked = prioritise(tasks, mult, from);
  const out: RescueTriage = { must: [], should: [], maybe: [], defer: [] };
  let spent = 0;
  for (const s of ranked) {
    const urgentSoon = hoursUntil(s.task.due, from) < 72;
    if (spent + s.remaining <= capacityMinutes * 0.6 && (urgentSoon || s.impact >= 0.8)) {
      out.must.push(s);
      spent += s.remaining;
    } else if (spent + s.remaining <= capacityMinutes) {
      out.should.push(s);
      spent += s.remaining;
    } else if (spent < capacityMinutes * 1.25) {
      out.maybe.push(s);
      spent += s.remaining;
    } else {
      out.defer.push(s);
    }
  }
  return out;
}

/* ----------------------------- rescue coach AI ----------------------------- */

export interface CoachContext {
  tasks: Task[];
  assessment: WorkloadAssessment;
  plan: StudyPlan;
  energy: number;
  sessions: SessionLog[];
  next: NextMove | null;
}

export const COACH_SUGGESTIONS = [
  "What should I study tonight?",
  "I only have two hours. What should I do?",
  "I'm exhausted. What can I realistically do?",
  "I missed yesterday. What now?",
  "Can I finish everything this week?",
];

export function coachReply(q: string, ctx: CoachContext): string {
  const t = q.toLowerCase();
  const { assessment: a, next, plan, tasks, energy, sessions } = ctx;
  const active = tasks.filter((x) => x.status === "active");
  const mult = estimationMultiplier(sessions);
  const ranked = prioritise(active, mult);

  const nextLine = next
    ? `**${next.task.name}** (${next.task.subject}) for ${fmtDuration(next.minutes)} — ${next.reasons[0]}.`
    : "Nothing on your list right now — add a task and I'll plan it.";

  if (/exhaust|tired|drained|no energy|dead/.test(t)) {
    const light = ranked.filter((r) => r.task.energyRequired <= 2 || LOW_ENERGY_TYPES.includes(r.task.type));
    return light.length
      ? `It's okay — tired brains still count. Skip the heavy stuff and do **${light[0]!.task.name}** for about 25 minutes. It's low-demand (${light[0]!.task.subject}) and still moves you forward. Everything demanding gets pushed to your next high-energy block.`
      : `Everything on your list is demanding right now, so honestly: rest. Do 20 minutes of tidying notes or re-reading, then stop. I'll rebuild tomorrow's plan around a fresh start.`;
  }
  if (/(\d+)\s*(hour|hr)/.test(t) || /two hours|one hour|an hour/.test(t)) {
    const m = t.match(/(\d+)\s*(hour|hr)/);
    const hrs = m ? Number(m[1] ?? 1) : /two/.test(t) ? 2 : 1;
    const window = hrs * 60;
    const picks: string[] = [];
    let left = window;
    for (const r of ranked) {
      if (left < 20) break;
      const mins = Math.min(left, Math.max(25, Math.min(60, r.remaining)));
      picks.push(`• ${fmtDuration(mins)} — ${r.task.name} (${r.task.subject})`);
      left -= mins + 10;
    }
    return `With ${hrs}h, here's the highest-impact use of it:\n\n${picks.join("\n")}\n\nLeave the last 10 minutes as buffer. Don't try to squeeze more in — this is the version you'll actually finish.`;
  }
  if (/missed|behind|fell behind|skipped/.test(t)) {
    return `It's okay, let's reset — one missed session doesn't wreck anything.\n\nI'm not dumping yesterday on top of today. I'd move only the highest-priority ${fmtDuration(Math.min(45, next?.minutes ?? 30))} forward: ${nextLine}\n\nThe rest stays where it is so you don't end up overloaded twice.`;
  }
  if (/everything|this week|on track|finish it all|realistic/.test(t)) {
    return a.deficitMinutes > 0
      ? `Straight answer: not all of it. You've got **${fmtDuration(a.remainingMinutes)}** of work left and about **${fmtDuration(a.capacityMinutes)}** of realistic study time this week — a ${fmtDuration(a.deficitMinutes)} gap.\n\n${a.reasons[0]}\n\nThat's exactly what Rescue Mode is for: it picks the work with the biggest academic consequence and parks the rest.`
      : `Yes — you're actually fine. ${fmtDuration(a.remainingMinutes)} of work against roughly ${fmtDuration(a.capacityMinutes)} of realistic study time. Keep to the plan and you'll land it with room to spare.`;
  }
  if (/tonight|evening|now|next|start|first|which/.test(t)) {
    const ev = plan.blocks.filter((b) => b.kind === "study" && Number(b.start.slice(0, 2)) >= 17);
    const evLine = ev.length
      ? `\n\nTonight's blocks:\n${ev.map((b) => `• ${b.start}–${b.end} ${b.title}`).join("\n")}`
      : "";
    return `Start here: ${nextLine}\n\nWhy now: your energy is ${(ENERGY_LABELS[energy - 1] ?? "average").toLowerCase()} and this is the biggest academic consequence on your list.${evLine}`;
  }
  return `Here's where you stand: ${a.emoji} **${a.label}** — ${fmtDuration(a.remainingMinutes)} of work vs ${fmtDuration(a.capacityMinutes)} of realistic time. ${a.reasons[0]}\n\nYour move right now: ${nextLine}`;
}
