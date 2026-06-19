import { useState } from 'react'
import { getStandup } from '../api'

/**
 * @param {object} props
 * @param {number} props.completedCount
 */
function StandupCard({ completedCount }) {
  const [standup, setStandup] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  const unlocked = completedCount >= 1

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getStandup()
      setStandup(data.standup)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!standup) return
    await navigator.clipboard.writeText(standup)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-md">
      <p className="font-mono-tight text-[11px] uppercase text-[var(--ink-soft)]">Standup</p>
      <h2 className="mt-1 text-sm font-semibold text-[var(--ink)]">
        Generate today&apos;s update
      </h2>

      {!unlocked && (
        <p className="mt-3 text-sm text-[var(--ink-soft)]">
          Complete a task to unlock your standup.
        </p>
      )}

      {unlocked && (
        <>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="mt-3 rounded-lg bg-[var(--indigo)] px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[var(--indigo-deep)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Generating…' : standup ? 'Regenerate Standup' : 'Generate Standup'}
          </button>

          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

          {standup && (
            <div className="mt-4">
              <pre className="font-mono-tight rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3.5 text-xs leading-relaxed whitespace-pre-wrap text-[var(--ink)]">
                {standup}
              </pre>
              <button
                type="button"
                onClick={handleCopy}
                className="mt-2 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--ink)] transition hover:border-[var(--indigo)] hover:text-[var(--indigo)]"
              >
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default StandupCard
