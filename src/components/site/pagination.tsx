import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Pagination = ({
  page,
  totalPages,
  basePath,
}: {
  page: number
  totalPages: number
  basePath: string
}) => {
  if (totalPages <= 1) return null
  const href = (p: number) => `${basePath}${basePath.includes('?') ? '&' : '?'}page=${p}`

  const link = 'inline-flex h-10 items-center gap-1 rounded-control border border-line-strong px-3 text-sm transition-colors hover:border-ink-faint hover:bg-surface-muted'
  const disabled = 'pointer-events-none opacity-40'

  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-between gap-4">
      <Link
        href={href(page - 1)}
        aria-disabled={page <= 1}
        className={cn(link, page <= 1 && disabled)}
      >
        <ChevronLeft className="size-4" aria-hidden />
        Previous
      </Link>
      <p className="text-sm text-ink-muted">
        Page {page} of {totalPages}
      </p>
      <Link
        href={href(page + 1)}
        aria-disabled={page >= totalPages}
        className={cn(link, page >= totalPages && disabled)}
      >
        Next
        <ChevronRight className="size-4" aria-hidden />
      </Link>
    </nav>
  )
}
