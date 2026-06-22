---
name: morning-briefing
description: Generates and displays the DailyPulse morning briefing. Use at the start of every work session.
trigger: /morning-briefing
effort: low
---

Run the DailyPulse morning briefing. Requires the backend to be running at
`http://localhost:8000` (`cd backend && uvicorn main:app --reload`). The whole
flow should take well under 30 seconds — if a request hangs or the backend is
unreachable, tell the user to start it and stop.

## Steps

1. **Fetch the briefing.**

   ```bash
   curl -s http://localhost:8000/briefing
   ```

   `GET /briefing` generates and caches today's briefing itself if it hasn't
   been created yet (checked by date, see `services.get_or_generate_briefing`)
   — there is no separate "generate" endpoint to call. A single request
   handles both the "already generated" and "not generated yet" cases, the
   second one just takes a moment longer for the AI call.

   The response looks like:

   ```json
   { "date": "YYYY-MM-DD", "quote": "...", "focus_tip": "...", "message": "..." }
   ```

   Display it formatted in the terminal, roughly:

   ```
   ☀️  Morning Briefing — <date>

   "<quote>"

   Focus tip: <focus_tip>

   <message>
   ```

2. **Fetch tasks.**

   ```bash
   curl -s http://localhost:8000/tasks
   ```

   Returns a list of task objects: `id`, `title`, `subtasks`, `completed`,
   `completed_at`, `created_at`.

   Compute, using today's and yesterday's local dates:
   - **Pending count** — tasks where `completed` is `false`.
   - **Completed yesterday** — tasks where `completed` is `true` and
     `completed_at` falls on yesterday's date (compare the date portion of
     the ISO timestamp). Omit this line if zero.
   - **Suggested focus** — pick one pending task to highlight: prefer the
     oldest pending task (earliest `created_at`), or one whose title/subtasks
     suggest urgency. Name it specifically rather than giving generic advice.

3. **Display the task summary**, e.g.:

   ```
   📋 Tasks
   Pending: <N>
   Completed yesterday: <N>          (omit if 0)

   Today's focus: <task title> — <brief reason>
   ```

## Notes

- If either request fails (connection refused, non-2xx), report that the
  backend isn't reachable at `http://localhost:8000` and suggest starting it
  per `backend/README` / the Running the App section of `CLAUDE.md`, then
  stop — don't retry in a loop.
- Don't fetch `/standup` or `/insights` — out of scope for this skill.
