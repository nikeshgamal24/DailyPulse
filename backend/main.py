"""FastAPI route handlers for DailyPulse. Thin layer over services.py."""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

import services

app = FastAPI(title="DailyPulse API")


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Return JSON for unhandled errors (e.g. a failed Gemini call) instead of
    letting them escape as a bare 500 with no CORS headers."""
    return JSONResponse(status_code=500, content={"detail": str(exc)})


class TaskCreate(BaseModel):
    title: str


@app.get("/briefing")
def get_briefing() -> dict:
    """Return today's briefing, generating it if it doesn't exist yet."""
    return services.get_or_generate_briefing()


@app.get("/tasks")
def get_tasks() -> list[dict]:
    """Return all tasks."""
    return services.load_tasks()


@app.post("/tasks")
def add_task(task: TaskCreate) -> dict:
    """Create a task and generate AI subtasks for it."""
    return services.create_task(task.title)


@app.put("/tasks/{task_id}/complete")
def complete_task_route(task_id: str) -> dict:
    """Mark a task complete."""
    task = services.complete_task(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@app.delete("/tasks/{task_id}")
def delete_task_route(task_id: str) -> dict:
    """Delete a task."""
    deleted = services.delete_task(task_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"deleted": True}


@app.get("/standup")
def get_standup() -> dict:
    """Generate a standup from today's completed tasks."""
    return {"standup": services.generate_standup()}


@app.get("/insights")
def get_insights() -> dict:
    """Generate insights from today's task patterns."""
    return {"insights": services.generate_insights()}


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
