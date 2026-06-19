/**
 * @param {object} props
 * @param {{date: string, quote: string, focus_tip: string, message: string} | null} props.briefing
 * @param {boolean} props.loading
 * @param {string | null} props.error
 * @param {() => void} props.onRetry
 */
function BriefingCard({ briefing, loading, error, onRetry }) {
  return (
    <section className="mt-2 animate-rise-in rounded-2xl bg-[linear-gradient(90deg,var(--indigo),var(--coral))] p-[1.5px] shadow-md">
      <div className="relative overflow-hidden rounded-2xl bg-white px-6 py-7 sm:px-8">
        {loading && (
          <div className="space-y-4" aria-live="polite" aria-busy="true">
            <div className="h-3 w-24 animate-pulse rounded bg-[var(--bg)]" />
            <div className="h-7 w-3/4 animate-pulse rounded bg-[var(--bg)]" />
            <div className="grid gap-3 pt-2 sm:grid-cols-2">
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
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-4 -left-2 text-[7rem] leading-none font-extrabold text-[var(--indigo)]/10 select-none"
            >
              &ldquo;
            </span>
            <p className="font-mono-tight relative text-xs uppercase text-[var(--indigo)]">
              Morning Briefing
            </p>
            <p className="relative mt-2 max-w-2xl text-xl leading-snug font-semibold text-[var(--ink)] sm:text-2xl">
              {briefing.quote}
            </p>
            <div className="relative mt-6 grid gap-4 border-t border-[var(--border)] pt-5 sm:grid-cols-2">
              <div>
                <p className="font-mono-tight text-[11px] uppercase text-[var(--ink-soft)]">
                  Focus
                </p>
                <p className="mt-1 text-sm text-[var(--ink)]">{briefing.focus_tip}</p>
              </div>
              <div>
                <p className="font-mono-tight text-[11px] uppercase text-[var(--ink-soft)]">
                  Today
                </p>
                <p className="mt-1 text-sm text-[var(--ink)]">{briefing.message}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default BriefingCard
