'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductCard } from './product-card'
import { cn } from '@/lib/utils'
import type { Product } from '@/payload-types'

/**
 * A horizontally scrolling row of products.
 *
 * The container is focusable and labelled so it can be scrolled with the arrow
 * keys — a scroll region that only responds to a trackpad shuts out anyone
 * using a keyboard. The buttons are an addition for pointer users, and hide
 * themselves at each end rather than sitting there disabled.
 */
export const ProductScroller = ({ products, label }: { products: Product[]; label: string }) => {
  const trackRef = useRef<HTMLUListElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const sync = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= 4)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    sync()
    const el = trackRef.current
    if (!el) return
    const observer = new ResizeObserver(sync)
    observer.observe(el)
    return () => observer.disconnect()
  }, [sync])

  const nudge = (direction: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: direction * Math.max(el.clientWidth * 0.8, 240), behavior: 'smooth' })
  }

  const arrow =
    'absolute top-1/2 z-10 hidden size-9 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface shadow-md transition-opacity hover:bg-surface-muted lg:grid'

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => nudge(-1)}
        aria-label={`Scroll ${label} left`}
        className={cn(arrow, '-left-4', atStart && 'pointer-events-none opacity-0')}
      >
        <ChevronLeft className="size-4 text-ink" aria-hidden />
      </button>

      <ul
        ref={trackRef}
        onScroll={sync}
        tabIndex={0}
        role="region"
        aria-label={label}
        className="no-scrollbar flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto scroll-smooth pb-1"
      >
        {products.map((product) => (
          <li key={product.id} className="w-[15rem] shrink-0 snap-start sm:w-[16.5rem]">
            <ProductCard product={product} />
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => nudge(1)}
        aria-label={`Scroll ${label} right`}
        className={cn(arrow, '-right-4', atEnd && 'pointer-events-none opacity-0')}
      >
        <ChevronRight className="size-4 text-ink" aria-hidden />
      </button>
    </div>
  )
}
