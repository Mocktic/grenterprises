import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * A plain GET form. No client JavaScript, so search works on a slow hospital
 * connection and before hydration — which is when a visitor who arrived
 * knowing their part number is most likely to start typing.
 */
export const SearchBar = ({
  id = 'site-search',
  defaultValue,
  className,
  size = 'md',
  autoFocus = false,
}: {
  /** Must be unique per rendered instance — it wires the label to the input. */
  id?: string
  defaultValue?: string
  className?: string
  size?: 'md' | 'lg'
  autoFocus?: boolean
}) => (
  <form action="/search" method="get" role="search" className={cn('relative w-full', className)}>
    <label htmlFor={id} className="sr-only">
      Search by part number, product, or equipment model
    </label>
    <Search
      aria-hidden
      className={cn(
        'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint',
        size === 'lg' ? 'size-5' : 'size-4',
      )}
    />
    <input
      id={id}
      type="search"
      name="q"
      defaultValue={defaultValue}
      autoFocus={autoFocus}
      placeholder={
        size === 'lg' ? 'Part number, product, or equipment model…' : 'Search part number…'
      }
      className={cn(
        'w-full rounded-control border border-line-strong bg-surface font-mono text-ink',
        'placeholder:font-sans placeholder:text-ink-faint',
        'transition-colors hover:border-ink-faint',
        'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
        size === 'lg' ? 'h-14 pl-11 pr-28 text-base' : 'h-10 pl-9 pr-3 text-sm',
      )}
    />
    {size === 'lg' && (
      <button
        type="submit"
        className="absolute right-2 top-1/2 h-10 -translate-y-1/2 rounded-control bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
      >
        Search
      </button>
    )}
  </form>
)
