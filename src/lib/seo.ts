import type { Product } from '@/payload-types'
import type { SiteDetails } from './site'
import { hasVisiblePrice } from './price'
import { primaryImage, mediaUrl } from './media'

const baseUrl = () => process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'

export const localBusinessJsonLd = (settings: SiteDetails) => ({
  '@context': 'https://schema.org',
  '@type': 'MedicalBusiness',
  name: 'GR Enterprises',
  url: baseUrl(),
  telephone: settings.phone,
  email: settings.email,
  foundingDate: String(settings.establishedYear),
  address: {
    '@type': 'PostalAddress',
    streetAddress: settings.address,
    addressLocality: settings.city,
    addressRegion: settings.state,
    postalCode: settings.postalCode,
    addressCountry: 'IN',
  },
  areaServed: ['Chandigarh', 'Mohali', 'Panchkula', 'India'],
})

/**
 * `offers` is included only when the price is actually visible on the page.
 * Structured data that contradicts the rendered page is a manual-action risk,
 * so a hidden price means no offer block rather than a fabricated one.
 */
export const productJsonLd = (product: Product) => {
  const image = primaryImage(product)
  const brandName = typeof product.brand === 'object' ? product.brand?.name : undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription ?? undefined,
    sku: product.partNumber ?? undefined,
    mpn: product.partNumber ?? undefined,
    ...(image ? { image: [new URL(mediaUrl(image, 'hero'), baseUrl()).toString()] } : {}),
    ...(brandName ? { brand: { '@type': 'Brand', name: brandName } } : {}),
    ...(hasVisiblePrice(product)
      ? {
          offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'INR',
            availability:
              product.availability === 'in-stock'
                ? 'https://schema.org/InStock'
                : product.availability === 'made-to-order'
                  ? 'https://schema.org/BackOrder'
                  : 'https://schema.org/Discontinued',
            seller: { '@type': 'Organization', name: 'GR Enterprises' },
            url: `${baseUrl()}/products/${product.slug}`,
          },
        }
      : {}),
  }
}

export const breadcrumbJsonLd = (trail: { name: string; href: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: trail.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: `${baseUrl()}${item.href}`,
  })),
})

/**
 * Structural rather than tied to a collection type: every document with a name
 * and an optional seo group can use it, and the caller supplies the fallback
 * description because only the caller knows what reads well for that page.
 */
type SeoDoc = {
  name: string
  seo?: { metaTitle?: string | null; metaDescription?: string | null } | null
}

export const metaFrom = (doc: SeoDoc, fallbackDescription?: string) => ({
  title: doc.seo?.metaTitle || doc.name,
  description: doc.seo?.metaDescription || fallbackDescription || undefined,
})
