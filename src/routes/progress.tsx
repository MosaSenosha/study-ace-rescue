import { createFileRoute } from "@tanstack/react-router";
import { Card, Meter, SectionTitle, Stat, SubjectPill } from "@/components/bits";
import { useIntelligence, useStore } from "@/lib/store";
import {
  completionRate,
  estimationMultiplier,
  fmtDuration,
  remainingMinutes,
} from "@/lib/engine";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progress — Study Rescue" },
      {
        name: "description",
        content: "See what you've smashed, how accurate your estimates are, and when you study best.",
      },
      { property: "og:title", content: "Progress — Study Rescue" },
      { property: "og:description", content: "Your wins, your real pace, your best study hours." },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const store = useStore();
  const { assessment } = useIntelligence();
  const mult = estimationMultiplier(store.sessions);
  const rate = completionRate(store.sessions);
  const done = store.tasks.filter((t) => t.status === "done");
  const active = store.tasks.filter((t) => t.status === "active");
  const minutesStudied = store.sessions.reduce((a, s) => a + s.actualMinutes, 0);

  const bySubject = Object.entries(
    active.reduce<Record<string, number>>((acc, t) => {
      acc[t.subject] = (acc[t.subject] ?? 0) + remainingMinutes(t, mult);
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);
  const maxSubject = Math.max(1, ...bySubject.map(([, v]) => v));

  const bestBlock = [...store.pattern].sort((a, b) => b.level - a.level)[0];

  const insights: string[] = [];
  if (store.sessions.length >= 3) {
    if (mult > 1.1)
      insights.push(
        `Your tasks take about ${Math.round((mult - 1) * 100)}% longer than you estimate. I've already padded your future plans.`,
      );
    else if (mult < 0.95)
      insights.push("You're faster than you think — I've tightened your estimates a little.");
    insights.push(`You finish ${Math.round(rate * 100)}% of the sessions you start.`);
  } else {
    insights.push("Do a few focus sessions and I'll start learning your real pace.");
  }
  if (bestBlock)
    insights.push(
      `Your sharpest window is ${String(bestBlock.start).padStart(2, "0")}:00–${String(bestBlock.end).padStart(2, "0")}:00 — I save the hard stuff for then.`,
    );

  return (
    <main className="mx-auto max-w-lg px-4 pt-8">
      <h1 className="text-2xl font-extrabold">Progress</h1>
      <p className="text-sm text-muted-foreground">Proof you're doing more than it feels like.</p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Stat label="Smashed" value={done.length} sub="tasks finished" />
        <Stat label="Focus time" value={fmtDuration(minutesStudied)} sub="tracked" />
        <Stat label="Sessions" value={store.sessions.length} sub="completed" />
        <Stat label="Follow-through" value={`${Math.round(rate * 100)}%`} sub="of sessions finished" />
      </div>

      <Card className="mt-5">
        <SectionTitle>Where your work is hiding</SectionTitle>
        <div className="space-y-3">
          {bySubject.length ? (
            bySubject.map(([subject, mins]) => (
              <div key={subject}>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                  <SubjectPill subject={subject} />
                  <span className="shrink-0 text-xs font-bold text-muted-foreground">
                    {fmtDuration(mins)}
                  </span>
                </div>
                <Meter className="mt-1.5" value={(mins / maxSubject) * 100} tone="sky" />
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Nothing outstanding. Enjoy it.</p>
          )}
        </div>
      </Card>

      <Card className="mt-5">
        <SectionTitle>What I've learned about you</SectionTitle>
        <ul className="space-y-2">
          {insights.map((i) => (
            <li key={i} className="flex gap-2 text-sm text-muted-foreground">
              <span className="text-primary">•</span>
              <span className="min-w-0">{i}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="mt-5">
        <SectionTitle>This week at a glance</SectionTitle>
        <p className="text-sm text-muted-foreground">
          {assessment.emoji} {assessment.label} — {fmtDuration(assessment.remainingMinutes)} of work
          against {fmtDuration(assessment.capacityMinutes)} of realistic study time.
        </p>
      </Card>

      {store.sessions.length > 0 && (
        <section className="mt-6">
          <SectionTitle>Recent sessions</SectionTitle>
          <div className="space-y-2">
            {store.sessions.slice(0, 8).map((s) => (
              <Card key={s.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{s.taskName}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.subject} · planned {fmtDuration(s.plannedMinutes)}, actual{" "}
                    {fmtDuration(s.actualMinutes)}
                  </p>
                </div>
                <span className="shrink-0 text-lg">
                  {{ finished: "✅", faster: "⚡", partial: "🟡", unfinished: "🫶" }[s.outcome]}
                </span>
              </Card>
            ))}
          </div>
        </section>
      )}

      {done.length > 0 && (
        <section className="mt-6">
          <SectionTitle>You smashed these 💪</SectionTitle>
          <Card className="space-y-2">
            {done.slice(0, 8).map((t) => (
              <p key={t.id} className="truncate text-sm">
                ✅ {t.name} <span className="text-muted-foreground">· {t.subject}</span>
              </p>
            ))}
          </Card>
        </section>
      )}
      <div className="h-6" />
    </main>
  );
}
