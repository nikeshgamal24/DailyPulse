import { useState } from 'react'
import AddTaskForm from './AddTaskForm'
import TaskCard from './TaskCard'
import IconBadge from './IconBadge'

/**
 * @param {object} props
 * @param {Array<object>} props.inProgress
 * @param {Array<object>} props.completedToday
 * @param {boolean} props.loading
 * @param {string | null} props.error
 * @param {(title: string) => Promise<void>} props.onAddTask
 * @param {(id: string) => Promise<void>} props.onCompleteTask
 * @param {() => void} props.onRetry
 */
function TaskManager({
  inProgress,
  completedToday,
  loading,
  error,
  onAddTask,
  onCompleteTask,
  onRetry,
}) {
  const [completedCollapsed, setCompletedCollapsed] = useState(true)

  return (
    <section className="flex flex-col gap-5">
      <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-md">
        <div className="flex items-center gap-2">
          <IconBadge tone="purple">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
              <path d="M9 11l3 3L22 4M3 12a9 9 0 1 0 9-9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </IconBadge>
          <h2 className="text-sm font-semibold text-[var(--ink)]">Smart Tasks</h2>
        </div>
        <p className="mt-2 text-xs text-[var(--ink-soft)]">
          Add a task and DailyPulse breaks it into steps for you.
        </p>
        <div className="mt-4">
          <AddTaskForm onAdd={onAddTask} />
        </div>
      </div>

      {loading && (
        <div className="space-y-3">
          <div className="h-24 animate-pulse rounded-2xl bg-white shadow-md" />
          <div className="h-24 animate-pulse rounded-2xl bg-white shadow-md" />
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 text-sm shadow-md">
          <p className="text-[var(--ink-soft)]">Couldn&apos;t load tasks — {error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 rounded-lg border border-[var(--border)] px-3 py-1.5 font-medium text-[var(--indigo)] transition hover:border-[var(--indigo)]"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div>
            <p className="font-mono-tight text-[11px] uppercase text-[var(--ink-soft)]">
              In Progress — {inProgress.length}
            </p>
            <div className="mt-2 space-y-3">
              {inProgress.length === 0 && (
                <p className="rounded-2xl border border-dashed border-[var(--border)] p-5 text-sm text-[var(--ink-soft)]">
                  Nothing in progress. Add a task above to get started.
                </p>
              )}
              {inProgress.map((task) => (
                <TaskCard key={task.id} task={task} onComplete={onCompleteTask} />
              ))}
            </div>
          </div>

          {completedToday.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setCompletedCollapsed((prev) => !prev)}
                aria-expanded={!completedCollapsed}
                className="flex w-full items-center justify-between rounded-lg py-1 text-left transition hover:opacity-80"
              >
                <p className="font-mono-tight text-[11px] uppercase text-[var(--ink-soft)]">
                  Completed Today — {completedToday.length}
                </p>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`h-3.5 w-3.5 shrink-0 text-[var(--ink-soft)] transition-transform ${
                    completedCollapsed ? '' : 'rotate-180'
                  }`}
                  aria-hidden="true"
                >
                  <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {!completedCollapsed && (
                <div className="mt-2 space-y-3">
                  {completedToday.map((task) => (
                    <TaskCard key={task.id} task={task} onComplete={onCompleteTask} />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default TaskManager
