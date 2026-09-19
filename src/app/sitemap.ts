import type { MetadataRoute } from 'next'
import { getPayloadClient } from '@/lib/payload'

const base = () => process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayloadClient()

  const [products, categories, brands] = await Promise.all([
    payload.find({ collection: 'products', limit: 2000, depth: 0, select: { slug: true, updatedAt: true } }),
    payload.find({ collection: 'categories', limit: 300, depth: 0, select: { slug: true, updatedAt: true } }),
    payload.find({ collection: 'brands', limit: 300, depth: 0, select: { slug: true, updatedAt: true } }),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base()}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${base()}/products`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base()}/about`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${base()}/contact`, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${base()}/quote`, changeFrequency: 'yearly', priority: 0.7 },
  ]

  return [
    ...staticRoutes,
    ...categories.docs.map((c) => ({
      url: `${base()}/categories/${c.slug}`,
      lastModified: c.updatedAt ? new Date(c.updatedAt) : undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...products.docs.map((p) => ({
      url: `${base()}/products/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...brands.docs.map((b) => ({
      url: `${base()}/brands/${b.slug}`,
      lastModified: b.updatedAt ? new Date(b.updatedAt) : undefined,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]
}
