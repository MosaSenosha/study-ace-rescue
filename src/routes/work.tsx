import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Button,
  Card,
  Meter,
  SectionTitle,
  SubjectPill,
  TaskEmoji,
} from "@/components/bits";
import { useStore } from "@/lib/store";
import {
  estimationMultiplier,
  fmtDue,
  fmtDuration,
  prioritise,
  remainingMinutes,
  type Task,
  type TaskType,
} from "@/lib/engine";
import { cn } from "@/lib/utils";
import { CalendarPlus, Check, ChevronDown, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/work")({
  head: () => ({
    meta: [
      { title: "My work — Study Rescue" },
      {
        name: "description",
        content: "Every assignment, exam and reading in one calm list, ranked by what actually matters.",
      },
      { property: "og:title", content: "My work — Study Rescue" },
      { property: "og:description", content: "Your whole workload, ranked by academic consequence." },
    ],
  }),
  component: WorkPage,
});

const TYPES: TaskType[] = [
  "assignment",
  "exam",
  "test",
  "project",
  "reading",
  "problem-set",
  "revision",
  "lecture",
  "other",
];

function WorkPage() {
  const store = useStore();
  const [adding, setAdding] = useState(false);
  const [tab, setTab] = useState<"active" | "done">("active");
  const mult = estimationMultiplier(store.sessions);

  const ranked = useMemo(() => prioritise(store.tasks, mult), [store.tasks, mult]);
  const done = store.tasks.filter((t) => t.status === "done");

  return (
    <main className="mx-auto max-w-lg px-4 pt-8">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-extrabold">My work</h1>
          <p className="text-sm text-muted-foreground">Ranked by what actually matters.</p>
        </div>
        <Button size="sm" onClick={() => setAdding((v) => !v)}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </header>

      {adding && (
        <div className="rise mt-4">
          <TaskForm
            onCancel={() => setAdding(false)}
            onSave={(t) => {
              store.addTask(t);
              setAdding(false);
            }}
          />
        </div>
      )}

      <div className="mt-5 flex gap-2 rounded-full bg-secondary p-1">
        {(
          [
            ["active", `To do (${ranked.length})`],
            ["done", `You smashed these 💪 (${done.length})`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "press flex-1 truncate rounded-full py-2 text-xs font-bold transition-colors",
              tab === key ? "bg-card text-foreground shadow-[var(--shadow-soft)]" : "text-muted-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {tab === "active" &&
          (ranked.length ? (
            ranked.map((r, i) => (
              <TaskRow key={r.task.id} task={r.task} rank={i + 1} remaining={r.remaining} />
            ))
          ) : (
            <Card className="text-center">
              <p className="text-3xl">🌱</p>
              <p className="mt-2 font-bold">Nothing on your plate</p>
              <p className="text-sm text-muted-foreground">Add your first task and I'll plan it for you.</p>
            </Card>
          ))}

        {tab === "done" &&
          (done.length ? (
            done.map((t) => (
              <Card key={t.id} className="flex items-center gap-3 py-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-mint-soft text-mint-foreground">
                  <Check className="h-4 w-4" strokeWidth={3} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold line-through decoration-muted-foreground/60">
                    {t.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.subject}</p>
                </div>
                <button
                  aria-label="Delete task"
                  onClick={() => store.deleteTask(t.id)}
                  className="press text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </Card>
            ))
          ) : (
            <Card className="text-center">
              <p className="text-3xl">🏁</p>
              <p className="mt-2 font-bold">Nothing finished yet</p>
              <p className="text-sm text-muted-foreground">Your wins will show up here.</p>
            </Card>
          ))}
      </div>
    </main>
  );
}

function TaskRow({ task, rank, remaining }: { task: Task; rank: number; remaining: number }) {
  const store = useStore();
  const [open, setOpen] = useState(false);
  const [newSub, setNewSub] = useState("");

  return (
    <Card hover className="p-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 text-left"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-secondary text-lg">
          <TaskEmoji task={task} />
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-2">
            <span className="truncate font-bold">{task.name}</span>
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-2">
            <SubjectPill subject={task.subject} />
            <span className="text-xs font-semibold text-muted-foreground">
              {fmtDue(task.due)} · {fmtDuration(remaining)} left
            </span>
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {rank <= 2 && (
            <span className="rounded-full bg-coral-soft px-2 py-1 text-[10px] font-extrabold text-primary">
              #{rank}
            </span>
          )}
          <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
        </span>
      </button>

      <div className="mt-3">
        <Meter value={task.completion} tone={task.completion >= 60 ? "mint" : "primary"} />
        <p className="mt-1 text-xs text-muted-foreground">{task.completion}% done</p>
      </div>

      {open && (
        <div className="rise mt-4 space-y-4 border-t border-border pt-4">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              ["Difficulty", `${task.difficulty}/5`],
              ["Importance", `${task.importance}/5`],
              ["Confidence", `${task.confidence}/5`],
              ["Energy needed", `${task.energyRequired}/5`],
              ["Estimate", fmtDuration(task.estMinutes)],
              ["Weighting", task.weighting ? `${task.weighting}%` : "—"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-secondary/70 px-3 py-2">
                <p className="text-[10px] font-semibold text-muted-foreground">{k}</p>
                <p className="font-bold">{v}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="mb-2 text-xs font-bold text-muted-foreground">Break it into steps</p>
            <div className="space-y-1.5">
              {task.subtasks.map((s) => (
                <button
                  key={s.id}
                  onClick={() => store.toggleSubtask(task.id, s.id)}
                  className="press flex w-full items-center gap-2 rounded-xl bg-secondary/70 px-3 py-2 text-left text-sm"
                >
                  <span
                    className={cn(
                      "grid h-5 w-5 shrink-0 place-items-center rounded-full border-2",
                      s.done ? "border-mint bg-mint text-card" : "border-border",
                    )}
                  >
                    {s.done && <Check className="h-3 w-3" strokeWidth={3} />}
                  </span>
                  <span className={cn("truncate", s.done && "text-muted-foreground line-through")}>
                    {s.name}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <input
                value={newSub}
                onChange={(e) => setNewSub(e.target.value)}
                placeholder="Add a step…"
                className="h-10 min-w-0 flex-1 rounded-full bg-secondary px-4 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <Button
                size="sm"
                variant="soft"
                onClick={() => {
                  if (!newSub.trim()) return;
                  store.addSubtask(task.id, newSub.trim());
                  setNewSub("");
                }}
              >
                Add
              </Button>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold text-muted-foreground">Progress</p>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={task.completion}
              onChange={(e) => store.updateTask(task.id, { completion: Number(e.target.value) })}
              className="w-full accent-[var(--primary)]"
              aria-label="Completion percentage"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="soft" onClick={() => store.completeTask(task.id)}>
              <Check className="h-4 w-4" /> Done
            </Button>
            <Button size="sm" variant="soft" onClick={() => store.postponeTask(task.id, 1)}>
              <CalendarPlus className="h-4 w-4" /> +1 day
            </Button>
            <Button size="sm" variant="ghost" onClick={() => store.deleteTask(task.id)}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function Slider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-muted-foreground">
        {label}: {value}/5
      </span>
      <input
        type="range"
        min={1}
        max={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full accent-[var(--primary)]"
      />
    </label>
  );
}

function TaskForm({
  onSave,
  onCancel,
}: {
  onSave: (t: Partial<Task> & { name: string; subject: string }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [type, setType] = useState<TaskType>("assignment");
  const [due, setDue] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().slice(0, 10);
  });
  const [hours, setHours] = useState(2);
  const [difficulty, setDifficulty] = useState(3);
  const [importance, setImportance] = useState(3);
  const [confidence, setConfidence] = useState(3);
  const [weighting, setWeighting] = useState("");

  const input =
    "h-11 w-full min-w-0 rounded-2xl bg-secondary px-4 text-sm outline-none focus:ring-2 focus:ring-ring";

  return (
    <Card className="space-y-3">
      <h3 className="font-bold">What's on your plate?</h3>
      <input
        className={input}
        placeholder="Task name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          className={input}
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <select className={input} value={type} onChange={(e) => setType(e.target.value as TaskType)}>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <input className={input} type="date" value={due} onChange={(e) => setDue(e.target.value)} />
        <input
          className={input}
          type="number"
          min={0.5}
          step={0.5}
          value={hours}
          onChange={(e) => setHours(Number(e.target.value))}
          aria-label="Estimated hours"
        />
      </div>
      <input
        className={input}
        placeholder="Worth % of module (optional)"
        value={weighting}
        onChange={(e) => setWeighting(e.target.value)}
        inputMode="numeric"
      />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Slider label="How hard" value={difficulty} onChange={setDifficulty} />
        <Slider label="How important" value={importance} onChange={setImportance} />
        <Slider label="How confident" value={confidence} onChange={setConfidence} />
      </div>
      <div className="flex gap-2">
        <Button
          className="flex-1"
          disabled={!name.trim() || !subject.trim()}
          onClick={() =>
            onSave({
              name: name.trim(),
              subject: subject.trim(),
              type,
              due: new Date(`${due}T17:00:00`).toISOString(),
              estMinutes: Math.round(hours * 60),
              difficulty,
              importance,
              confidence,
              energyRequired: Math.min(5, Math.max(1, difficulty)),
              ...(weighting ? { weighting: Number(weighting) } : {}),
            })
          }
        >
          Save task
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Card>
  );
}

export { remainingMinutes };
