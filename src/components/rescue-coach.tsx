import { useState } from "react";
import { Button, Card } from "./bits";
import { useIntelligence, useStore } from "@/lib/store";
import { COACH_SUGGESTIONS, coachReply } from "@/lib/engine";
import { Send } from "lucide-react";

interface Msg {
  role: "you" | "coach";
  text: string;
}

function render(text: string) {
  return text.split("\n").map((line, i) => (
    <p key={i} className={line.startsWith("•") ? "pl-1" : ""}>
      {line.split(/\*\*(.+?)\*\*/g).map((chunk, j) =>
        j % 2 === 1 ? (
          <strong key={j} className="font-bold text-foreground">
            {chunk}
          </strong>
        ) : (
          <span key={j}>{chunk}</span>
        ),
      )}
    </p>
  ));
}

export function RescueCoach({ compact }: { compact?: boolean }) {
  const store = useStore();
  const { assessment, plan, next } = useIntelligence();
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "coach",
      text: "Hey — I can see your actual tasks, deadlines and energy. Ask me anything and I'll answer from your real workload, not vibes.",
    },
  ]);
  const [q, setQ] = useState("");

  const ask = (text: string) => {
    if (!text.trim()) return;
    const reply = coachReply(text, {
      tasks: store.tasks,
      assessment,
      plan,
      energy: store.energy,
      sessions: store.sessions,
      next,
    });
    setMsgs((m) => [...m, { role: "you", text }, { role: "coach", text: reply }]);
    setQ("");
  };

  return (
    <Card className="p-4">
      <div className={compact ? "max-h-64 space-y-3 overflow-y-auto" : "space-y-3"}>
        {msgs.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "you"
                ? "ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-sm font-medium text-primary-foreground"
                : "max-w-[92%] space-y-1.5 rounded-2xl rounded-bl-md bg-secondary px-3.5 py-2.5 text-sm text-muted-foreground"
            }
          >
            {m.role === "coach" ? render(m.text) : m.text}
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {COACH_SUGGESTIONS.slice(0, 3).map((s) => (
          <button
            key={s}
            onClick={() => ask(s)}
            className="press rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
          >
            {s}
          </button>
        ))}
      </div>

      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          ask(q);
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ask your coach…"
          className="h-11 min-w-0 flex-1 rounded-full bg-secondary px-4 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <Button type="submit" size="md" className="px-4">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
}
