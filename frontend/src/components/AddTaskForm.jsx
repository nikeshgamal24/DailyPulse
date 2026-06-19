import { useState } from 'react'

/**
 * @param {object} props
 * @param {(title: string) => Promise<void>} props.onAdd
 */
function AddTaskForm({ onAdd }) {
  const [title, setTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      await onAdd(trimmed)
      setTitle('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What do you need to get done?"
          disabled={submitting}
          className="flex-1 rounded-lg border border-[var(--border)] bg-white px-3.5 py-2.5 text-sm text-[var(--ink)] transition outline-none placeholder:text-[var(--ink-soft)] focus:border-[var(--indigo)] focus:ring-2 focus:ring-[var(--indigo)]/20 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={submitting || !title.trim()}
          className="shrink-0 rounded-lg bg-[var(--indigo)] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[var(--indigo-deep)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Adding…' : 'Add Task'}
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </form>
  )
}

export default AddTaskForm
