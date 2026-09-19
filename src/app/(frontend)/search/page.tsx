import type { Metadata } from 'next'
import { ProductGrid } from '@/components/site/product-card'
import { Pagination } from '@/components/site/pagination'
import { QuoteDialog } from '@/components/site/quote-dialog'
import { listProducts, searchProducts } from '@/lib/catalogue'

export const metadata: Metadata = {
  title: 'Search',
  robots: { index: false, follow: true },
}

/**
 * There is deliberately no search field on this page — the header carries the
 * only one, and it stays filled with the current query. Two fields showing the
 * same state is a bug waiting to happen.
 *
 * An empty query lists everything rather than showing a blank page: clearing
 * the box should feel like removing a filter, not like losing the catalogue.
 */
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const { q, page: pageParam } = await searchParams
  const query = (q ?? '').trim()

  if (!query) {
    const page = Math.max(1, Number(pageParam) || 1)
    const result = await listProducts({ page, limit: 24 })

    return (
      <div className="px-4 py-6 lg:px-10 lg:py-8">
        <header className="mb-8">
          <h1 className="text-h1">All products</h1>
          <p className="mt-2 text-ink-muted">
            {result.totalDocs} {result.totalDocs === 1 ? 'product' : 'products'} in the catalogue.
            Search a part number above to narrow it down.
          </p>
        </header>

        <ProductGrid products={result.docs} />
        <Pagination page={page} totalPages={result.totalPages} basePath="/search" />
      </div>
    )
  }

  const { exact, related } = await searchProducts(query)
  const total = exact.length + related.length

  return (
    <div className="px-4 py-6 lg:px-10 lg:py-8">
      <header className="mb-8">
        <h1 className="text-h1">
          Results for <span className="font-mono">{query}</span>
        </h1>
        <p className="mt-2 text-ink-muted">
          {total === 0
            ? 'Nothing in the catalogue matches that yet.'
            : `${total} ${total === 1 ? 'match' : 'matches'}.`}
        </p>
      </header>

      {exact.length > 0 && (
        <section className="mb-10">
          <p className="eyebrow">Exact part number match</p>
          <div className="mt-4">
            <ProductGrid products={exact} />
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section>
          {exact.length > 0 && <p className="eyebrow">Also matching</p>}
          <div className={exact.length > 0 ? 'mt-4' : ''}>
            <ProductGrid products={related} />
          </div>
        </section>
      )}

      {total === 0 && (
        <section className="max-w-2xl rounded-card border border-line bg-surface-muted p-6 lg:p-8">
          <h2 className="text-h2">We may still have it</h2>
          <p className="mt-2 text-ink-muted">
            Not everything we stock is listed on the site yet, particularly consumables for older
            equipment. Send us the part number or the make and model of your machine, and we will
            check and come back to you.
          </p>
          <QuoteDialog label="Ask about this part" className="mt-5" size="lg" />
        </section>
      )}
    </div>
  )
}
