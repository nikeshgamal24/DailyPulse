const TONE_CLASSES = {
  blue: 'bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]',
  purple: 'bg-[var(--accent-purple)]/10 text-[var(--accent-purple)]',
  orange: 'bg-[var(--accent-orange)]/10 text-[var(--accent-orange)]',
}

/**
 * Small colored square that pairs an icon with a section's accent token.
 * Keep all section accenting going through this component + the
 * `--accent-*` tokens in index.css, rather than one-off colors per card.
 *
 * @param {object} props
 * @param {'blue' | 'purple' | 'orange'} [props.tone]
 * @param {import('react').ReactNode} props.children - an inline SVG icon
 */
function IconBadge({ tone = 'purple', children }) {
  return (
    <span
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  )
}

export default IconBadge
