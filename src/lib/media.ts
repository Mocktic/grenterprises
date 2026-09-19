import type { Media, Product } from '@/payload-types'

export const isMedia = (value: unknown): value is Media =>
  typeof value === 'object' && value !== null && 'url' in (value as Media)

export const productImages = (product: Product): Media[] =>
  (Array.isArray(product.images) ? product.images : []).filter(isMedia)

export const primaryImage = (product: Product): Media | null => productImages(product)[0] ?? null

type SizeName = 'thumbnail' | 'card' | 'hero'

export const mediaUrl = (media: Media, size?: SizeName): string => {
  if (size && media.sizes?.[size]?.url) return media.sizes[size].url as string
  return media.url ?? ''
}
