"""Business logic and AI calls for DailyPulse."""

import asyncio
import json
import logging
import os
import uuid
from datetime import date, datetime
from pathlib import Path

import anyio
from dotenv import load_dotenv
from openai import APIConnectionError, APIStatusError, APITimeoutError, OpenAI
from pydantic import BaseModel

load_dotenv()

logger = logging.getLogger("dailypulse")

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.environ["OPENROUTER_API_KEY"],
)
MODEL_NAME = "openai/gpt-5-mini"
AI_TIMEOUT_SECONDS = 30

DATA_DIR = Path(__file__).parent / "data"
TASKS_FILE = DATA_DIR / "tasks.json"
BRIEFING_FILE = DATA_DIR / "briefing.json"

# Per-use-case token budgets. A single shared cap either wastes budget on
# short structured replies or starves longer free-form text before it can
# fit reasoning + content (see the gpt-5-mini gotcha below).
SUBTASKS_MAX_TOKENS = 800
BRIEFING_MAX_TOKENS = 600
STANDUP_MAX_TOKENS = 900
INSIGHTS_MAX_TOKENS = 1000


class AIGenerationError(RuntimeError):
    """Raised when the AI model call fails or returns an unusable response."""


class DataStoreError(RuntimeError):
    """Raised when reading or writing local JSON data fails."""


class _SubtasksResult(BaseModel):
    subtasks: list[str]


class _BriefingResult(BaseModel):
    quote: str
    focus_tip: str
    message: str


def _read_json_file(path: Path, default: object) -> object:
    """Read and parse a JSON file, returning `default` if it doesn't exist yet."""
    try:
        with open(path, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return default
    except json.JSONDecodeError as exc:
        logger.error("Corrupted JSON data file %s: %s", path, exc)
        raise DataStoreError(f"Data file {path.name} is corrupted") from exc


def _write_json_file(path: Path, data: object) -> None:
    """Write `data` to `path` as JSON, raising DataStoreError on I/O failure."""
    try:
        with open(path, "w") as f:
            json.dump(data, f, indent=2)
    except OSError as exc:
        logger.error("Failed to write data file %s: %s", path, exc)
        raise DataStoreError(f"Could not save {path.name}") from exc


async def load_tasks() -> list[dict]:
    """Load all tasks from tasks.json."""
    return await anyio.to_thread.run_sync(_read_json_file, TASKS_FILE, [])


async def save_tasks(tasks: list[dict]) -> None:
    """Persist tasks to tasks.json."""
    await anyio.to_thread.run_sync(_write_json_file, TASKS_FILE, tasks)


async def load_briefing() -> dict:
    """Load the stored briefing from briefing.json."""
    return await anyio.to_thread.run_sync(_read_json_file, BRIEFING_FILE, {})


async def save_briefing(briefing: dict) -> None:
    """Persist the briefing to briefing.json."""
    await anyio.to_thread.run_sync(_write_json_file, BRIEFING_FILE, briefing)


def _today() -> str:
    """Return today's date as an ISO string (YYYY-MM-DD)."""
    return date.today().isoformat()


def _call_model(prompt: str, max_tokens: int, response_format: dict | None) -> str:
    """Blocking call to the AI model; always run via a worker thread from
    async code since the OpenAI client here is synchronous."""
    try:
        kwargs = {"response_format": response_format} if response_format else {}
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_tokens,
            timeout=AI_TIMEOUT_SECONDS,
            extra_body={"reasoning": {"effort": "minimal"}},
            **kwargs,
        )
    except APITimeoutError as exc:
        logger.error("AI request timed out after %ss", AI_TIMEOUT_SECONDS)
        raise AIGenerationError("The AI service timed out. Please try again.") from exc
    except APIConnectionError as exc:
        logger.error("AI request connection failed: %s", exc)
        raise AIGenerationError("Could not reach the AI service.") from exc
    except APIStatusError as exc:
        logger.error(
            "AI request failed with status %s: %s", exc.status_code, exc.message
        )
        raise AIGenerationError(f"AI service error ({exc.status_code}).") from exc

    content = response.choices[0].message.content
    if content is None:
        # gpt-5-mini is a reasoning model: its internal reasoning tokens
        # count against max_tokens, so a tight budget can be exhausted
        # before any visible output is produced.
        logger.error(
            "AI response had no content (max_tokens=%s likely exhausted by reasoning)",
            max_tokens,
        )
        raise AIGenerationError(
            "The AI model returned an empty response. Please try again."
        )
    return content


