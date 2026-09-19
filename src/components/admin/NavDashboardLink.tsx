import Link from 'next/link'

/**
 * Payload's sidebar lists collections but offers no route back to the
 * dashboard, so once you are inside Products there is no obvious way home.
 */
export const NavDashboardLink = () => (
  <Link className="gr-nav-home" href="/admin">
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 6.5 8 2l6 4.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z" strokeLinejoin="round" />
    </svg>
    Dashboard
  </Link>
)
