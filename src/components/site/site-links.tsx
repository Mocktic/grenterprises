'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

/**
 * The non-category destinations, shared by the desktop sidebar and the mobile
 * drawer so neither can drift from the other — and so "All products" cannot end
 * up listed twice in the same menu, which is what happened when the two menus
 * each kept their own copy.
 */
const links = [
  { href: '/products', label: 'All Products' },
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact' },
]

export const SiteLinks = ({ onNavigate }: { onNavigate?: () => void }) => {
  const pathname = usePathname()

  return (
    <nav aria-label="Site" className="mt-3 border-t border-line pt-3">
      <ul className="space-y-0.5">
        {links.map((link) => {
          const active = pathname === link.href
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'block rounded-control px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-primary-soft font-medium text-primary-deep'
                    : 'text-ink-muted hover:bg-surface-muted hover:text-ink',
                )}
              >
                {link.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
