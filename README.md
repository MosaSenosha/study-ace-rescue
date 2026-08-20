# Study Flow

Study Rescue — AI Web Application Build Prompt

ROLE

You are a senior product designer, UX/UI designer, full-stack engineer, and AI systems architect tasked with designing and building a polished, production-quality web application for university and college students.

You are responsible for:

Product architecture

User experience

Interface design

Workload analysis logic

Intelligent study-plan generation

Emergency workload recovery

Adaptive scheduling

AI-assisted recommendations

Responsive frontend development

Backend/data architecture

Accessibility

Performance

Scalability

The application must feel like a real, intelligent student-support product, not a generic to-do list or calendar.

PRODUCT NAME

Study Rescue

Tagline

When everything feels overwhelming, we'll tell you what to do next.

Study Rescue is an intelligent academic workload-management application that helps students understand their workload, determine what is realistically achievable, prioritise what matters most, and generate an adaptive study plan.

PRIMARY OBJECTIVE

The primary objective of Study Rescue is to analyse a student's entire academic workload and create the most realistic plan possible based on their urgency, estimated workload, difficulty, available time, commitments, and current energy level.

The application must answer:

“Given everything I need to do, the time I actually have, and the energy I actually have, what should I do next?”

Study Rescue should transform:

“I have too much to do and I don't know where to start.”

into:

“I know exactly what I should do right now, why I should do it, and what comes next.”

The application must prioritise realistic completion and academic impact, rather than simply encouraging students to work longer hours.

REQUIREMENTS

1. Workload Intelligence Engine

Build a central Workload Intelligence Engine that continuously analyses all outstanding academic work.

For every task, consider:

Deadline

Urgency

Academic importance

Assessment weighting

Estimated duration

Estimated difficulty

Current completion percentage

Student confidence

Remaining work

Required energy

Available study time

Time of day

Student's current energy

Upcoming commitments

Task dependencies

Historical task completion behaviour

The system must not simply sort tasks chronologically.

It should determine the relative consequence of completing or failing to complete each task.

2. Task Management

Students must be able to create and manage:

Assignments

Exams

Tests

Projects

Readings

Problem sets

Revision sessions

Lectures

Other academic tasks

Each task should support:

Task name

Subject/module

Due date

Estimated duration

Difficulty: 1–5

Importance: 1–5

Completion percentage

Confidence level

Required energy

Notes

Optional assessment weighting

Allow tasks to be:

Created

Edited

Completed

Postponed

Deleted

Split into subtasks

3. Student Energy System

Energy must be a core planning variable, not an optional wellness feature.

Ask:

“How much energy do you have right now?”

Use:

Exhausted

Low

Average

Good

Very high

Allow students to define typical energy patterns throughout the day.

Example:

TimeEnergy08:00–10:00High10:00–13:00Medium13:00–15:00Low18:00–21:00High

Use energy to determine which tasks should be scheduled.

High-energy periods

Prioritise:

Difficult problem solving

New concepts

Complex assignments

Exam preparation

Mathematics/statistics

Concentrated writing

Low-energy periods

Prioritise:

Reading

Flashcards

Reviewing notes

Watching lectures

Light revision

Organisation

Administrative academic work

Never schedule demanding work during a student's lowest-energy period if a suitable higher-energy period is available.

4. Realistic Capacity Engine

Calculate the difference between:

Available time

and

Realistic productive capacity.

For example:

Available time: 6 hours

Realistic capacity: 4 hours 15 minutes

The calculation should consider:

Energy

Previous study duration

Breaks

Meals

Existing commitments

Fatigue

Time of day

Historical productivity

Buffer requirements

Never assume that every free minute is productive study time.

5. Workload Assessment

Calculate:

Remaining Work

Estimated Duration × Remaining Percentage

Then compare:

Total Remaining Work

against

Realistic Available Capacity

Example:

Remaining workload: 31 hours

Realistic capacity: 22 hours

🔴 9-hour capacity deficit

Classify the workload as:

🟢 Manageable

Sufficient capacity.

🟡 Pressured

Achievable but requires discipline.

🟠 Overloaded

More work than realistic capacity.

🔴 Critical

The student cannot realistically complete everything before the relevant deadlines.

The system should explain why the student is overloaded.

6. Intelligent Prioritisation

Create an intelligent priority score using:

Urgency

Deadline risk

Academic importance

Assessment weighting

Remaining workload

Difficulty

Student confidence

Energy requirements

Available time

Dependencies

The guiding principle is:

Priority should represent the academic consequence of not completing a task, not simply how soon it is due.

7. Adaptive Study Planner

Automatically create daily and weekly study plans.

The plan should determine:

What to study

When to study it

How long to study

Which tasks require high energy

Which tasks can be completed during low-energy periods

When to take breaks

How much buffer time to preserve

Example:

09:00–10:30

Economics Assignment

10:30–10:45

Break

10:45–11:45

Quantitative Modelling Revision

11:45–12:15

Buffer

18:00–18:45

Statistics Revision

Do not create unrealistic schedules simply to fit every task into the calendar.

8. Plan Realism Score

Every generated plan should have a Realism Score.

Example:

