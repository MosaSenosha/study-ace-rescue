import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button, Card, Meter, SectionTitle, SubjectPill } from "@/components/bits";
import { RescueCoach } from "@/components/rescue-coach";
import { useIntelligence, useStore } from "@/lib/store";
import {
  fmtDue,
  fmtDuration,
  generatePlan,
  triage,
  type ScoredTask,
} from "@/lib/engine";
import { ArrowRight, HeartHandshake } from "lucide-react";

export const Route = createFileRoute("/rescue")({
  head: () => ({
    meta: [
      { title: "Rescue mode — Study Rescue" },
      {
        name: "description",
        content:
          "Overwhelmed? Rescue mode shrinks your workload to what genuinely matters and gives you one step at a time.",
      },
      { property: "og:title", content: "Rescue mode — Study Rescue" },
      { property: "og:description", content: "It's okay, let's reset. Here's what I'd focus on first." },
    ],
  }),
  component: RescuePage,
});

const STEPS = ["Assess", "Diagnose", "Prioritise", "Recover", "Go"] as const;

function RescuePage() {
  const store = useStore();
  const { assessment, now } = useIntelligence();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const buckets = useMemo(
    () => triage(store.tasks, assessment.capacityMinutes, store.sessions, now),
    [store.tasks, store.sessions, assessment.capacityMinutes, now],
  );

  const rescuePlan = useMemo(() => {
    const keep = new Set([...buckets.must, ...buckets.should].map((s) => s.task.id));
    return generatePlan(
      store.tasks.filter((t) => keep.has(t.id)),
      store.pattern,
      store.commitments,
      store.sessions,
      now,
      { rescue: true },
    );
  }, [buckets, store.tasks, store.pattern, store.commitments, store.sessions, now]);

  const first = buckets.must[0] ?? buckets.should[0];

  return (
    <main className="mx-auto max-w-lg px-4 pt-8">
      <header>
        <p className="text-4xl">🫶</p>
        <h1 className="mt-2 text-3xl font-extrabold leading-tight">It's okay, let's reset.</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          We'll figure this out together — nothing gets deleted, we just decide what comes first.
        </p>
      </header>

      <ol className="mt-6 flex gap-1.5">
        {STEPS.map((s, i) => (
          <li key={s} className="flex-1">
            <div
              className={`h-1.5 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-muted"}`}
            />
            <p className="mt-1 truncate text-[10px] font-bold text-muted-foreground">{s}</p>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <Card className="rise mt-6">
          <SectionTitle>Step 1 — Let's look at everything</SectionTitle>
          <p className="text-sm text-muted-foreground">
            I've read all {store.tasks.filter((t) => t.status === "active").length} open tasks, their
            deadlines, weightings, how hard they feel, and the study time you realistically have.
          </p>
          <div className="mt-4 space-y-2">
            {store.tasks
              .filter((t) => t.status === "active")
              .slice(0, 6)
              .map((t) => (
                <div key={t.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 text-sm">
                  <span className="truncate">{t.name}</span>
                  <span className="shrink-0 text-xs font-semibold text-muted-foreground">
                    {fmtDue(t.due)}
                  </span>
                </div>
              ))}
          </div>
          <Button className="mt-5 w-full" size="lg" onClick={() => setStep(1)}>
            Show me the damage <ArrowRight className="h-4 w-4" />
          </Button>
        </Card>
      )}

      {step === 1 && (
        <div className="rise mt-6 space-y-4">
          <Card>
            <SectionTitle>Step 2 — Here's the honest picture</SectionTitle>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl bg-secondary/70 p-3">
                <p className="font-display text-lg font-extrabold">
                  {fmtDuration(assessment.remainingMinutes)}
                </p>
                <p className="text-[11px] text-muted-foreground">work left</p>
              </div>
              <div className="rounded-2xl bg-secondary/70 p-3">
                <p className="font-display text-lg font-extrabold">
                  {fmtDuration(assessment.capacityMinutes)}
                </p>
                <p className="text-[11px] text-muted-foreground">realistic time</p>
              </div>
              <div className="rounded-2xl bg-coral-soft p-3">
                <p className="font-display text-lg font-extrabold text-primary">
                  {assessment.deficitMinutes ? fmtDuration(assessment.deficitMinutes) : "0"}
                </p>
                <p className="text-[11px] text-muted-foreground">gap</p>
              </div>
            </div>
            <Meter className="mt-4" value={Math.min(100, assessment.ratio * 100)} tone="primary" />
            <ul className="mt-4 space-y-1.5">
              {assessment.reasons.map((r) => (
                <li key={r} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="text-primary">•</span>
                  <span className="min-w-0">{r}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 rounded-2xl bg-mint-soft/70 p-3 text-sm">
              You still have time — you just can't have all of it at once. Let's pick.
            </p>
          </Card>
          <Button className="w-full" size="lg" onClick={() => setStep(2)}>
            Help me choose <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="rise mt-6 space-y-4">
          <SectionTitle>Step 3 — What should I do first?</SectionTitle>
          <Bucket title="🔴 Must do" hint="Biggest academic hit if it slips" items={buckets.must} />
          <Bucket title="🟠 Should do" hint="Important, but second in line" items={buckets.should} />
          <Bucket title="🟡 If time allows" hint="Nice to get to" items={buckets.maybe} />
          <Bucket
            title="⚪ Park for now"
            hint="Shrink, shorten or postpone — nothing is deleted"
            items={buckets.defer}
          />
          <Button className="w-full" size="lg" onClick={() => setStep(3)}>
            Build my recovery plan <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {step === 3 && (
        <div className="rise mt-6 space-y-4">
          <Card>
            <SectionTitle
              action={
                <span className="rounded-full bg-mint-soft px-3 py-1 text-xs font-bold text-mint-foreground">
                  {rescuePlan.realism}% achievable
                </span>
              }
            >
              Step 4 — Your recovery plan
            </SectionTitle>
            <div className="space-y-2">
              {rescuePlan.blocks.length ? (
                rescuePlan.blocks.map((b) => (
                  <div key={b.id} className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
                    <span className="w-24 shrink-0 rounded-xl bg-secondary px-2 py-1 text-center text-xs font-bold tabular-nums">
                      {b.start}–{b.end}
                    </span>
                    <span className="min-w-0 truncate text-sm font-semibold">
                      {b.kind === "break" ? "☕ " : b.kind === "buffer" ? "🌙 " : ""}
                      {b.title}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  There's no usable study time left today — your recovery starts first thing tomorrow.
                </p>
              )}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              This is deliberately smaller than everything you have. Finishing this beats attempting
              it all and finishing nothing.
            </p>
          </Card>
          <Button className="w-full" size="lg" onClick={() => setStep(4)}>
            One thing at a time <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {step === 4 && (
        <div className="rise mt-6 space-y-4">
          <Card className="p-6 text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Just this. Nothing else.
            </p>
            {first ? (
              <>
                <h2 className="mt-3 text-2xl font-extrabold leading-snug">{first.task.name}</h2>
                <div className="mt-2 flex justify-center">
                  <SubjectPill subject={first.task.subject} />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {fmtDuration(Math.min(45, first.remaining))} — that's all I'm asking for.
                </p>
                <div className="mt-4 rounded-2xl bg-secondary/70 p-3 text-left">
                  <p className="text-xs font-bold text-muted-foreground">Why this?</p>
                  <ul className="mt-1.5 space-y-1">
                    {first.reasons.slice(0, 3).map((r) => (
                      <li key={r} className="text-sm">
                        • {r}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  size="lg"
                  className="mt-5 w-full"
                  onClick={() => navigate({ to: "/study", search: { task: first.task.id } })}
                >
                  Start now
                </Button>
              </>
            ) : (
              <p className="mt-3 font-bold">Nothing urgent left — genuinely, take the evening.</p>
            )}
          </Card>
          <Card className="bg-mint-soft/70 text-center">
            <HeartHandshake className="mx-auto h-6 w-6 text-mint-foreground" />
            <p className="mt-2 text-sm font-semibold">You're not behind as a person. Just a plan.</p>
            <Link to="/" className="mt-3 block">
              <Button variant="soft" className="w-full">
                Back home
              </Button>
            </Link>
          </Card>
        </div>
      )}

      <div className="mt-8">
        <SectionTitle>Talk it through</SectionTitle>
        <RescueCoach compact />
      </div>
      <div className="h-8" />
    </main>
  );
}

function Bucket({
  title,
  hint,
  items,
}: {
  title: string;
  hint: string;
  items: ScoredTask[];
}) {
  return (
    <Card className="p-4">
      <p className="font-bold">{title}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
      <div className="mt-3 space-y-2">
        {items.length ? (
          items.map((s) => (
            <div key={s.task.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{s.task.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {s.task.subject} · {fmtDue(s.task.due)}
                </p>
              </div>
              <span className="shrink-0 text-xs font-bold text-muted-foreground">
                {fmtDuration(s.remaining)}
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Nothing here — good.</p>
        )}
      </div>
    </Card>
  );
}
