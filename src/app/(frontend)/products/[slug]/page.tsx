import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { Breadcrumbs } from '@/components/site/breadcrumbs'
import { ProductGallery } from '@/components/site/product-gallery'
import { ProductGrid } from '@/components/site/product-card'
import { QuoteDialog } from '@/components/site/quote-dialog'
import { SpecPlate } from '@/components/ui/spec-plate'
import { AvailabilityBadge, Badge } from '@/components/ui/badge'
import { getProductBySlug, listProducts } from '@/lib/catalogue'
import { getPayloadClient } from '@/lib/payload'
import { getSiteSettings, telLink } from '@/lib/site'
import { productImages } from '@/lib/media'
import { hasVisiblePrice, priceLabel } from '@/lib/price'
import { JsonLd } from '@/components/ui/json-ld'
import { breadcrumbJsonLd, metaFrom, productJsonLd } from '@/lib/seo'

type Props = { params: Promise<{ slug: string }> }

/**
 * Product pages are prerendered at build time. New products added later render
 * on demand and are then cached, so the owner never waits on a deploy.
 */
export const generateStaticParams = async () => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'products',
    limit: 1000,
    depth: 0,
    select: { slug: true },
  })
  return docs.filter((d) => d.slug).map((d) => ({ slug: d.slug as string }))
}

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: 'Product not found' }

  const meta = metaFrom(
    product,
    product.shortDescription ??
      `${product.name}${product.partNumber ? ` (${product.partNumber})` : ''} — available from GR Enterprises, Mohali.`,
  )
  return {
    ...meta,
    alternates: { canonical: `/products/${product.slug}` },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const [product, settings] = await Promise.all([getProductBySlug(slug), getSiteSettings()])
  if (!product) notFound()

  const images = productImages(product)
  const category = typeof product.category === 'object' ? product.category : null
  const brand = typeof product.brand === 'object' ? product.brand : null

  const related = category
    ? (await listProducts({ categoryId: category.id, limit: 4 })).docs.filter(
        (p) => p.id !== product.id,
      )
    : []

  const trail = [
    { name: 'Home', href: '/' },
    ...(category ? [{ name: category.name, href: `/categories/${category.slug}` }] : []),
    { name: product.name, href: `/products/${product.slug}` },
  ]

  return (
    <div className="px-4 py-6 lg:px-10 lg:py-8">
      <JsonLd data={productJsonLd(product)} />
      <JsonLd data={breadcrumbJsonLd(trail)} />

      <Breadcrumbs trail={trail} />

      {/* On phones the identity block comes first: a full-width gallery would
          otherwise push the title, part number and Get a Quote below the fold,
          which is exactly what a visitor arriving from a part-number search
          needs to see. From lg up it returns to gallery-left, details-right. */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-x-12 lg:gap-y-8">
        <div className="order-1 lg:order-none lg:col-start-2 lg:row-start-1">
          {brand && (
            <Link
              href={`/brands/${brand.slug}`}
              className="eyebrow transition-colors hover:text-primary"
            >
              {brand.name}
            </Link>
          )}

          <h1 className="mt-2 text-h1">{product.name}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {product.partNumber && <SpecPlate value={product.partNumber} copyable />}
            <AvailabilityBadge value={product.availability} />
          </div>

          {product.shortDescription && (
            <p className="mt-5 text-lg text-ink-muted">{product.shortDescription}</p>
          )}
        </div>

        <div className="order-2 lg:order-none lg:col-start-1 lg:row-start-1 lg:row-span-2">
          <ProductGallery images={images} name={product.name} />
        </div>

        <div className="order-3 lg:order-none lg:col-start-2 lg:row-start-2">
          <div className="rounded-card border border-line bg-surface-muted p-5">
            <p
              className={
                hasVisiblePrice(product)
                  ? 'font-mono text-2xl font-medium text-ink'
                  : 'text-xl font-medium text-ink'
              }
            >
              {priceLabel(product)}
            </p>
            {hasVisiblePrice(product) && (product.priceNote || settings.priceDisclaimer) && (
              <p className="mt-1 text-xs text-ink-faint">
                {product.priceNote || settings.priceDisclaimer}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <QuoteDialog
                productId={product.id}
                productName={product.name}
                partNumber={product.partNumber}
                size="lg"
                label="Get a quote"
              />
              <a
                href={telLink(settings.phone)}
                className="inline-flex h-12 items-center rounded-control border border-line-strong bg-surface px-5 font-mono text-sm text-ink transition-colors hover:border-ink-faint"
              >
                {settings.phone}
              </a>
            </div>
            <p className="mt-3 text-xs text-ink-faint">
              We usually reply with a price within one working day.
            </p>
          </div>

          {(product.variants?.length ?? 0) > 0 && (
            <section className="mt-8">
              <h2 className="text-sm font-semibold text-ink">Sizes and options</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {product.variants?.map((variant, i) => (
                  <li
                    key={`${variant.label}-${i}`}
                    className="rounded-control border border-line bg-surface px-3 py-1.5 text-sm"
                  >
                    <span className="text-ink">{variant.label}</span>
                    {variant.partNumber && (
                      <span className="ml-2 font-mono text-xs text-ink-faint">
                        {variant.partNumber}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>

      {/* Stacked rather than tabbed: compatibility data is the most valuable
          content on this page for search, and tabs would hide it from crawlers. */}
      {product.description && (
        <section className="mt-12 max-w-3xl">
          <h2 className="text-h2">Description</h2>
          <div className="prose-gr mt-4 text-ink-muted">
            <RichText data={product.description} />
          </div>
        </section>
      )}

      {(product.specifications?.length ?? 0) > 0 && (
        <section className="mt-12 max-w-3xl">
          <h2 className="text-h2">Specifications</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <tbody>
                {product.specifications?.map((spec, i) => (
                  <tr key={`${spec.label}-${i}`} className="border-b border-line last:border-0">
                    <th
                      scope="row"
                      className="w-2/5 py-2.5 pr-4 text-left font-medium text-ink-muted"
                    >
                      {spec.label}
                    </th>
                    <td className="py-2.5 font-mono text-ink">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {(product.compatibleWith?.length ?? 0) > 0 && (
        <section className="mt-12 max-w-3xl">
          <h2 className="text-h2">Fits these models</h2>
          <p className="mt-2 text-sm text-ink-muted">
            Checked against the equipment listed below. If your model is not here, send it to us and
            we will confirm.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {product.compatibleWith?.map((fit, i) => (
              <li key={`${fit.manufacturer}-${fit.model}-${i}`}>
                <Badge tone="brand" className="px-2.5 py-1 text-sm">
                  <span className="font-medium">{fit.manufacturer}</span>
                  <span className="font-mono">{fit.model}</span>
                </Badge>
              </li>
            ))}
          </ul>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-16 border-t border-line pt-10">
          <h2 className="mb-6 text-h2">More from {category?.name}</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  )
}
