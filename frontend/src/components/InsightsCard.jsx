import { useState } from 'react'
import { getInsights } from '../api'

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
      <p className="font-mono-tight text-[11px] uppercase text-[var(--ink-soft)]">Insights</p>
      <h2 className="mt-1 text-sm font-semibold text-[var(--ink)]">Spot today&apos;s patterns</h2>

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
            className="mt-3 rounded-lg bg-[var(--indigo)] px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[var(--indigo-deep)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Analyzing…' : insights ? 'Refresh Insights' : 'Get Insights'}
          </button>

          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

          {insights && (
            <p className="mt-4 text-sm leading-relaxed whitespace-pre-wrap text-[var(--ink)]">
              {insights}
            </p>
          )}
        </>
      )}
    </div>
  )
}

export default InsightsCard