87% — Highly achievable

Calculate the score using:

Available capacity

Workload

Difficulty

Energy alignment

Number of sessions

Breaks

Deadline pressure

Historical completion rate

Buffer time

If the plan is unrealistic, automatically revise it.

The system should prioritise:

A 4-hour plan that the student actually completes over an 8-hour plan that looks impressive but fails.

9. 🚨 Emergency Rescue Mode

Emergency Rescue Mode is a core feature, not an optional extra.

Place a highly visible button on the dashboard:

🚨 I'M OVERWHELMED — RESCUE ME

The system should also recommend Rescue Mode automatically when the workload becomes critical.

Example:

🔴 Your workload is currently critical.

You have 31 hours of work remaining but approximately 20 realistic study hours before your deadlines.

[ START RESCUE MODE ]

Rescue Mode Workflow

When activated:

Step 1 — Assess

Analyse:

All outstanding tasks

Deadlines

Remaining workload

Available time

Energy

Difficulty

Academic importance

Assessment weighting

Student commitments

Step 2 — Diagnose

Show the student:

31h remaining workload

20h realistic capacity

11h deficit

Explain what is creating the overload.

Step 3 — Prioritise

Divide work into:

🔴 MUST DO

Highest academic and deadline impact.

🟠 SHOULD DO

Important but secondary.

🟡 IF TIME ALLOWS

Lower-impact work.

⚪ DEFER / REDUCE

Work that could potentially be postponed, shortened, or deprioritised.

Never automatically delete academic tasks.

Step 4 — Recover

Generate a realistic emergency recovery plan.

Step 5 — Execute

Move the student into a focused One Thing at a Time experience.

10. One Thing at a Time

During Rescue Mode, minimise cognitive overload.

Instead of displaying the student's entire workload, show:

Your next move

Complete Questions 1–3 of the Statistics Assignment

45 minutes

Why this task?

Due in 2 days

High academic impact

Current energy is suitable

Fits the available time window

[ START ]

The student should be able to focus on one immediate action without being overwhelmed by everything else.

11. Dynamic Replanning

The plan must continuously adapt.

Recalculate when:

A task is completed

A task takes longer than expected

A task is completed early

A student misses a session

Energy changes

A deadline changes

A new task is added

The student becomes unavailable

Do not simply push missed work into the next day.

Redistribute it intelligently.

Example:

“You missed your evening session. I've moved the highest-priority 30 minutes to tomorrow and left the rest unchanged so you don't become overloaded.”

12. “What Should I Do Right Now?”

This should be the primary dashboard action.

The system should calculate the optimal next task using:

Current time + current energy + available time + urgency + difficulty + academic impact + task dependencies

Display:

🎯 Your Next Move

Quantitative Modelling — Practice Questions

45 minutes

High priority · Good energy match

Why now?

Exam in 5 days

High academic weighting

Requires concentration

Current energy is high

Fits the available 60-minute window

[ START ]

13. Focus Mode

When the student starts a task, enter a distraction-free Focus Mode.

Display:

Task

Timer

Remaining time

Progress

Pause

Break

Complete

After the session:

How did that go?

Options:

Finished

Partially finished

Didn't finish

Finished faster than expected

Use this information to improve future estimates.

14. Learning From Student Behaviour

Over time, Study Rescue should learn:

Actual vs estimated task duration

Typical study capacity

Best study periods

Energy patterns

Frequently postponed tasks

Subject-specific difficulty

Completion rates

Example:

“You usually estimate assignments at 2 hours, but they take approximately 3 hours. I've adjusted your future plans.”

The system should become increasingly personalised.

15. Dashboard

The dashboard should immediately communicate:

Good evening 👋

Let's focus on what matters.

🔋 Energy

4 / 5 — Good

📊 Workload

🟠 Pressured

18h remaining

15h realistic capacity

🎯 Your Next Move

Economics Assignment — Introduction

45 minutes

High priority · Good energy match

[ START ]

🚨 Emergency Rescue

Feeling overwhelmed?

