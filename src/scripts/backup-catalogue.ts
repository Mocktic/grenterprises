import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import config from '@payload-config'

/** Dumps products and categories to JSON before any destructive change. */
const run = async () => {
  const payload = await getPayload({ config })

  const [products, categories, brands] = await Promise.all([
    payload.find({ collection: 'products', limit: 1000, depth: 1 }),
    payload.find({ collection: 'categories', limit: 500, depth: 1 }),
    payload.find({ collection: 'brands', limit: 500, depth: 1 }),
  ])

  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const dir = path.resolve(`catalogue-backup-${stamp}`)
  fs.mkdirSync(dir, { recursive: true })

  const write = (name: string, data: unknown) => {
    const file = path.join(dir, `${name}.json`)
    fs.writeFileSync(file, JSON.stringify(data, null, 2))
    return fs.statSync(file).size
  }

  const sizes = {
    products: write('products', products.docs),
    categories: write('categories', categories.docs),
    brands: write('brands', brands.docs),
  }

  payload.logger.info(`Backup written to ${dir}`)
  payload.logger.info(
    `  products ${products.totalDocs} (${sizes.products}b) · ` +
      `categories ${categories.totalDocs} (${sizes.categories}b) · ` +
      `brands ${brands.totalDocs} (${sizes.brands}b)`,
  )

  if (products.totalDocs > 0 && sizes.products < 100) {
    throw new Error('Backup looks empty despite products existing — refusing to continue')
  }

  process.exit(0)
}

try {
  await run()
} catch (error) {
  console.error('Backup failed:', error)
  process.exit(1)
}
