'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CategoryNode } from '@/lib/catalogue'

export const CategoryList = ({
  categories,
  onNavigate,
}: {
  categories: CategoryNode[]
  onNavigate?: () => void
}) => {
  const pathname = usePathname()
  const isActive = (slug?: string | null) => pathname === `/categories/${slug}`

  if (categories.length === 0) {
    return (
      <nav aria-label="Product categories">
        <Link
          href="/products"
          onClick={onNavigate}
          className="flex items-center justify-between rounded-control px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-muted"
        >
          All products
          <ArrowRight aria-hidden className="size-3.5 text-ink-faint" />
        </Link>
        <p className="px-3 pt-3 text-sm text-ink-faint">
          No categories yet. Add them in the admin panel.
        </p>
      </nav>
    )
  }

  return (
    <nav aria-label="Product categories">
      <ul className="space-y-0.5">
        <li className="mb-1 border-b border-line pb-1">
          <Link
            href="/products"
            onClick={onNavigate}
            aria-current={pathname === '/products' ? 'page' : undefined}
            className={cn(
              'flex items-center justify-between rounded-control px-3 py-2 text-sm font-medium transition-colors',
              pathname === '/products'
                ? 'bg-primary-soft text-primary-deep'
                : 'text-ink hover:bg-surface-muted',
            )}
          >
            All products
            <ArrowRight aria-hidden className="size-3.5 text-ink-faint" />
          </Link>
        </li>
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              href={`/categories/${category.slug}`}
              onClick={onNavigate}
              aria-current={isActive(category.slug) ? 'page' : undefined}
              className={cn(
                'flex items-center rounded-control px-3 py-2 text-sm transition-colors',
                isActive(category.slug)
                  ? 'bg-primary-soft font-medium text-primary-deep'
                  : 'text-ink-muted hover:bg-surface-muted hover:text-ink',
              )}
            >
              {category.name}
            </Link>

            {category.children.length > 0 && (
              <ul className="ml-3 border-l border-line pl-2">
                {category.children.map((child) => (
                  <li key={child.id}>
                    <Link
                      href={`/categories/${child.slug}`}
                      onClick={onNavigate}
                      aria-current={isActive(child.slug) ? 'page' : undefined}
                      className={cn(
                        'block rounded-control px-3 py-1.5 text-sm transition-colors',
                        isActive(child.slug)
                          ? 'font-medium text-primary-deep'
                          : 'text-ink-faint hover:text-ink',
                      )}
                    >
                      {child.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}

export const CategorySidebar = ({ categories }: { categories: CategoryNode[] }) => (
  <aside className="hidden w-sidebar shrink-0 border-r border-line bg-surface-muted lg:block">
    <div className="sticky top-[5.5rem] max-h-[calc(100vh-6rem)] overflow-y-auto p-3">
      <p className="eyebrow px-3 pb-2 pt-1">Catalogue</p>
      <CategoryList categories={categories} />
    </div>
  </aside>
)
