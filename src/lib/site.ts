import { cache } from 'react'
import { getPayloadClient } from './payload'
import type { SiteSetting } from '@/payload-types'

/** Sensible values so the site renders before the owner has filled anything in. */
const fallback = {
  phone: '+91 94653 24507',
  whatsappNumber: '919465324507',
  email: 'grenterprises0409@gmail.com',
  address: 'Plot No. F-247, Industrial Area, Phase 8B, S.A.S. Nagar, Mohali',
  city: 'Mohali',
  state: 'Punjab',
  postalCode: '160055',
  establishedYear: 1994,
  gstin: '03EDKPS3373H1ZB',
  msmeNumber: 'PB-20-0092585',
  drugLicenceNumber: 'MD42-PB/SAS/2025/000024',
  openingHours: 'Mon–Sat, 9:30am–7pm',
  priceDisclaimer: 'All prices exclusive of GST. Subject to change without notice.',
} satisfies Partial<SiteSetting>

export type SiteDetails = SiteSetting & typeof fallback

/**
 * Drops null, undefined and empty-string values so they cannot overwrite a
 * fallback. Payload creates the global row with every optional field null the
 * first time it is read, and a plain spread would then blank out the phone
 * number, address and city across the entire site.
 */
const defined = (obj: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== null && value !== undefined && value !== ''),
  )

export const getSiteSettings = cache(async (): Promise<SiteDetails> => {
  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 1 })
  return { ...fallback, ...defined((settings ?? {}) as unknown as Record<string, unknown>) } as SiteDetails
})

export const whatsappLink = (number: string, message?: string) =>
  `https://wa.me/${number.replace(/\D/g, '')}${message ? `?text=${encodeURIComponent(message)}` : ''}`

export const telLink = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`

/**
 * Turns whatever the owner pasted into something an iframe can actually load.
 *
 * Google's "Share → Embed a map" button copies a complete <iframe> tag, which
 * is the natural thing to paste and which breaks if dropped straight into src.
 * A plain share or place link is no better: Google refuses to be framed from
 * those URLs and the panel renders blank with no error.
 *
 * So: pull the src out of a pasted tag, accept a bare /maps/embed URL, and for
 * anything else fall back to an address query, which needs no API key and is
 * frameable. With nothing configured at all the address still yields a map, so
 * the contact page is never broken by an empty field.
 */
export const mapEmbedSrc = (settings: SiteDetails): string => {
  const raw = (settings.mapEmbedUrl ?? '').trim()
  const fromTag = raw.match(/<iframe[^>]*\ssrc=["']([^"']+)["']/i)?.[1]
  const candidate = (fromTag ?? raw).trim()

  if (candidate.includes('/maps/embed')) return candidate

  const query = [settings.address, settings.city, settings.state, settings.postalCode]
    .filter(Boolean)
    .join(', ')
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`
}

/**
 * The postal address as one line, appending city, state and postcode only when
 * they are not already written into the address field. Owners naturally type
 * the whole address into one box, and blindly concatenating the separate parts
 * produced "…Mohali, Punjab, 160055, Mohali, Punjab, 160055".
 */
export const formattedAddress = (settings: SiteDetails): string => {
  const base = (settings.address ?? '').trim()
  const missing = [settings.city, settings.state, settings.postalCode]
    .filter((part): part is string => Boolean(part && String(part).trim()))
    .filter((part) => !base.toLowerCase().includes(String(part).trim().toLowerCase()))
  return [base, ...missing].filter(Boolean).join(', ')
}

/**
 * Pre-filled WhatsApp text for a specific product.
 *
 * The part number and a link are included because the owner answers these on a
 * phone: without them the first reply is always "which one?", and a part number
 * retyped from memory is a part number typed wrong.
 */
export const productEnquiryMessage = (product: {
  name: string
  slug?: string | null
  partNumber?: string | null
}): string => {
  const base = process.env.NEXT_PUBLIC_SERVER_URL ?? ''
  return [
    'Hello GR Enterprises, I would like a quote for:',
    product.name,
    product.partNumber ? `Part number: ${product.partNumber}` : null,
    product.slug && base ? `${base}/products/${product.slug}` : null,
  ]
    .filter(Boolean)
    .join('\n')
}
