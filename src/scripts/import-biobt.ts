import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { getPayload } from 'payload'
import config from '@payload-config'
import { categories, products } from './biobt/catalogue'

/**
 * Imports the BioBT range: three categories, six products, images and all.
 *
 * Everything goes through Payload's Local API rather than SQL, so the admin
 * panel, the generated image sizes and the front end all stay in step.
 *
 * Originals are downscaled to 1600px and recompressed before upload. One of
 * BioBT's source images is 1.1 MB, and Vercel Blob's Hobby tier allows only
 * 1 GB of storage and 2,000 uploads a month — there is no reason to spend
 * either on pixels no layout will ever display.
 *
 * Idempotent: products and categories are matched by slug and updated rather
 * than duplicated, so a re-run refreshes copy without creating a second set.
 */

const REMOTE = 'https://biobt.in'
const STAGED = '/tmp/biobt'
const WORK = '/tmp/biobt-optimised'

const brandName = 'BioBT'

const sourceFor = async (filename: string): Promise<Buffer> => {
  const staged = path.join(STAGED, filename)
  if (fs.existsSync(staged)) return fs.readFileSync(staged)

  const res = await fetch(`${REMOTE}/${filename}`)
  if (!res.ok) throw new Error(`${filename} — HTTP ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

const optimise = async (filename: string): Promise<string> => {
  fs.mkdirSync(WORK, { recursive: true })
  const input = await sourceFor(filename)
  const meta = await sharp(input).metadata()
  const isPng = (meta.format ?? '') === 'png'
  const out = path.join(WORK, filename.replace(/\.(jpe?g|png)$/i, isPng ? '.png' : '.jpg'))

  let pipeline = sharp(input).resize({ width: 1600, withoutEnlargement: true })
  pipeline = isPng ? pipeline.png({ quality: 82, compressionLevel: 9 }) : pipeline.jpeg({ quality: 84, mozjpeg: true })
  await pipeline.toFile(out)
  return out
}

const run = async () => {
  const payload = await getPayload({ config })

  const brand = (
    await payload.find({ collection: 'brands', where: { name: { equals: brandName } }, limit: 1 })
  ).docs[0]
  if (!brand) throw new Error(`Brand "${brandName}" not found — add it before importing`)

  // ---- Categories ----
  const categoryIds = new Map<string, number>()
  for (const [index, category] of categories.entries()) {
    const existing = (
      await payload.find({ collection: 'categories', where: { slug: { equals: category.slug } }, limit: 1 })
    ).docs[0]

    const data = {
      name: category.name,
      slug: category.slug,
      description: category.description,
      displayOrder: index,
      seo: { metaTitle: category.metaTitle, metaDescription: category.metaDescription },
    }

    const doc = existing
      ? await payload.update({ collection: 'categories', id: existing.id, data })
      : await payload.create({ collection: 'categories', data })
    categoryIds.set(category.slug, doc.id as number)
    payload.logger.info(`category: ${category.name}`)
  }

  // ---- Products ----
  for (const product of products) {
    const imageIds: number[] = []

    for (const [index, filename] of product.images.entries()) {
      const existing = (
        await payload.find({ collection: 'media', where: { filename: { equals: filename } }, limit: 1 })
      ).docs[0]

      if (existing) {
        imageIds.push(existing.id as number)
        continue
      }

      const optimised = await optimise(filename)
      const media = await payload.create({
        collection: 'media',
        data: {
          alt:
            index === 0
              ? `${product.name} — ${product.shortDescription.replace(/\.$/, '')}`
              : `${product.name}, view ${index + 1}`,
          credit: `Product image supplied by BioBT (biobt.in)`,
        },
        filePath: optimised,
      })
      imageIds.push(media.id as number)
    }

    const existing = (
      await payload.find({ collection: 'products', where: { slug: { equals: product.slug } }, limit: 1 })
    ).docs[0]

    const data = {
      name: product.name,
      slug: product.slug,
      partNumber: product.partNumber,
      category: categoryIds.get(product.categorySlug)!,
      brand: brand.id,
      shortDescription: product.shortDescription,
      description: product.description,
      specifications: product.specifications,
      images: imageIds,
      availability: 'in-stock' as const,
      featured: Boolean(product.featured),
      showPrice: false,
      seo: { metaTitle: product.metaTitle, metaDescription: product.metaDescription },
    }

    await (existing
      ? payload.update({ collection: 'products', id: existing.id, data })
      : payload.create({ collection: 'products', data }))

    payload.logger.info(`product: ${product.name} (${imageIds.length} image${imageIds.length === 1 ? '' : 's'})`)
  }

  payload.logger.info(`Done — ${categories.length} categories, ${products.length} products.`)
  process.exit(0)
}

try {
  await run()
} catch (error) {
  console.error('Import failed:', error)
  process.exit(1)
}
