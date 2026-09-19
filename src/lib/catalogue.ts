import { cache } from 'react'
import { getPayloadClient } from './payload'
import type { Where } from 'payload'
import type { Brand, Category, Product } from '@/payload-types'

export type CategoryNode = Category & { children: Category[] }

const relId = (value: unknown): string | number | null => {
  if (value == null) return null
  if (typeof value === 'object') return (value as { id: string | number }).id
  return value as string | number
}

/** Two levels deep — the sidebar cannot usefully render more. */
export const getCategoryTree = cache(async (): Promise<CategoryNode[]> => {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'categories',
      limit: 300,
      depth: 0,
      sort: ['displayOrder', 'name'],
    })

    const roots = docs.filter((c) => !c.parent)
    return roots.map((root) => ({
      ...root,
      children: docs.filter((c) => relId(c.parent) === root.id),
    }))
})

export const getCategoryBySlug = async (slug: string): Promise<Category | null> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })
  return docs[0] ?? null
}

export const getBrandBySlug = async (slug: string): Promise<Brand | null> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'brands',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })
  return docs[0] ?? null
}

export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  })
  return docs[0] ?? null
}

type ListArgs = {
  categoryId?: string | number
  brandId?: string | number
  page?: number
  limit?: number
}

export const listProducts = async ({ categoryId, brandId, page = 1, limit = 24 }: ListArgs = {}) => {
  const payload = await getPayloadClient()
  const where: Where = {}
  if (categoryId) where.category = { equals: categoryId }
  if (brandId) where.brand = { equals: brandId }

  return payload.find({
    collection: 'products',
    where,
    page,
    limit,
    depth: 1,
    sort: ['-featured', 'name'],
  })
}

export const getFeaturedProducts = cache(async (limit = 8) => {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'products',
      where: { featured: { equals: true } },
      limit,
      depth: 1,
      sort: 'name',
    })
  return docs
})

export const getBrands = cache(async () => {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'brands',
      limit: 100,
      depth: 1,
      sort: 'name',
    })
  return docs
})

/**
 * Part number first. Someone typing `989803206781` wants that exact part, not a
 * fuzzy match, so exact hits are queried separately and placed at the top.
 */
export const searchProducts = async (query: string, limit = 40) => {
  const q = query.trim()
  if (!q) return { exact: [] as Product[], related: [] as Product[] }

  const payload = await getPayloadClient()

  /**
   * Brands are matched by resolving their ids first rather than querying
   * `brand.name` through the relationship. The join-based form is fussier
   * across database adapters, and this is two cheap queries against a table
   * with a handful of rows.
   */
  const { docs: brands } = await payload.find({
    collection: 'brands',
    where: { name: { like: q } },
    limit: 25,
    depth: 0,
  })
  const brandIds = brands.map((b) => b.id)

  const { docs: exact } = await payload.find({
    collection: 'products',
    where: {
      or: [{ partNumber: { equals: q } }, { 'variants.partNumber': { equals: q } }],
    },
    limit: 10,
    depth: 1,
  })

  const exactIds = exact.map((d) => d.id)
  const { docs: related } = await payload.find({
    collection: 'products',
    where: {
      and: [
        exactIds.length ? { id: { not_in: exactIds } } : {},
        {
          or: [
            { name: { like: q } },
            { partNumber: { like: q } },
            { shortDescription: { like: q } },
            { 'compatibleWith.model': { like: q } },
            { 'compatibleWith.manufacturer': { like: q } },
            { 'variants.partNumber': { like: q } },
            ...(brandIds.length ? [{ brand: { in: brandIds } }] : []),
          ],
        },
      ],
    },
    limit,
    depth: 1,
  })

  return { exact, related }
}

/**
 * Categories for the home page, each with a handful of products.
 *
 * "Popular" here means the order the owner set in the sidebar — there is no
 * click data to rank by, and letting them control it from the admin beats
 * inventing a metric. Categories with nothing in them are skipped so the home
 * page never shows an empty row.
 */
export const getCategoryShowcase = cache(async (categoryLimit = 6, productLimit = 10) => {
  const payload = await getPayloadClient()
  const tree = await getCategoryTree()

  const rows = await Promise.all(
    tree.slice(0, categoryLimit).map(async (category) => {
      const { docs, totalDocs } = await payload.find({
        collection: 'products',
        where: { category: { equals: category.id } },
        limit: productLimit,
        depth: 1,
        sort: ['-featured', 'name'],
      })
      return { category, products: docs, total: totalDocs }
    }),
  )

  return rows.filter((row) => row.products.length > 0)
})
