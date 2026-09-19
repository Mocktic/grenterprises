import type { Metadata } from 'next'
import { ProductGrid } from '@/components/site/product-card'
import { Breadcrumbs } from '@/components/site/breadcrumbs'
import { Pagination } from '@/components/site/pagination'
import { listProducts } from '@/lib/catalogue'

export const metadata: Metadata = {
  title: 'All products',
  description:
    'The full GR Enterprises catalogue — medical equipment, sensors, cables, consumables and compatible spares for hospitals across India.',
  alternates: { canonical: '/products' },
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const result = await listProducts({ page, limit: 24 })

  return (
    <div className="px-4 py-6 lg:px-10 lg:py-8">
      <Breadcrumbs trail={[{ name: 'Home', href: '/' }, { name: 'All products', href: '/products' }]} />

      <header className="mt-4 mb-8">
        <h1 className="text-h1">All products</h1>
        <p className="mt-2 text-ink-muted">
          {result.totalDocs} {result.totalDocs === 1 ? 'product' : 'products'} in the catalogue.
          Every one is available to quote.
        </p>
      </header>

      <ProductGrid products={result.docs} />
      <Pagination page={page} totalPages={result.totalPages} basePath="/products" />
    </div>
  )
}
