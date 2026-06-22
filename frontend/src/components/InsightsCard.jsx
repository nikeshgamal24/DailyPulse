import { useState } from 'react'
import { getInsights } from '../api'
import IconBadge from './IconBadge'

/**
 * @param {object} props
 * @param {number} props.totalCount
 */
function InsightsCard({ totalCount }) {
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const unlocked = totalCount >= 3

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getInsights()
      setInsights(data.insights)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-md">
      <div className="flex items-center gap-2">
        <IconBadge tone="orange">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
            <path d="M4 19V9M11 19V5M18 19v-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </IconBadge>
        <div>
          <p className="font-mono-tight text-[11px] uppercase text-[var(--ink-soft)]">Insights</p>
          <h2 className="text-sm font-semibold text-[var(--ink)]">Spot today&apos;s patterns</h2>
        </div>
      </div>

      {!unlocked && (
        <p className="mt-3 text-sm text-[var(--ink-soft)]">
          Insights unlock after 3 tasks — {totalCount} of 3 added.
        </p>
      )}

      {unlocked && (
        <>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent-orange)] px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[var(--accent-orange-deep)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
              <path d="M4 19V9M11 19V5M18 19v-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {loading ? 'Analyzing…' : insights ? 'Refresh Insights' : 'Get Insights'}
          </button>

          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

          {insights && (
            <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3.5">
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-[var(--ink)]">
                {insights}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default InsightsCard
