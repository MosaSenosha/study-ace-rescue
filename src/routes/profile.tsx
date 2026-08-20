import { createFileRoute } from "@tanstack/react-router";
import { Button, Card, EnergyPicker, SectionTitle } from "@/components/bits";
import { useStore } from "@/lib/store";
import { ENERGY_LABELS } from "@/lib/engine";
import { Moon, Sun } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Study Rescue" },
      {
        name: "description",
        content: "Set your name, your daily energy pattern and how long your typical study window is.",
      },
      { property: "og:title", content: "Profile — Study Rescue" },
      { property: "og:description", content: "Tune Study Rescue to how your days actually run." },
    ],
  }),
  component: ProfilePage,
});

export default function noop() {}

function ProfilePage() {
  const store = useStore();
  const dark = store.profile.theme === "dark";

  return (
    <main className="mx-auto max-w-lg px-4 pt-8">
      <h1 className="text-2xl font-extrabold">Profile</h1>
      <p className="text-sm text-muted-foreground">Make it work the way your days actually run.</p>

      <Card className="mt-5">
        <SectionTitle>What should I call you?</SectionTitle>
        <input
          value={store.profile.name}
          onChange={(e) => store.setProfile({ name: e.target.value })}
          className="h-11 w-full rounded-2xl bg-secondary px-4 text-sm outline-none focus:ring-2 focus:ring-ring"
          placeholder="Your name"
        />
      </Card>

      <Card className="mt-5">
        <SectionTitle
          action={
            <span className="text-xs font-bold text-muted-foreground">
              {ENERGY_LABELS[store.energy - 1]}
            </span>
          }
        >
          Energy right now
        </SectionTitle>
        <EnergyPicker value={store.energy} onChange={store.setEnergy} />
      </Card>

      <Card className="mt-5">
        <SectionTitle>Your typical day</SectionTitle>
        <p className="mb-3 text-sm text-muted-foreground">
          Tell me when you're sharp and when you're fried — I'll schedule around it.
        </p>
        <div className="space-y-3">
          {store.pattern.map((b, i) => (
            <div key={`${b.start}-${b.end}`} className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
              <span className="w-[5.5rem] shrink-0 rounded-xl bg-secondary px-2 py-1 text-center text-xs font-bold tabular-nums">
                {String(b.start).padStart(2, "0")}–{String(b.end).padStart(2, "0")}
              </span>
              <input
                type="range"
                min={1}
                max={5}
                value={b.level}
                aria-label={`Energy between ${b.start} and ${b.end}`}
                onChange={(e) => {
                  const next = store.pattern.map((x, j) =>
                    j === i ? { ...x, level: Number(e.target.value) } : x,
                  );
                  store.setPattern(next);
                }}
                className="w-full accent-[var(--primary)]"
              />
            </div>
          ))}
        </div>
      </Card>

      <Card className="mt-5">
        <SectionTitle>Typical free window</SectionTitle>
        <p className="mb-3 text-sm text-muted-foreground">
          How long is a normal gap you can actually study in? {store.profile.windowMinutes} minutes.
        </p>
        <input
          type="range"
          min={20}
          max={180}
          step={10}
          value={store.profile.windowMinutes}
          onChange={(e) => store.setProfile({ windowMinutes: Number(e.target.value) })}
          className="w-full accent-[var(--primary)]"
          aria-label="Typical free window in minutes"
        />
      </Card>

      <Card className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <p className="font-bold">{dark ? "Dark mode" : "Light mode"}</p>
          <p className="text-sm text-muted-foreground">Late-night study friendly.</p>
        </div>
        <Button
          variant="soft"
          size="sm"
          onClick={() => store.setProfile({ theme: dark ? "light" : "dark" })}
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          Switch
        </Button>
      </Card>

      <Card className="mt-5">
        <SectionTitle>Start fresh</SectionTitle>
        <p className="mb-3 text-sm text-muted-foreground">
          Clears your tasks and history and loads the demo workload again.
        </p>
        <Button variant="outline" onClick={() => store.reset()}>
          Reset everything
        </Button>
      </Card>
      <div className="h-6" />
    </main>
  );
}
