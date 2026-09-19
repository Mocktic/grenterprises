import type { Product } from '@/payload-types'

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export const formatPrice = (value: number) => inr.format(value)

export const hasVisiblePrice = (product: Pick<Product, 'showPrice' | 'price'>) =>
  Boolean(product.showPrice) && typeof product.price === 'number' && product.price > 0

/**
 * Products without a visible price read "Price on request". Get a Quote is
 * present either way — showing a price must never remove the enquiry path,
 * because the enquiry is the entire point of the site.
 */
export const priceLabel = (product: Pick<Product, 'showPrice' | 'price'>) =>
  hasVisiblePrice(product) ? formatPrice(product.price as number) : 'Price on request'
