# DailyPulse

DailyPulse is a personal AI productivity web app. Users get a morning briefing,
manage smart tasks (AI breaks tasks into subtasks), generate standups from
completed tasks, a/nd view daily insights.

## Tech Stack

- **Backend:** Python FastAPI, runs on port 8000, data stored in backend/data/
  as JSON files (tasks.json, briefing.json). Use python-dotenv for env vars.
- **Frontend:** React with Vite, Tailwind CSS, runs on port 5173.
  Use fetch() for API calls to http://localhost:8000.
  No external state management — useState and useEffect only.
- **AI:** OpenRouter (model: openai/gpt-5-mini) via the `openai` SDK pointed at
  `base_url="https://openrouter.ai/api/v1"`. API key from OPENROUTER_API_KEY
  env var (the OpenAI SDK does not auto-detect this var — pass it explicitly
  as `api_key=os.environ["OPENROUTER_API_KEY"]`).
  (Updated 2026-06-19, switched from Gemini to OpenRouter.
  Two gotchas hit during setup: (1) gpt-5-mini is a reasoning model — its
  internal reasoning tokens count against `max_tokens`, so a low cap can
  exhaust the budget before any visible output is produced, leaving
  `message.content` as `None`. Pass `extra_body={"reasoning": {"effort":
  "minimal"}}` for short, low-stakes generations like these. (2) Structured
  JSON output uses `response_format={"type": "json_schema", "json_schema":
  {"name": ..., "strict": True, "schema": ...}}` with the schema's
  `additionalProperties` set to `False` — not Gemini's `response_schema`
  field, which OpenRouter/OpenAI's client doesn't have.)

## Tailwind CSS

Frontend uses Tailwind CSS via the `@tailwindcss/vite` plugin. **Don't trust a
hardcoded version number in this doc** — package versions drift and this file
won't always be updated when they do (see the AI model note above for what
happens when it isn't). Before making any Tailwind config change, check the
version actually installed:

```bash
cat frontend/node_modules/tailwindcss/package.json | grep '"version"'
```

Then follow that version's own current setup docs rather than assuming a
pattern from memory.

As of 2026-06-19, v4 (v4.3.1) is installed via `frontend/package.json`'s caret
range (`^4.3.1`), so patch/minor upgrades happen automatically on `npm
install` — only a major bump (v5+) would require revisiting this section.
Known v4 patterns, for reference:
- No `tailwind.config.js` — v4 auto-scans source files, no `content` array needed
- No `@tailwind base/components/utilities` directives — replaced by a single
  `@import "tailwindcss"` at the top of `src/index.css`
- No `npx tailwindcss init` — there is nothing to initialise
- Plugin is `@tailwindcss/vite`, registered in `vite.config.js`, not `postcss.config.js`

These are v3-incompatible patterns — don't mix the two.

## Theme System

All colors live as CSS custom properties in `frontend/src/index.css`
(`:root` block) — never hardcode a hex color in a component, add a token
instead. Two token groups:

- **Neutrals/brand:** `--ink`, `--ink-soft`, `--bg`, `--border`, `--indigo`,
  `--indigo-deep`, `--coral`, `--success`. Used for body text, primary
  buttons (Smart Tasks "Add Task", task "Complete Task"), and borders.
- **Section accents:** `--accent-blue`, `--accent-purple`, `--accent-orange`
  (each with a `-deep` hover variant). Each major card owns exactly one
  accent, applied to its `IconBadge` and primary button:
  - blue → Morning Briefing (quote column)
  - purple → Smart Tasks, Standup Generator (also the briefing's focus-tip
    column)
  - orange → Daily Insights (also the briefing's today's-message column)

`frontend/src/components/IconBadge.jsx` renders the small colored square
next to each card title/column — pass it a `tone` prop (`blue` | `purple` |
`orange`) and an inline SVG icon child rather than building a new badge
style per component. When adding a new card or section, pick one of the
three existing accents (don't add a fourth without updating both the
`index.css` token comment block and this section).

## Code Standards

- Python: type hints on all functions, docstrings on all public functions,
  black formatting, no bare except blocks
- React: functional components only, props typed with JSDoc,
  loading and error states on every API call
- File naming: snake_case for Python, PascalCase for React components

## Key Files

- backend/main.py — FastAPI route handlers (thin layer, calls services.py)
- backend/services.py — all business logic and AI calls
- backend/data/ — JSON storage (tasks.json, briefing.json)
- frontend/src/App.jsx — main React component
- frontend/src/components/ — React components directory
- frontend/src/components/IconBadge.jsx — shared colored icon-badge used by every card header (see Theme System)
- frontend/vite.config.js — Vite config with Tailwind plugin (see Tailwind CSS section for version)
- frontend/src/index.css — global styles, starts with `@import "tailwindcss"`

## Running the App

```bash
# Backend
cd backend
uvicorn main:app --reload

# Frontend
cd frontend
npm run dev
```