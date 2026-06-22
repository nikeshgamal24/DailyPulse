"""FastAPI route handlers for DailyPulse. Thin layer over services.py."""

import logging

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

import services
from services import AIGenerationError, DataStoreError

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger("dailypulse")

app = FastAPI(title="DailyPulse API")


@app.exception_handler(AIGenerationError)
async def ai_generation_error_handler(
    request: Request, exc: AIGenerationError
) -> JSONResponse:
    """The AI provider failed or returned something unusable; surface as a 502."""
    return JSONResponse(status_code=502, content={"detail": str(exc)})


@app.exception_handler(DataStoreError)
async def data_store_error_handler(
    request: Request, exc: DataStoreError
) -> JSONResponse:
    """Local JSON storage failed to read or write; surface as a 500."""
    return JSONResponse(status_code=500, content={"detail": str(exc)})


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Return JSON for unhandled errors instead of letting them escape as a
    bare 500 with no CORS headers."""
    logger.exception("Unhandled error on %s", request.url.path)
    return JSONResponse(status_code=500, content={"detail": str(exc)})


class TaskCreate(BaseModel):
    title: str


@app.get("/briefing")
async def get_briefing() -> dict:
    """Return today's briefing, generating it if it doesn't exist yet."""
    return await services.get_or_generate_briefing()


@app.get("/tasks")
async def get_tasks() -> list[dict]:
    """Return all tasks."""
    return await services.load_tasks()


@app.post("/tasks")
async def add_task(task: TaskCreate) -> dict:
    """Create a task and generate AI subtasks for it."""
    return await services.create_task(task.title)


@app.put("/tasks/{task_id}/complete")
async def complete_task_route(task_id: str) -> dict:
    """Mark a task complete."""
    task = await services.complete_task(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@app.delete("/tasks/{task_id}")
async def delete_task_route(task_id: str) -> dict:
    """Delete a task."""
    deleted = await services.delete_task(task_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"deleted": True}


@app.get("/standup")
async def get_standup() -> dict:
    """Generate a standup from today's completed tasks."""
    return {"standup": await services.generate_standup()}


@app.get("/insights")
async def get_insights() -> dict:
    """Generate insights from today's task patterns."""
    return {"insights": await services.generate_insights()}


# Wrap the whole app (rather than app.add_middleware) so CORS headers are
# still attached to 500s raised past ServerErrorMiddleware, which sits
# outside any middleware added the normal way.
app = CORSMiddleware(
    app=app,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
