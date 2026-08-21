# Study Rescue

> **When everything feels overwhelming, we'll tell you what to do next.**

Study Rescue is an intelligent academic workload-management app built for university and college students. It analyses your deadlines, energy, and real available time, then tells you the single best thing to study right now.

## What it does

- **Workload Intelligence Engine** — looks at every task's deadline, weighting, difficulty, confidence, and remaining work to calculate realistic capacity.
- **Energy-aware planning** — schedules demanding work during your high-energy windows and lighter work when you're fried.
- **Smart prioritisation** — ranks tasks by academic consequence, not just due date.
- **Adaptive daily plan** — builds a plan you'll actually finish, with breaks and buffer time.
- **Rescue Mode** — one-tap triage when you're overwhelmed: Must do → Should do → If time allows → Park for now.
- **Focus timer** — distraction-free sessions that learn your real pace and improve future estimates.
- **Rescue Coach** — ask questions about your workload and get answers based on your actual tasks, not generic advice.

## Built with

- [TanStack Start](https://tanstack.com/start) — full-stack React framework
- [React 19](https://react.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)

## Getting started

```sh
# Install dependencies
bun install

# Run the dev server
bun run dev
```

The dev server starts at `http://localhost:8080`.

## Project structure

```
src/
  lib/
    engine.ts      # Workload Intelligence Engine (pure logic)
    store.tsx      # React state + localStorage persistence
  components/
    bits.tsx       # Shared UI primitives
    app-nav.tsx    # Mobile-first navigation
    rescue-coach.tsx # AI coach using real workload data
  routes/
    index.tsx      # Dashboard
    work.tsx       # Task list + creation
    study.tsx      # Daily plan + focus timer
    rescue.tsx     # Emergency Rescue Mode
    progress.tsx   # Stats + insights
    profile.tsx    # Energy pattern + settings
```

## Core concepts

- **Realistic capacity** — not every free minute is productive. The engine applies energy efficiency, breaks, meals, commitments, fatigue, and a safety buffer.
- **Realism score** — every generated plan is scored. A 4-hour plan you finish beats an 8-hour plan you abandon.
- **Dynamic replanning** — completing, missing, or delaying a task triggers a fresh plan rather than dumping missed work on tomorrow.
- **Learning** — actual session outcomes improve duration estimates and reveal your best study windows.

## Design philosophy

Study Rescue is intentionally calm, friendly, and mobile-first. It avoids corporate or school-management aesthetics in favour of the kind of app young people actually want to open every day.

## Data storage

This version stores data locally in your browser via `localStorage`. A cloud backend can be wired in later for multi-device sync and accounts.

## License

MIT — built with care for stressed students everywhere.
