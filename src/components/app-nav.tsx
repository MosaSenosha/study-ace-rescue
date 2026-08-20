import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Home, ListChecks, Timer, TrendingUp, User } from "lucide-react";

const items = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/work", label: "My work", Icon: ListChecks },
  { to: "/study", label: "Study", Icon: Timer },
  { to: "/progress", label: "Progress", Icon: TrendingUp },
  { to: "/profile", label: "Profile", Icon: User },
] as const;

export function AppNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto flex max-w-lg items-center justify-between gap-1 rounded-[2rem] border border-border/60 bg-card/90 p-1.5 shadow-[var(--shadow-lift)] backdrop-blur-xl">
        {items.map(({ to, label, Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "press flex flex-1 flex-col items-center gap-1 rounded-[1.5rem] py-2.5 text-[10px] font-bold transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={2.4} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
