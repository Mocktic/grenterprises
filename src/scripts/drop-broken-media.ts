import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Removes media records whose underlying file no longer exists.
 *
 * `laptop_spiro.png` and `download.jpeg` were lost in an earlier failed storage
 * migration. The BioBT import then matched `laptop_spiro.png` by filename and
 * reused the broken record for SpiroBT, so the product pointed at a file that
 * was not there. Dropping the records lets the import recreate them from source.
 */
const BROKEN = ['laptop_spiro.png', 'download.jpeg']

const run = async () => {
  const payload = await getPayload({ config })
  for (const filename of BROKEN) {
    const { docs } = await payload.find({
      collection: 'media',
      where: { filename: { equals: filename } },
      limit: 1,
    })
    if (!docs[0]) { payload.logger.info(`${filename}: already gone`); continue }

    const { docs: users } = await payload.find({
      collection: 'products',
      where: { images: { in: [docs[0].id] } },
      limit: 20,
      depth: 0,
    })
    for (const product of users) {
      const remaining = (product.images as (number | { id: number })[] | undefined)
        ?.map((i) => (typeof i === 'object' ? i.id : i))
        .filter((id) => id !== docs[0].id)
      await payload.update({ collection: 'products', id: product.id, data: { images: remaining ?? [] } })
      payload.logger.info(`  detached from ${product.name}`)
    }

    await payload.delete({ collection: 'media', id: docs[0].id })
    payload.logger.info(`${filename}: removed`)
  }
  process.exit(0)
}

try { await run() } catch (e) { console.error('Failed:', e); process.exit(1) }
