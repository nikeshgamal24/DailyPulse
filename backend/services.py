"""Business logic and AI calls for DailyPulse."""

import json
import os
import uuid
from datetime import date, datetime
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI
from pydantic import BaseModel

load_dotenv()

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.environ["OPENROUTER_API_KEY"],
)
MODEL_NAME = "openai/gpt-5-mini"

DATA_DIR = Path(__file__).parent / "data"
TASKS_FILE = DATA_DIR / "tasks.json"
BRIEFING_FILE = DATA_DIR / "briefing.json"


class _SubtasksResult(BaseModel):
    subtasks: list[str]


class _BriefingResult(BaseModel):
    quote: str
    focus_tip: str
    message: str


def load_tasks() -> list[dict]:
    """Load all tasks from tasks.json."""
    with open(TASKS_FILE, "r") as f:
        return json.load(f)


def save_tasks(tasks: list[dict]) -> None:
    """Persist tasks to tasks.json."""
    with open(TASKS_FILE, "w") as f:
        json.dump(tasks, f, indent=2)


def load_briefing() -> dict:
    """Load the stored briefing from briefing.json."""
    with open(BRIEFING_FILE, "r") as f:
        return json.load(f)


def save_briefing(briefing: dict) -> None:
    """Persist the briefing to briefing.json."""
    with open(BRIEFING_FILE, "w") as f:
        json.dump(briefing, f, indent=2)


def _today() -> str:
    """Return today's date as an ISO string (YYYY-MM-DD)."""
    return date.today().isoformat()


def _generate_json(prompt: str, schema: type[BaseModel]) -> BaseModel:
    """Call the model via OpenRouter and parse the response against a Pydantic schema."""
    json_schema = schema.model_json_schema()
    json_schema["additionalProperties"] = False
    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=2048,
        extra_body={"reasoning": {"effort": "minimal"}},
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": schema.__name__,
                "strict": True,
                "schema": json_schema,
            },
        },
    )
    return schema.model_validate_json(response.choices[0].message.content)


def _generate_text(prompt: str) -> str:
    """Call the model via OpenRouter and return the raw text response."""
    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=2048,
        extra_body={"reasoning": {"effort": "minimal"}},
    )
    return response.choices[0].message.content.strip()


def generate_subtasks(title: str) -> list[str]:
    """Use the model to break a task title into 3-5 concrete subtasks."""
    prompt = (
        "Break the following task into 3 to 5 concrete, actionable subtasks.\n"
        f'Task: "{title}"'
    )
    result = _generate_json(prompt, _SubtasksResult)
    return result.subtasks


def create_task(title: str) -> dict:
    """Create a new task with AI-generated subtasks and persist it."""
    task = {
        "id": str(uuid.uuid4()),
        "title": title,
        "subtasks": generate_subtasks(title),
        "completed": False,
        "completed_at": None,
        "created_at": datetime.now().isoformat(),
    }
    tasks = load_tasks()
    tasks.append(task)
    save_tasks(tasks)
    return task


def complete_task(task_id: str) -> dict | None:
    """Mark a task complete and set completed_at. Returns the task or None."""
    tasks = load_tasks()
    for task in tasks:
        if task["id"] == task_id:
            task["completed"] = True
            task["completed_at"] = datetime.now().isoformat()
            save_tasks(tasks)
            return task
    return None


def delete_task(task_id: str) -> bool:
    """Remove a task by id. Returns True if a task was removed."""
    tasks = load_tasks()
    remaining = [t for t in tasks if t["id"] != task_id]
    if len(remaining) == len(tasks):
        return False
    save_tasks(remaining)
    return True


def get_or_generate_briefing() -> dict:
    """Return today's briefing, generating and caching it if needed."""
    briefing = load_briefing()
    if briefing.get("date") == _today():
        return briefing

    prompt = (
        "Generate a morning briefing for a productivity app user: a motivational "
        "quote, a focus tip for the day, and an encouraging message under 50 words."
    )
    result = _generate_json(prompt, _BriefingResult)
    briefing = {
        "date": _today(),
        "quote": result.quote,
        "focus_tip": result.focus_tip,
        "message": result.message,
    }
    save_briefing(briefing)
    return briefing


def _tasks_today(tasks: list[dict], key: str) -> list[dict]:
    """Filter tasks whose `key` timestamp falls on today's date."""
    return [t for t in tasks if t.get(key) and t[key].startswith(_today())]


def generate_standup() -> str:
    """Generate a professional standup from today's completed tasks."""
    tasks = load_tasks()
    completed_today = _tasks_today(tasks, "completed_at")
    titles = [t["title"] for t in completed_today]

    prompt = (
        "Write a professional daily standup update based on these completed "
        f"tasks: {titles}. Cover what was done and what's next. Keep it concise."
    )
    return _generate_text(prompt)


def generate_insights() -> str:
    """Generate productivity insights from today's task patterns."""
    tasks = load_tasks()
    today_tasks = _tasks_today(tasks, "created_at")

    prompt = (
        "Analyze these tasks from today and identify patterns: peak productivity "
        "time, task completion rate, and suggestions for improvement. "
        f"Tasks: {today_tasks}"
    )
    return _generate_text(prompt)
