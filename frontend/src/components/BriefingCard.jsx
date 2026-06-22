import IconBadge from './IconBadge'

/**
 * @param {object} props
 * @param {{date: string, quote: string, focus_tip: string, message: string} | null} props.briefing
 * @param {boolean} props.loading
 * @param {string | null} props.error
 * @param {() => void} props.onRetry
 */
function BriefingCard({ briefing, loading, error, onRetry }) {
  return (
    <section className="mt-2 animate-rise-in rounded-2xl border border-[var(--border)] bg-white p-6 shadow-md sm:p-7">
      {loading && (
        <div className="space-y-4" aria-live="polite" aria-busy="true">
          <div className="h-3 w-24 animate-pulse rounded bg-[var(--bg)]" />
          <div className="grid gap-4 pt-2 sm:grid-cols-3">
            <div className="h-16 animate-pulse rounded-lg bg-[var(--bg)]" />
            <div className="h-16 animate-pulse rounded-lg bg-[var(--bg)]" />
            <div className="h-16 animate-pulse rounded-lg bg-[var(--bg)]" />
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-start gap-3 text-sm">
          <p className="text-[var(--ink-soft)]">
            Couldn&apos;t load this morning&apos;s briefing — {error}
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg border border-[var(--border)] px-3 py-1.5 font-medium text-[var(--indigo)] transition hover:border-[var(--indigo)]"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && briefing && (
        <>
          <div className="flex items-center gap-2">
            <IconBadge tone="blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
                <path d="M8 21l4-13 4 13M9.5 14h5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </IconBadge>
            <p className="text-sm font-semibold text-[var(--ink)]">Morning Briefing</p>
          </div>

          <div className="mt-5 grid gap-6 sm:grid-cols-3">
            <div className="flex gap-3">
              <IconBadge tone="blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
                  <path d="M7 8h10M7 12h10M7 16h6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </IconBadge>
              <div>
                <p className="font-mono-tight text-[11px] uppercase text-[var(--ink-soft)]">Quote</p>
                <p className="mt-1 text-sm leading-snug font-medium text-[var(--ink)]">
                  {briefing.quote}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <IconBadge tone="purple">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
                  <circle cx="12" cy="12" r="8" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="12" cy="12" r="0.5" fill="currentColor" />
                </svg>
              </IconBadge>
              <div>
                <p className="font-mono-tight text-[11px] uppercase text-[var(--ink-soft)]">
                  Focus Tip
                </p>
                <p className="mt-1 text-sm leading-snug text-[var(--ink)]">{briefing.focus_tip}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <IconBadge tone="orange">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
                  <path d="M3 6l9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                </svg>
              </IconBadge>
              <div>
                <p className="font-mono-tight text-[11px] uppercase text-[var(--ink-soft)]">
                  Today&apos;s Message
                </p>
                <p className="mt-1 text-sm leading-snug text-[var(--ink)]">{briefing.message}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  )
}

export default BriefingCard
