import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_ENERGY_PATTERN,
  assessWorkload,
  estimationMultiplier,
  generatePlan,
  nextMove,
  uid,
  type Commitment,
  type EnergyBlock,
  type SessionLog,
  type Task,
} from "./engine";

export interface Profile {
  name: string;
  windowMinutes: number;
  theme: "light" | "dark";
}

interface State {
  tasks: Task[];
  energy: number;
  pattern: EnergyBlock[];
  commitments: Commitment[];
  sessions: SessionLog[];
  profile: Profile;
  dismissedAt: string | null;
}

const KEY = "study-rescue-v1";

function iso(daysFromNow: number, hour = 23) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

function seed(): State {
  const t = (p: Partial<Task> & { name: string; subject: string }): Task => ({
    id: uid(),
    type: "assignment",
    due: iso(3),
    estMinutes: 120,
    difficulty: 3,
    importance: 3,
    completion: 0,
    confidence: 3,
    energyRequired: 3,
    status: "active",
    subtasks: [],
    createdAt: new Date().toISOString(),
    ...p,
  });
  return {
    tasks: [
      t({
        name: "Statistics Assignment — Q1–8",
        subject: "Statistics",
        type: "problem-set",
        due: iso(2, 17),
        estMinutes: 240,
        difficulty: 5,
        importance: 5,
        confidence: 2,
        energyRequired: 5,
        weighting: 20,
        completion: 25,
        subtasks: [
          { id: uid(), name: "Questions 1–3", done: true },
          { id: uid(), name: "Questions 4–6", done: false },
          { id: uid(), name: "Questions 7–8 + write-up", done: false },
        ],
      }),
      t({
        name: "Economics Essay — Intro & argument",
        subject: "Economics",
        due: iso(4, 12),
        estMinutes: 300,
        difficulty: 4,
        importance: 4,
        confidence: 3,
        energyRequired: 4,
        weighting: 25,
        completion: 10,
      }),
      t({
        name: "Quantitative Modelling exam prep",
        subject: "Quant Modelling",
        type: "exam",
        due: iso(6, 9),
        estMinutes: 420,
        difficulty: 5,
        importance: 5,
        confidence: 2,
        energyRequired: 5,
        weighting: 40,
      }),
      t({
        name: "Chapter 6 & 7 reading",
        subject: "Marketing",
        type: "reading",
        due: iso(3, 20),
        estMinutes: 90,
        difficulty: 2,
        importance: 2,
        confidence: 4,
        energyRequired: 2,
      }),
      t({
        name: "Lecture catch-up: weeks 4–5",
        subject: "Economics",
        type: "lecture",
        due: iso(5, 20),
        estMinutes: 120,
        difficulty: 1,
        importance: 2,
        confidence: 4,
        energyRequired: 1,
      }),
      t({
        name: "Group project — my section",
        subject: "Business Systems",
        type: "project",
        due: iso(7, 18),
        estMinutes: 180,
        difficulty: 3,
        importance: 4,
        confidence: 3,
        energyRequired: 3,
        weighting: 15,
      }),
    ],
    energy: 4,
    pattern: DEFAULT_ENERGY_PATTERN,
    commitments: [
      { id: uid(), name: "Lectures", day: new Date().getDay(), start: 11, end: 13 },
    ],
    sessions: [],
    profile: { name: "there", windowMinutes: 60, theme: "light" },
    dismissedAt: null,
  };
}

interface Ctx extends State {
  addTask: (t: Partial<Task> & { name: string; subject: string }) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  postponeTask: (id: string, days: number) => void;
  toggleSubtask: (taskId: string, subId: string) => void;
  addSubtask: (taskId: string, name: string) => void;
  setEnergy: (n: number) => void;
  setPattern: (p: EnergyBlock[]) => void;
  setProfile: (p: Partial<Profile>) => void;
  logSession: (s: Omit<SessionLog, "id" | "at">) => void;
  dismissAlert: () => void;
  reset: () => void;
}

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => seed());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...seed(), ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, hydrated]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", state.profile.theme === "dark");
  }, [state.profile.theme]);

  const value = useMemo<Ctx>(() => {
    const patch = (fn: (s: State) => State) => setState(fn);
    return {
      ...state,
      addTask: (t) =>
        patch((s) => ({
          ...s,
          tasks: [
            {
              id: uid(),
              type: "assignment",
              due: iso(3),
              estMinutes: 120,
              difficulty: 3,
              importance: 3,
              completion: 0,
              confidence: 3,
              energyRequired: 3,
              status: "active",
              subtasks: [],
              createdAt: new Date().toISOString(),
              ...t,
            } as Task,
            ...s.tasks,
          ],
        })),
      updateTask: (id, p) =>
        patch((s) => ({
          ...s,
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...p } : t)),
        })),
      deleteTask: (id) => patch((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) })),
      completeTask: (id) =>
        patch((s) => ({
          ...s,
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, status: "done" as const, completion: 100 } : t,
          ),
        })),
      postponeTask: (id, days) =>
        patch((s) => ({
          ...s,
          tasks: s.tasks.map((t) => {
            if (t.id !== id) return t;
            const d = new Date(t.due);
            d.setDate(d.getDate() + days);
            return { ...t, due: d.toISOString() };
          }),
        })),
      toggleSubtask: (taskId, subId) =>
        patch((s) => ({
          ...s,
          tasks: s.tasks.map((t) => {
            if (t.id !== taskId) return t;
            const subtasks = t.subtasks.map((x) => (x.id === subId ? { ...x, done: !x.done } : x));
            const pct = Math.round((subtasks.filter((x) => x.done).length / subtasks.length) * 100);
            return { ...t, subtasks, completion: pct };
          }),
        })),
      addSubtask: (taskId, name) =>
        patch((s) => ({
          ...s,
          tasks: s.tasks.map((t) =>
            t.id === taskId ? { ...t, subtasks: [...t.subtasks, { id: uid(), name, done: false }] } : t,
          ),
        })),
      setEnergy: (n) => patch((s) => ({ ...s, energy: n })),
      setPattern: (p) => patch((s) => ({ ...s, pattern: p })),
      setProfile: (p) => patch((s) => ({ ...s, profile: { ...s.profile, ...p } })),
      logSession: (log) =>
        patch((s) => ({
          ...s,
          sessions: [{ ...log, id: uid(), at: new Date().toISOString() }, ...s.sessions].slice(0, 200),
        })),
      dismissAlert: () => patch((s) => ({ ...s, dismissedAt: new Date().toISOString() })),
      reset: () => setState(seed()),
    };
  }, [state]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

/** Derived, memoised intelligence for the current state. */
export function useIntelligence() {
  const { tasks, pattern, commitments, sessions, energy, profile } = useStore();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(i);
  }, []);

  return useMemo(() => {
    const assessment = assessWorkload(tasks, pattern, commitments, sessions, now);
    const plan = generatePlan(tasks, pattern, commitments, sessions, now);
    const next = nextMove(tasks, energy, profile.windowMinutes, sessions, now);
    return { assessment, plan, next, now, multiplier: estimationMultiplier(sessions) };
  }, [tasks, pattern, commitments, sessions, energy, profile.windowMinutes, now]);
}
