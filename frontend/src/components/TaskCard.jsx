import { useState } from 'react'

/**
 * @param {object} props
 * @param {{id: string, title: string, subtasks: string[], completed: boolean}} props.task
 * @param {(id: string) => Promise<void>} props.onComplete
 */
function TaskCard({ task, onComplete }) {
  const [completing, setCompleting] = useState(false)
  const [error, setError] = useState(null)
  const [checked, setChecked] = useState(() => task.subtasks.map(() => false))

  const toggleSubtask = (index) => {
    setChecked((prev) => prev.map((v, i) => (i === index ? !v : v)))
  }

  const handleComplete = async () => {
    setCompleting(true)
    setError(null)
    try {
      await onComplete(task.id)
    } catch (err) {
      setError(err.message)
      setCompleting(false)
    }
  }

  return (
    <article
      className={`animate-rise-in rounded-2xl border p-5 shadow-md transition-colors ${
        task.completed
          ? 'border-[var(--success)]/20 bg-[var(--success)]/[0.04]'
          : 'border-[var(--border)] bg-white'
      }`}
    >
      <div className="flex items-start gap-3">
        {task.completed && (
          <svg
            className="mt-0.5 h-5 w-5 shrink-0 text-[var(--success)]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden="true"
          >
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        <h3
          className={`text-base font-bold ${
            task.completed ? 'text-[var(--ink-soft)] line-through' : 'text-[var(--ink)]'
          }`}
        >
          {task.title}
        </h3>
      </div>

      {task.subtasks.length > 0 && (
        <ul className="mt-3 space-y-2 pl-1">
          {task.subtasks.map((subtask, i) => (
            <li key={subtask} className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={task.completed ? true : checked[i]}
                onChange={() => toggleSubtask(i)}
                disabled={task.completed}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--border)] text-[var(--indigo)] focus:ring-[var(--indigo)]/30"
              />
              <span
                className={
                  task.completed || checked[i]
                    ? 'text-[var(--ink-soft)] line-through'
                    : 'text-[var(--ink)]'
                }
              >
                {subtask}
              </span>
            </li>
          ))}
        </ul>
      )}

      {!task.completed && (
        <button
          type="button"
          onClick={handleComplete}
          disabled={completing}
          className="mt-4 rounded-lg bg-[var(--indigo)] px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[var(--indigo-deep)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {completing ? 'Completing…' : 'Complete Task'}
        </button>
      )}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </article>
  )
}

export default TaskCard