[ I'M OVERWHELMED — RESCUE ME ]

📅 Today's Plan

Display the student's realistic schedule.

⏰ Upcoming Deadlines

Display only the most important upcoming deadlines.

16. AI Rescue Coach

Include an AI assistant called Rescue Coach.

The AI must have access to the application's actual workload data.

Students can ask:

“What should I study tonight?”

“I only have two hours. What should I do?”

“I'm exhausted. What can I realistically accomplish?”

“I missed yesterday. What should I do?”

“Which assignment should I start?”

“Can I realistically finish everything this week?”

The AI must use:

Actual tasks

Deadlines

Available time

Energy

Difficulty

Workload

Academic importance

It must not generate generic motivational advice or plans disconnected from the workload engine.

17. Automatic Rescue Detection

Continuously monitor workload.

When:

Remaining Work > Realistic Capacity

calculate the severity of the deficit.

Use:

🟡 Slight pressure

🟠 Overloaded

🔴 Critical

When critical, display:

🚨 Your workload needs attention

You currently have more work than you can realistically complete before your deadlines.

[ RESCUE MY SCHEDULE ]

The student can dismiss the notification.

18. User Interface Requirements

The interface must be:

Modern

Clean

Calm

Student-focused

Mobile-first

Responsive

Accessible

Fast

Intuitive

Use:

Clear visual hierarchy

Rounded cards

Simple navigation

Progress indicators

Subtle animations

Meaningful icons

Green/amber/red workload states

Light and dark mode

When workload is manageable, provide more information and analytics.

When workload becomes critical, simplify the interface and focus the student on:

What is happening → What matters → What should I do next?

19. Technical Requirements

Build the application using a scalable modern architecture.

Include:

User authentication

Persistent database

User profiles

Subjects/modules

Task CRUD

Deadline management

Study-session tracking

Calendar/scheduling

Workload analysis engine

Capacity calculation

Energy model

Priority engine

Emergency Rescue Mode

Dynamic replanning

Focus timer

Progress tracking

AI integration

Notification system

Responsive frontend

Secure backend

Accessible UI

Modular, maintainable code

All primary buttons and interactions must be functional.

Do not create static mock-up screens.

20. Success Criteria

Study Rescue is successful if a student who enters a large, overwhelming workload can quickly understand:

How much work they actually have

How much work they can realistically complete

Whether they are on track or overloaded

Which tasks matter most

What task matches their current energy

What they should do right now

What can safely wait

How to recover if they fall behind

The defining feature of Study Rescue is the combination of:

Workload Analysis + Realistic Capacity + Energy Matching + Intelligent Prioritisation + Adaptive Planning + Emergency Rescue Mode

The final product should feel like an intelligent academic emergency-management system, not another generic productivity app.                                                                                            For visuals, make it feel cool, youthful,welcoming and exciting for young students. The app should not feel intimidating, overly academic, corporate or like a traditional school management. It should feel like an app that young people would actually enjoy opening and using every day. Overall vibe: Cool, modern, youthful, relaxed,friendly, motivating, slightly playful and minimal but visually interesting                                                                                                                                   Think of the design language of modern apps like Spotify, Duolingo, Notion and other popular apps used by young people. Take inspiration from their simplicity and personality without copying their design.                                                                                                                                                              Colours

Use a fresh, youthful colour palette.

Use a soft off-white or very light neutral background instead of harsh white.

Introduce one strong signature accent colour throughout the app.

Add 2–3 complementary pastel/accent colours for different subjects, tasks, and progress indicators.

Keep the colours cohesive rather than making every section a different colour.

Avoid overly dark, dull, or corporate colours.

Avoid making the app look childish or like a children's learning platform.

The colours should make students feel calm and motivated rather than stressed.

Typography

Use a modern, friendly, rounded sans-serif font.

Make headings bold and expressive.

Keep body text simple and highly readable.

Use different font weights to create hierarchy.

Avoid traditional academic-looking fonts.

Make important information visually obvious without making everything bold.

Dashboard

The dashboard should immediately feel welcoming.

Instead of presenting students with a wall of tasks, create a friendly introduction such as:

“Hey! What are we tackling today?”

Show the student's most important task in a visually appealing card.

Include a simple “What should I do now?” button and make the “I’m overwhelmed” feature highly visible but comforting rather than alarming.

Use short, conversational wording throughout the app instead of formal academic language.

For example:

Instead of:

“Upcoming Academic Obligations”

Use:

“What’s coming up?”

Instead of:

“Task Prioritisation”

Use:

“What should I do first?”

Instead of:

“Completed Assignments”

Use:

“You smashed these 💪”

Cards and Components

Use rounded cards with subtle shadows.

Avoid excessive borders and rigid grids.

Use plenty of whitespace.

Add small animations and hover effects where appropriate.

Use modern icons and simple illustrations.

Make buttons feel inviting and interactive.

Avoid making every element look like a separate box.

Emotional Design

The application should feel supportive rather than judgmental.

If a student falls behind, do NOT make the interface feel like they have failed.

Use encouraging language such as:

“It's okay, let's reset.”

“Let's figure this out together.”

“You still have time.”

“Here's what I'd focus on first.”

The “I’m Overwhelmed” feature should feel like a safe space where students can simplify their workload rather than another reminder of everything they have to do.

Navigation

Keep navigation extremely simple.

Use a clean navigation bar with recognisable icons and short labels.

Prioritise:

Home

My Work

Study

Progress

Profile

Avoid unnecessary menus and complicated navigation.

Mobile Experience

Design the application primarily for young people using their phones.

Make sure:

Buttons are easy to tap.

Text is readable without zooming.

Cards fit naturally on a phone screen.

Navigation is easy to access.

Important actions are reachable with one hand.

The interface feels like a modern mobile app rather than a desktop website squeezed onto a phone.

Important

Do NOT change, remove, or break any existing functionality.

Do NOT change the application's core features, data, navigation structure, or logic.

Only redesign the UI/UX, colours, typography, spacing, components, animations, and visual hierarchy.

Review every page after making the changes and ensure that the entire application has the same youthful visual identity.

The final result should make a young student think:

“This actually looks fun to use.”

rather than:

“This feels like school.”

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://study-ace-rescue.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5124b151-b808-4c40-9216-adea002dde83).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
