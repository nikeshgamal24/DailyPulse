/**
 * @param {object} props
 * @param {() => void} props.onRefreshBriefing
 * @param {boolean} props.refreshing
 */
function Header({ onRefreshBriefing, refreshing }) {
  const today = new Date()
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' })
  const dateLabel = today.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <header className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <svg
          className="pulse-line hidden h-8 w-16 shrink-0 sm:block"
          viewBox="0 0 240 48"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id="pulseGradient"
              x1="0"
              y1="0"
              x2="240"
              y2="0"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor="#4F46E5" />
              <stop offset="1" stopColor="#FB7185" />
            </linearGradient>
          </defs>
          <path
            d="M0,24 H80 L96,8 L112,40 L128,16 L144,24 H240"
            stroke="url(#pulseGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength="1"
          />
        </svg>
        <div>
          <h1 className="text-gradient-pulse text-3xl font-extrabold tracking-tight sm:text-4xl">
            DailyPulse
          </h1>
          <p className="font-mono-tight text-xs uppercase text-[var(--ink-soft)]">
            {dayName} · {dateLabel}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onRefreshBriefing}
        disabled={refreshing}
        className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--ink)] shadow-sm transition hover:border-[var(--indigo)] hover:text-[var(--indigo)] disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
      >
        <svg
          className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M21 12a9 9 0 1 1-2.64-6.36" strokeLinecap="round" />
          <path d="M21 3v6h-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {refreshing ? 'Refreshing…' : 'Refresh Briefing'}
      </button>
    </header>
  )
}

export default Header
