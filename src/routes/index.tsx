import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Button,
  Card,
  EnergyPicker,
  Meter,
  SectionTitle,
  SubjectPill,
  WorkloadBadge,
} from "@/components/bits";
import { RescueCoach } from "@/components/rescue-coach";
import { useIntelligence, useStore } from "@/lib/store";
import { ENERGY_LABELS, fmtDue, fmtDuration, prioritise } from "@/lib/engine";
import { ArrowRight, Clock, LifeBuoy, Sparkles, X } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Study Rescue — what should I do right now?" },
      {
        name: "description",
        content:
          "Study Rescue reads your deadlines, energy and real free time, then tells you the single best thing to study next.",
      },
      { property: "og:title", content: "Study Rescue — what should I do right now?" },
      {
        property: "og:description",
        content: "When everything feels overwhelming, we'll tell you what to do next.",
      },
    ],
  }),
  component: Dashboard,
});

function greeting(h: number) {
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  return "Evening";
}

function Dashboard() {
  const store = useStore();
  const { assessment, plan, next, now } = useIntelligence();
  const [showAlert, setShowAlert] = useState(true);
  const ranked = prioritise(store.tasks).slice(0, 3);
  const critical = assessment.level === "critical" || assessment.level === "overloaded";
  const simplify = assessment.level === "critical";

  return (
    <main className="mx-auto max-w-lg px-4 pt-8">
      <header className="rise">
        <p className="text-sm font-semibold text-muted-foreground">
          {greeting(now.getHours())}, {store.profile.name} 👋
        </p>
        <h1 className="mt-1 text-3xl font-extrabold leading-tight">
          Hey! What are we tackling today?
        </h1>
      </header>

      {critical && showAlert && (
        <Card className="rise mt-5 border-2 border-primary/30 bg-coral-soft/60 p-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <p className="text-sm font-bold">
              {assessment.emoji} Heads up — your week is a bit much right now
            </p>
            <button
              aria-label="Dismiss"
              onClick={() => setShowAlert(false)}
              className="press text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {fmtDuration(assessment.remainingMinutes)} of work vs about{" "}
            {fmtDuration(assessment.capacityMinutes)} of realistic study time.
          </p>
          <Link to="/rescue" className="mt-3 block">
            <Button className="w-full">Rescue my schedule</Button>
          </Link>
        </Card>
      )}

      {/* Energy */}
      <Card className="rise mt-5">
        <SectionTitle
          action={
            <span className="text-xs font-bold text-muted-foreground">
              {ENERGY_LABELS[store.energy - 1]}
            </span>
          }
        >
          🔋 How's your energy?
        </SectionTitle>
        <EnergyPicker value={store.energy} onChange={store.setEnergy} />
      </Card>

      {/* Next move */}
      <section className="mt-5">
        <SectionTitle>🎯 Your next move</SectionTitle>
        {next ? (
          <Card hover className="bg-card p-5">
            <div className="flex flex-wrap items-center gap-2">
              <SubjectPill subject={next.task.subject} />
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-muted-foreground">
                <Clock className="h-3 w-3" /> {fmtDuration(next.minutes)}
              </span>
            </div>
            <h3 className="mt-3 text-xl font-extrabold leading-snug">{next.task.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{next.chunkLabel}</p>
            <div className="mt-4 rounded-2xl bg-secondary/70 p-3">
              <p className="text-xs font-bold text-muted-foreground">Why this one?</p>
              <ul className="mt-1.5 space-y-1">
                {next.reasons.map((r) => (
                  <li key={r} className="flex gap-2 text-sm">
                    <span className="text-primary">•</span>
                    <span className="min-w-0">{r}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Link to="/study" search={{ task: next.task.id }} className="mt-4 block">
              <Button size="lg" className="w-full">
                Start <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </Card>
        ) : (
          <Card className="text-center">
            <p className="text-3xl">🎉</p>
            <p className="mt-2 font-bold">You're all clear</p>
            <p className="text-sm text-muted-foreground">Add something in My work when you're ready.</p>
          </Card>
        )}
      </section>

      {/* Workload */}
      {!simplify && (
        <Card className="mt-5">
          <SectionTitle action={<WorkloadBadge level={assessment.level} label={assessment.label} />}>
            📊 How's the week looking?
          </SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-secondary/70 p-3">
              <p className="text-xs font-semibold text-muted-foreground">Work left</p>
              <p className="font-display text-2xl font-extrabold">
                {fmtDuration(assessment.remainingMinutes)}
              </p>
            </div>
            <div className="rounded-2xl bg-secondary/70 p-3">
              <p className="text-xs font-semibold text-muted-foreground">Realistic time</p>
              <p className="font-display text-2xl font-extrabold">
                {fmtDuration(assessment.capacityMinutes)}
              </p>
            </div>
          </div>
          <Meter
            className="mt-3"
            value={Math.min(100, assessment.ratio * 100)}
            tone={assessment.level === "manageable" ? "mint" : assessment.level === "pressured" ? "butter" : "primary"}
          />
          <p className="mt-2 text-sm text-muted-foreground">{assessment.reasons[0]}</p>
        </Card>
      )}

      {/* Rescue */}
      <Card className="mt-5 bg-mint-soft/70">
        <p className="font-bold">Feeling like it's too much?</p>
        <p className="mt-1 text-sm text-muted-foreground">
          No judgement. We'll shrink it down to what genuinely matters.
        </p>
        <Link to="/rescue" className="mt-3 block">
          <Button size="lg" className="pulse-ring w-full">
            <LifeBuoy className="h-5 w-5" /> I'm overwhelmed — rescue me
          </Button>
        </Link>
      </Card>

      {/* Today's plan */}
      <section className="mt-6">
        <SectionTitle
          action={
            <span className="text-xs font-bold text-mint-foreground">
              {plan.realism}% {plan.realismLabel}
            </span>
          }
        >
          📅 Today's game plan
        </SectionTitle>
        <Card className="space-y-2 p-4">
          {plan.blocks.length ? (
            plan.blocks.slice(0, simplify ? 3 : 8).map((b) => (
              <div key={b.id} className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
                <span className="w-24 shrink-0 rounded-xl bg-secondary px-2 py-1 text-center text-xs font-bold tabular-nums">
                  {b.start}–{b.end}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">
                    {b.kind === "study" ? b.title : b.kind === "break" ? "☕ " + b.title : "🌙 " + b.title}
                  </span>
                  {b.subject && <span className="text-xs text-muted-foreground">{b.subject}</span>}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No study blocks left today — rest up, tomorrow's plan is ready in Study.
            </p>
          )}
          <Link to="/study" className="block pt-1">
            <Button variant="soft" size="sm" className="w-full">
              See the full plan
            </Button>
          </Link>
        </Card>
      </section>

      {/* Deadlines */}
      {!simplify && (
        <section className="mt-6">
          <SectionTitle>⏰ What's coming up?</SectionTitle>
          <div className="space-y-2">
            {ranked.map((r) => (
              <Card key={r.task.id} hover className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate font-bold">{r.task.name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <SubjectPill subject={r.task.subject} />
                    <span className="text-xs font-semibold text-muted-foreground">
                      {fmtDuration(r.remaining)} left
                    </span>
                  </div>
                </div>
                <span className="shrink-0 text-xs font-bold text-primary">{fmtDue(r.task.due)}</span>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6">
        <SectionTitle
          action={<Sparkles className="h-4 w-4 text-primary" />}
        >
          💬 Ask Rescue Coach
        </SectionTitle>
        <RescueCoach />
      </section>

      <p className="py-8 text-center text-xs text-muted-foreground">
        When everything feels overwhelming, we'll tell you what to do next.
      </p>
    </main>
  );
}
