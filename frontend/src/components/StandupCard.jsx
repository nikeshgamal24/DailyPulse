import { useState } from 'react'
import { getStandup } from '../api'
import IconBadge from './IconBadge'

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
      <div className="flex items-center gap-2">
        <IconBadge tone="purple">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
            <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </IconBadge>
        <div>
          <p className="font-mono-tight text-[11px] uppercase text-[var(--ink-soft)]">Standup</p>
          <h2 className="text-sm font-semibold text-[var(--ink)]">Generate today&apos;s update</h2>
        </div>
      </div>

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
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent-purple)] px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[var(--accent-purple-deep)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
              <path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {loading ? 'Generating…' : standup ? 'Regenerate Standup' : 'Generate Standup'}
          </button>

          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

          {standup && (
            <div className="mt-4 overflow-hidden rounded-lg border border-[var(--border)]">
              <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg)] px-3.5 py-2">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--coral)]/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--success)]/60" />
                  <span className="font-mono-tight ml-2 text-[10px] uppercase text-[var(--ink-soft)]">
                    standup.txt
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded-md px-2 py-1 text-[11px] font-medium text-[var(--ink-soft)] transition hover:bg-white hover:text-[var(--indigo)]"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="font-mono-tight whitespace-pre-wrap bg-[var(--ink)] p-4 text-[13px] leading-relaxed text-slate-100">
                {standup}
              </pre>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default StandupCard
