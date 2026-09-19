import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export const Breadcrumbs = ({ trail }: { trail: { name: string; href: string }[] }) => (
  <nav aria-label="Breadcrumb" className="min-w-0">
    <ol className="flex flex-wrap items-center gap-1 text-sm text-ink-faint">
      {trail.map((item, index) => {
        const isLast = index === trail.length - 1
        return (
          <li key={item.href} className="flex items-center gap-1">
            {index > 0 && <ChevronRight aria-hidden className="size-3.5 shrink-0" />}
            {isLast ? (
              <span className="truncate text-ink-muted">{item.name}</span>
            ) : (
              <Link href={item.href} className="transition-colors hover:text-primary">
                {item.name}
              </Link>
            )}
          </li>
        )
      })}
    </ol>
  </nav>
)
