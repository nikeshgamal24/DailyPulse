# DailyPulse

A personal AI productivity dashboard. Get a morning briefing, manage tasks
that get automatically broken into subtasks, generate a standup from what you
finished today, and pull insights from your task patterns — all in one page.

## Features

- **Morning Briefing** — a motivational quote, a focus tip, and a short
  encouraging message, generated once per day and cached.
- **Smart Tasks** — add a task by title and the AI breaks it into 3–5
  concrete subtasks. Tasks move between "In Progress" and "Completed Today"
  as you complete them.
- **Standup Generator** — turns today's completed tasks into a professional
  standup update, with one click to copy it to your clipboard. Unlocks once
  you've completed at least one task.
- **Daily Insights** — surfaces patterns in today's tasks (peak productivity
  time, completion rate, suggestions). Unlocks once you've added at least
  three tasks.

## Tech Stack

| Layer    | Stack |
|----------|-------|
| Frontend | React + Vite, Tailwind CSS v4 (`@tailwindcss/vite`) |
| Backend  | Python, FastAPI, Uvicorn |
| AI       | [OpenRouter](https://openrouter.ai) (`openai/gpt-5-mini`) via the `openai` SDK |
| Storage  | Flat JSON files in `backend/data/` — no database |

## Project Structure

```
backend/
  main.py          FastAPI route handlers (thin layer, calls services.py)
  services.py       Business logic + AI calls
  data/             tasks.json, briefing.json — flat JSON storage
  requirements.txt
  .env              Local secrets (gitignored) — see .env.example
frontend/
  src/
    App.jsx          Top-level layout and state
    api.js            fetch() wrappers for the backend API
    components/       Header, BriefingCard, TaskManager, TaskCard, etc.
```

## Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- An [OpenRouter](https://openrouter.ai/settings/credits) API key with some
  credits on the account

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate        # on Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# then edit .env and set OPENROUTER_API_KEY
```

### Frontend

```bash
cd frontend
npm install
```

## Running the App

Run both in separate terminals:

```bash
# Backend — http://localhost:8000
cd backend
source .venv/bin/activate
uvicorn main:app --reload
```

```bash
# Frontend — http://localhost:5173
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

## API Reference

All endpoints are served from `http://localhost:8000`.

| Method | Path                    | Description |
|--------|-------------------------|--------------|
| GET    | `/briefing`              | Returns today's briefing, generating it if it doesn't exist yet |
| GET    | `/tasks`                  | Returns all tasks |
| POST   | `/tasks`                  | Creates a task (`{"title": "..."}`), returns it with AI-generated subtasks |
| PUT    | `/tasks/{id}/complete`    | Marks a task complete |
| DELETE | `/tasks/{id}`              | Removes a task |
| GET    | `/standup`                | Generates a standup from today's completed tasks |
| GET    | `/insights`               | Generates insights from today's task patterns |

## Notes

- Storage is flat JSON files, not a database — fine for single-user local
  use, not for concurrent multi-user access.
- `openai/gpt-5-mini` is a reasoning model; AI calls run with
  `reasoning.effort: "minimal"` and a `max_tokens` cap to keep responses fast
  and within a typical free/low-credit OpenRouter account's budget.
