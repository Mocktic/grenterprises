import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductGrid } from '@/components/site/product-card'
import { Breadcrumbs } from '@/components/site/breadcrumbs'
import { Pagination } from '@/components/site/pagination'
import { getBrandBySlug, listProducts } from '@/lib/catalogue'
import { JsonLd } from '@/components/ui/json-ld'
import { breadcrumbJsonLd, metaFrom } from '@/lib/seo'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { slug } = await params
  const brand = await getBrandBySlug(slug)
  if (!brand) return { title: 'Brand not found' }

  return {
    ...metaFrom(
      brand,
      brand.description ??
      `${brand.name} accessories, consumables and compatible spares supplied by GR Enterprises, Mohali.`,
    ),
    alternates: { canonical: `/brands/${brand.slug}` },
  }
}

export default async function BrandPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)

  const brand = await getBrandBySlug(slug)
  if (!brand) notFound()

  const result = await listProducts({ brandId: brand.id, page, limit: 24 })
  const trail = [
    { name: 'Home', href: '/' },
    { name: brand.name, href: `/brands/${brand.slug}` },
  ]

  return (
    <div className="px-4 py-6 lg:px-10 lg:py-8">
      <JsonLd data={breadcrumbJsonLd(trail)} />
      <Breadcrumbs trail={trail} />

      <header className="mt-4 mb-8 max-w-2xl">
        <p className="eyebrow">Compatible with</p>
        <h1 className="mt-1 text-h1">{brand.name}</h1>
        {brand.description && <p className="mt-3 text-ink-muted">{brand.description}</p>}
      </header>

      <ProductGrid products={result.docs} />
      <Pagination page={page} totalPages={result.totalPages} basePath={`/brands/${slug}`} />
    </div>
  )
}