async def _generate_json(
    prompt: str, schema: type[BaseModel], max_tokens: int
) -> BaseModel:
    """Call the model via OpenRouter and parse the response against a Pydantic schema."""
    json_schema = schema.model_json_schema()
    json_schema["additionalProperties"] = False
    response_format = {
        "type": "json_schema",
        "json_schema": {
            "name": schema.__name__,
            "strict": True,
            "schema": json_schema,
        },
    }
    content = await anyio.to_thread.run_sync(
        _call_model, prompt, max_tokens, response_format
    )
    try:
        return schema.model_validate_json(content)
    except ValueError as exc:
        logger.error("AI response failed schema validation: %s", exc)
        raise AIGenerationError(
            "The AI returned an unexpected response format."
        ) from exc


async def _generate_text(prompt: str, max_tokens: int) -> str:
    """Call the model via OpenRouter and return the raw text response."""
    content = await anyio.to_thread.run_sync(_call_model, prompt, max_tokens, None)
    return content.strip()


async def generate_subtasks(title: str) -> list[str]:
    """Use the model to break a task title into 3-5 concrete subtasks."""
    prompt = (
        "Break the following task into 3 to 5 concrete, actionable subtasks.\n"
        f'Task: "{title}"'
    )
    result = await _generate_json(prompt, _SubtasksResult, SUBTASKS_MAX_TOKENS)
    return result.subtasks


async def create_task(title: str) -> dict:
    """Create a new task with AI-generated subtasks and persist it."""
    task = {
        "id": str(uuid.uuid4()),
        "title": title,
        "subtasks": await generate_subtasks(title),
        "completed": False,
        "completed_at": None,
        "created_at": datetime.now().isoformat(),
    }
    tasks = await load_tasks()
    tasks.append(task)
    await save_tasks(tasks)
    return task


async def complete_task(task_id: str) -> dict | None:
    """Mark a task complete and set completed_at. Returns the task or None."""
    tasks = await load_tasks()
    for task in tasks:
        if task["id"] == task_id:
            task["completed"] = True
            task["completed_at"] = datetime.now().isoformat()
            await save_tasks(tasks)
            return task
    return None


async def delete_task(task_id: str) -> bool:
    """Remove a task by id. Returns True if a task was removed."""
    tasks = await load_tasks()
    remaining = [t for t in tasks if t["id"] != task_id]
    if len(remaining) == len(tasks):
        return False
    await save_tasks(remaining)
    return True


# In-memory cache for today's briefing, guarded by a lock so concurrent
# requests that arrive before generation finishes await the same result
# instead of each triggering their own AI call.
_briefing_cache: dict | None = None
_briefing_lock = asyncio.Lock()


async def get_or_generate_briefing() -> dict:
    """Return today's briefing, generating and caching it if needed."""
    global _briefing_cache
    today = _today()

    if _briefing_cache is not None and _briefing_cache.get("date") == today:
        return _briefing_cache

    async with _briefing_lock:
        if _briefing_cache is not None and _briefing_cache.get("date") == today:
            return _briefing_cache

        briefing = await load_briefing()
        if briefing.get("date") == today:
            _briefing_cache = briefing
            return briefing

        prompt = (
            "Generate a morning briefing for a productivity app user: a motivational "
            "quote, a focus tip for the day, and an encouraging message under 50 words."
        )
        result = await _generate_json(prompt, _BriefingResult, BRIEFING_MAX_TOKENS)
        briefing = {
            "date": today,
            "quote": result.quote,
            "focus_tip": result.focus_tip,
            "message": result.message,
        }
        await save_briefing(briefing)
        _briefing_cache = briefing
        return briefing


def _tasks_today(tasks: list[dict], key: str) -> list[dict]:
    """Filter tasks whose `key` timestamp falls on today's date."""
    return [t for t in tasks if t.get(key) and t[key].startswith(_today())]


async def generate_standup() -> str:
    """Generate a professional standup from today's completed tasks."""
    tasks = await load_tasks()
    completed_today = _tasks_today(tasks, "completed_at")
    titles = [t["title"] for t in completed_today]

    prompt = (
        "Write a professional daily standup update based on these completed "
        f"tasks: {titles}. Cover what was done and what's next. Keep it concise."
    )
    return await _generate_text(prompt, STANDUP_MAX_TOKENS)


async def generate_insights() -> str:
    """Generate productivity insights from today's task patterns."""
    tasks = await load_tasks()
    today_tasks = _tasks_today(tasks, "created_at")

    prompt = (
        "Analyze these tasks from today and identify patterns: peak productivity "
        "time, task completion rate, and suggestions for improvement. "
        f"Tasks: {today_tasks}"
    )
    return await _generate_text(prompt, INSIGHTS_MAX_TOKENS)
