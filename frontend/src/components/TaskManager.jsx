import AddTaskForm from './AddTaskForm'
import TaskCard from './TaskCard'

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
  return (
    <section className="flex flex-col gap-5">
      <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-md">
        <h2 className="text-sm font-semibold text-[var(--ink)]">Smart Tasks</h2>
        <p className="mt-0.5 text-xs text-[var(--ink-soft)]">
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
              <p className="font-mono-tight text-[11px] uppercase text-[var(--ink-soft)]">
                Completed Today — {completedToday.length}
              </p>
              <div className="mt-2 space-y-3">
                {completedToday.map((task) => (
                  <TaskCard key={task.id} task={task} onComplete={onCompleteTask} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default TaskManager
