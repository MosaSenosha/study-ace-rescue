import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { ENERGY_LABELS, type Task, type WorkloadLevel } from "@/lib/engine";

export function Card({
  className,
  children,
  hover,
}: {
  className?: string;
  children: ReactNode;
  hover?: boolean;
}) {
  return (
    <div className={cn("card-soft p-5", hover && "card-hover", className)}>{children}</div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
      <h2 className="truncate text-lg font-bold">{children}</h2>
      {action}
    </div>
  );
}

const subjectPalette = ["mint", "sky", "butter", "primary"] as const;

export function subjectTone(subject: string) {
  let h = 0;
  for (const c of subject) h = (h * 31 + c.charCodeAt(0)) % 997;
  return subjectPalette[h % subjectPalette.length]!;
}

export function SubjectPill({ subject, className }: { subject: string; className?: string }) {
  const tone = subjectTone(subject);
  const map = {
    mint: "bg-mint-soft text-mint-foreground",
    sky: "bg-sky-soft text-sky-foreground",
    butter: "bg-butter-soft text-butter-foreground",
    primary: "bg-coral-soft text-primary",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center truncate rounded-full px-2.5 py-1 text-xs font-semibold",
        map[tone],
        className,
      )}
    >
      {subject}
    </span>
  );
}

const levelStyles: Record<WorkloadLevel, string> = {
  manageable: "bg-mint-soft text-mint-foreground",
  pressured: "bg-butter-soft text-butter-foreground",
  overloaded: "bg-coral-soft text-primary",
  critical: "bg-destructive/12 text-destructive",
};

export function WorkloadBadge({ level, label }: { level: WorkloadLevel; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
        levelStyles[level],
      )}
    >
      <span className="h-2 w-2 rounded-full bg-current" />
      {label}
    </span>
  );
}

export function Meter({
  value,
  tone = "primary",
  className,
}: {
  value: number;
  tone?: "primary" | "mint" | "sky" | "butter" | "destructive";
  className?: string;
}) {
  const bg = {
    primary: "bg-primary",
    mint: "bg-mint",
    sky: "bg-sky",
    butter: "bg-butter",
    destructive: "bg-destructive",
  }[tone];
  return (
    <div className={cn("h-2.5 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-700", bg)}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className,
  type = "button",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "soft" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const variants = {
    primary: "bg-primary text-primary-foreground shadow-[var(--shadow-glow)] hover:brightness-105",
    soft: "bg-secondary text-secondary-foreground hover:bg-muted",
    ghost: "text-muted-foreground hover:bg-secondary",
    outline: "border-2 border-border bg-card hover:bg-secondary",
    danger: "bg-destructive text-destructive-foreground hover:brightness-105",
  }[variant];
  const sizes = {
    sm: "h-9 px-3.5 text-sm",
    md: "h-11 px-5 text-sm",
    lg: "h-14 px-6 text-base",
  }[size];
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "press inline-flex items-center justify-center gap-2 rounded-full font-bold disabled:pointer-events-none disabled:opacity-50",
        variants,
        sizes,
        className,
      )}
    >
      {children}
    </button>
  );
}

export function EnergyPicker({
  value,
  onChange,
  compact,
}: {
  value: number;
  onChange: (n: number) => void;
  compact?: boolean;
}) {
  return (
    <div className="flex gap-2">
      {ENERGY_LABELS.map((label, i) => {
        const n = i + 1;
        const active = value === n;
        return (
          <button
            key={label}
            onClick={() => onChange(n)}
            aria-pressed={active}
            aria-label={label}
            className={cn(
              "press flex-1 rounded-2xl py-2.5 text-center transition-colors",
              active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-muted",
            )}
          >
            <span className="block text-base leading-none">{["😵", "🥱", "🙂", "😃", "⚡"][i]}</span>
            {!compact && <span className="mt-1 block text-[10px] font-bold">{label}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: string }) {
  return (
    <div className="rounded-2xl bg-secondary/70 p-4">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-xl font-bold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function TaskEmoji({ task }: { task: Task }) {
  const map: Record<string, string> = {
    assignment: "📝",
    exam: "🎓",
    test: "🧪",
    project: "🛠️",
    reading: "📖",
    "problem-set": "🔢",
    revision: "🔁",
    lecture: "🎧",
    other: "✨",
  };
  return <span aria-hidden>{map[task.type] ?? "✨"}</span>;
}
