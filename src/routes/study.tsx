import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, Meter, SectionTitle, SubjectPill } from "@/components/bits";
import { useIntelligence, useStore } from "@/lib/store";
import { fmtDuration, type Task } from "@/lib/engine";
import { cn } from "@/lib/utils";
import { Coffee, Pause, Play, X } from "lucide-react";

export const Route = createFileRoute("/study")({
  validateSearch: (s: Record<string, unknown>): { task?: string } =>
    typeof s['task'] === "string" ? { task: s['task'] } : {},
  head: () => ({
    meta: [
      { title: "Study — Study Rescue" },
      {
        name: "description",
        content: "Your realistic daily plan plus a distraction-free focus timer that learns your real pace.",
      },
      { property: "og:title", content: "Study — Study Rescue" },
      { property: "og:description", content: "A plan you'll actually finish, plus focus mode." },
    ],
  }),
  component: StudyPage,
});

function StudyPage() {
  const { task: taskId } = Route.useSearch();
  const store = useStore();
  const { plan, next } = useIntelligence();
  const navigate = useNavigate();
  const active = store.tasks.find((t) => t.id === taskId && t.status === "active");

  if (active) {
    return (
      <FocusMode
        task={active}
        minutes={next?.task.id === active.id ? next.minutes : 45}
        onExit={() => navigate({ to: "/study", search: {} })}
      />
    );
  }

  return (
    <main className="mx-auto max-w-lg px-4 pt-8">
      <h1 className="text-2xl font-extrabold">Today's game plan</h1>
      <p className="text-sm text-muted-foreground">
        Built around your energy, not just your deadlines.
      </p>

      <Card className="mt-5">
        <SectionTitle
          action={
            <span className="rounded-full bg-mint-soft px-3 py-1 text-xs font-bold text-mint-foreground">
              {plan.realism}% · {plan.realismLabel}
            </span>
          }
        >
          Realism score
        </SectionTitle>
        <Meter value={plan.realism} tone={plan.realism >= 70 ? "mint" : "butter"} />
        <p className="mt-2 text-sm text-muted-foreground">
          {fmtDuration(plan.scheduledMinutes)} of focused work planned. A shorter plan you finish beats
          a heroic one you don't.
        </p>
      </Card>

      <section className="mt-6">
        <SectionTitle>The blocks</SectionTitle>
        <div className="space-y-2">
          {plan.blocks.length ? (
            plan.blocks.map((b) => (
              <Card
                key={b.id}
                hover={b.kind === "study"}
                className={cn(
                  "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-4",
                  b.kind !== "study" && "bg-secondary/60 shadow-none",
                )}
              >
                <span className="w-[4.5rem] shrink-0 text-xs font-extrabold tabular-nums text-muted-foreground">
                  {b.start}
                  <br />
                  {b.end}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-bold">
                    {b.kind === "break" ? "☕ " : b.kind === "buffer" ? "🌙 " : ""}
                    {b.title}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    {b.subject && <SubjectPill subject={b.subject} />}
                    <span className="text-xs text-muted-foreground">
                      {fmtDuration(b.minutes)}
                      {b.note ? ` · ${b.note}` : ""}
                    </span>
                  </div>
                </div>
                {b.kind === "study" && b.taskId && (
                  <Button
                    size="sm"
                    onClick={() => navigate({ to: "/study", search: { task: b.taskId! } })}
                  >
                    <Play className="h-3.5 w-3.5" />
                  </Button>
                )}
              </Card>
            ))
          ) : (
            <Card className="text-center">
              <p className="text-3xl">🌙</p>
              <p className="mt-2 font-bold">That's a wrap for today</p>
              <p className="text-sm text-muted-foreground">Rest counts. Tomorrow gets a fresh plan.</p>
            </Card>
          )}
        </div>
      </section>

      {plan.unscheduled.length > 0 && (
        <section className="mt-6">
          <SectionTitle>Didn't fit today (on purpose)</SectionTitle>
          <Card className="space-y-2">
            {plan.unscheduled.slice(0, 5).map((u) => (
              <div key={u.task.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 text-sm">
                <span className="truncate">{u.task.name}</span>
                <span className="shrink-0 text-muted-foreground">{fmtDuration(u.remaining)}</span>
              </div>
            ))}
            <p className="pt-1 text-xs text-muted-foreground">
              Cramming these in would just break the plan. They're queued for your next free blocks.
            </p>
          </Card>
        </section>
      )}
    </main>
  );
}

function FocusMode({
  task,
  minutes,
  onExit,
}: {
  task: Task;
  minutes: number;
  onExit: () => void;
}) {
  const store = useStore();
  const planned = Math.max(15, minutes);
  const [left, setLeft] = useState(planned * 60);
  const [running, setRunning] = useState(true);
  const [onBreak, setOnBreak] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    if (!running) return;
    const i = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(i);
  }, [running]);

  useEffect(() => {
    if (left === 0) {
      setRunning(false);
      setReviewing(true);
    }
  }, [left]);

  const elapsed = planned * 60 - left;
  const pct = (elapsed / (planned * 60)) * 100;
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  const finish = (outcome: "finished" | "partial" | "unfinished" | "faster") => {
    const actual = Math.max(1, Math.round((Date.now() - startedAt.current) / 60000));
    store.logSession({
      taskId: task.id,
      taskName: task.name,
      subject: task.subject,
      plannedMinutes: planned,
      actualMinutes: actual,
      outcome,
    });
    const bump = { finished: 100, faster: 100, partial: 55, unfinished: 15 }[outcome];
    const share = Math.round((planned / Math.max(planned, task.estMinutes)) * bump);
    const completion = Math.min(100, task.completion + share);
    if (completion >= 100) store.completeTask(task.id);
    else store.updateTask(task.id, { completion });
    onExit();
  };

  const review = useMemo(
    () =>
      [
        ["finished", "Finished it 🎉"],
        ["faster", "Faster than expected ⚡"],
        ["partial", "Partly done 👍"],
        ["unfinished", "Didn't get there 🫶"],
      ] as const,
    [],
  );

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-lg flex-col px-4 pt-8">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <SubjectPill subject={task.subject} />
          <h1 className="mt-2 truncate text-2xl font-extrabold">{task.name}</h1>
        </div>
        <button aria-label="Leave focus mode" onClick={onExit} className="press mt-1 text-muted-foreground">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-10 flex flex-1 flex-col items-center justify-center">
        <p className="font-display text-7xl font-extrabold tabular-nums">
          {onBreak ? "☕" : `${mm}:${ss}`}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {onBreak ? "Break time — stretch, water, breathe" : `${fmtDuration(planned)} session`}
        </p>
        <Meter className="mt-6 max-w-xs" value={pct} tone="mint" />
      </div>

      {reviewing ? (
        <Card className="mb-6 space-y-2">
          <p className="font-bold">How did that go?</p>
          <p className="text-sm text-muted-foreground">
            Honest answers make your future plans way more accurate.
          </p>
          {review.map(([key, label]) => (
            <Button key={key} variant="soft" className="w-full" onClick={() => finish(key)}>
              {label}
            </Button>
          ))}
        </Card>
      ) : (
        <div className="mb-6 flex gap-2">
          <Button
            variant="soft"
            className="flex-1"
            onClick={() => {
              setRunning((r) => !r);
              setOnBreak(false);
            }}
          >
            {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {running ? "Pause" : "Resume"}
          </Button>
          <Button
            variant="soft"
            className="flex-1"
            onClick={() => {
              setOnBreak((b) => !b);
              setRunning(false);
            }}
          >
            <Coffee className="h-4 w-4" /> Break
          </Button>
          <Button className="flex-1" onClick={() => setReviewing(true)}>
            Complete
          </Button>
        </div>
      )}
    </main>
  );
}
