import Image from 'next/image'
import Link from 'next/link'
import { ImagePlaceholder } from '@/components/ui/image-placeholder'
import { SpecPlate } from '@/components/ui/spec-plate'
import { AvailabilityBadge, Badge } from '@/components/ui/badge'
import { QuoteDialog } from './quote-dialog'
import { primaryImage, mediaUrl } from '@/lib/media'
import { priceLabel, hasVisiblePrice } from '@/lib/price'
import type { Product } from '@/payload-types'

export const ProductCard = ({ product }: { product: Product }) => {
  const image = primaryImage(product)
  const fits = (product.compatibleWith ?? []).slice(0, 2)
  const extraFits = (product.compatibleWith?.length ?? 0) - fits.length

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface transition-colors hover:border-line-strong">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-4/3 overflow-hidden bg-surface-muted"
        tabIndex={-1}
        aria-hidden={!image}
      >
        {image ? (
          <Image
            src={mediaUrl(image, 'card')}
            alt={image.alt ?? product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 25vw"
            className="object-contain p-4 transition-transform duration-200 group-hover:scale-[1.02]"
          />
        ) : (
          <ImagePlaceholder />
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[0.9375rem] font-semibold leading-snug">
            <Link
              href={`/products/${product.slug}`}
              className="text-ink transition-colors hover:text-primary"
            >
              {product.name}
            </Link>
          </h3>
          <AvailabilityBadge value={product.availability} />
        </div>

        {product.partNumber && <SpecPlate value={product.partNumber} className="self-start" />}

        {fits.length > 0 && (
          <ul className="flex flex-wrap gap-1">
            {fits.map((fit, i) => (
              <li key={`${fit.manufacturer}-${fit.model}-${i}`}>
                <Badge tone="brand">
                  {fit.manufacturer} {fit.model}
                </Badge>
              </li>
            ))}
            {extraFits > 0 && <Badge>+{extraFits} more</Badge>}
          </ul>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <p
            className={
              hasVisiblePrice(product)
                ? 'font-mono text-base font-medium text-ink'
                : 'text-sm text-ink-faint'
            }
          >
            {priceLabel(product)}
          </p>
          <QuoteDialog
            productId={product.id}
            productName={product.name}
            partNumber={product.partNumber}
            size="sm"
            label="Get a quote"
          />
        </div>
      </div>
    </article>
  )
}

export const ProductGrid = ({ products }: { products: Product[] }) => {
  if (products.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-line-strong p-10 text-center">
        <p className="font-medium text-ink">Nothing here yet</p>
        <p className="mt-1 text-sm text-ink-muted">
          Products added in the admin panel appear here automatically.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
