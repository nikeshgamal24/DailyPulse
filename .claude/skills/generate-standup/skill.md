---
name: generate-standup
description: Generates a professional standup from today's DailyPulse tasks. Use before your daily standup meeting.
trigger: /generate-standup
effort: low
---

Generate today's standup from DailyPulse. Requires the backend to be running
at `http://localhost:8000` (`cd backend && uvicorn main:app --reload`).

## Steps

1. **Fetch the standup.**

   ```bash
   curl -s http://localhost:8000/standup
   ```

   Returns `{ "standup": "<free text>" }` — an AI-written paragraph covering
   what was completed today (from tasks with a `completed_at` timestamp
   dated today, see `services.generate_standup`) and what's next. It is
   unstructured prose, not pre-split into sections.

2. **Ask the user for blockers** before formatting anything:

   > Any blockers today? (describe them, or say "none")

   Wait for their reply.

3. **Reformat into three sections** using the standup text from step 1 and
   the user's answer from step 2 — rewrite/condense the prose into bullets
   under each heading rather than dumping it verbatim:

   ```
   ✅ Yesterday / Today's completed work
   - <bullet per completed item, drawn from the standup text>

   🔨 What I'm working on next
   - <bullet per next-step item, drawn from the standup text>

   🚧 Blockers
   - <user's blockers, or "None" if they said none>
   ```

4. **Print the formatted standup** to the terminal.

5. **Ask:** `Copy this to clipboard? (y/n)`

   - If `n` (or anything other than `y`), stop here.
   - If `y`, copy the formatted standup text using whichever clipboard tool
     is available for the current platform, in this order:

     ```bash
     # macOS
     pbcopy
     # Linux (X11)
     xclip -selection clipboard
     # Linux (Wayland, if xclip is missing)
     wl-copy
     # Windows
     clip
     ```

     Pipe the formatted standup text into whichever command exists (check
     with `command -v <tool>` first). If none are available, tell the user
     no supported clipboard tool was found and print the text again so they
     can copy it manually.

## Notes

- If the `/standup` request fails (connection refused, non-2xx), report that
  the backend isn't reachable at `http://localhost:8000` and stop — don't
  retry in a loop.
- Don't fetch `/briefing`, `/tasks`, or `/insights` — out of scope for this
  skill.
