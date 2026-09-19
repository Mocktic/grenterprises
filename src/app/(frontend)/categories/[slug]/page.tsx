import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductGrid } from '@/components/site/product-card'
import { Breadcrumbs } from '@/components/site/breadcrumbs'
import { Pagination } from '@/components/site/pagination'
import { QuoteDialog } from '@/components/site/quote-dialog'
import { getCategoryBySlug, listProducts } from '@/lib/catalogue'
import { getSiteSettings } from '@/lib/site'
import { JsonLd } from '@/components/ui/json-ld'
import { breadcrumbJsonLd, metaFrom } from '@/lib/seo'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return { title: 'Category not found' }

  return {
    ...metaFrom(
      category,
      category.description ??
      `${category.name} supplied by GR Enterprises, Mohali — serving Chandigarh, Mohali, Panchkula and hospitals across India.`,
    ),
    alternates: { canonical: `/categories/${category.slug}` },
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)

  const [category, settings] = await Promise.all([getCategoryBySlug(slug), getSiteSettings()])
  if (!category) notFound()

  const result = await listProducts({ categoryId: category.id, page, limit: 24 })

  const trail = [
    { name: 'Home', href: '/' },
    { name: category.name, href: `/categories/${category.slug}` },
  ]

  return (
    <div className="px-4 py-6 lg:px-10 lg:py-8">
      <JsonLd data={breadcrumbJsonLd(trail)} />
      <Breadcrumbs trail={trail} />

      <header className="mt-4 mb-8 max-w-2xl">
        <h1 className="text-h1">{category.name}</h1>
        {category.description && <p className="mt-3 text-ink-muted">{category.description}</p>}
        <p className="mt-3 text-sm text-ink-faint">
          {result.totalDocs} {result.totalDocs === 1 ? 'product' : 'products'} · Supplied across
          India from {settings.city}
        </p>
      </header>

      <ProductGrid products={result.docs} />
      <Pagination page={page} totalPages={result.totalPages} basePath={`/categories/${slug}`} />

      <section className="mt-14 rounded-card border border-line bg-surface-muted p-6 lg:p-8">
        <h2 className="text-h2">Looking for something not listed?</h2>
        <p className="mt-2 max-w-2xl text-ink-muted">
          We stock considerably more than appears here, including compatible consumables for older
          equipment. Send us the make and model and we will check.
        </p>
        <QuoteDialog label="Ask about a part" className="mt-5" />
      </section>
    </div>
  )
}
