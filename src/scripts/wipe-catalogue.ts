import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Clears products and categories ahead of the BioBT import. Brands are kept.
 *
 * Also removes the placeholder artwork generated earlier (filenames prefixed
 * `product-` or `photo-`) once nothing references it, so the media library does
 * not carry stock that belongs to a catalogue no longer on the site. Hero
 * images and anything uploaded through the admin are left alone.
 *
 * Run backup-catalogue.ts first.
 */
const run = async () => {
  const payload = await getPayload({ config })

  const before = {
    products: (await payload.count({ collection: 'products' })).totalDocs,
    categories: (await payload.count({ collection: 'categories' })).totalDocs,
    brands: (await payload.count({ collection: 'brands' })).totalDocs,
  }
  payload.logger.info(`Before — products ${before.products}, categories ${before.categories}, brands ${before.brands}`)

  // Leads keep their own copy of the enquiry; only the link to the product goes.
  const { docs: leads } = await payload.find({ collection: 'leads', limit: 1000, depth: 0 })
  let unlinked = 0
  for (const lead of leads) {
    if (!lead.product) continue
    await payload.update({ collection: 'leads', id: lead.id, data: { product: null } })
    unlinked += 1
  }
  if (unlinked) payload.logger.info(`Unlinked ${unlinked} lead(s) from products first`)

  await payload.delete({ collection: 'products', where: { id: { exists: true } } })
  await payload.delete({ collection: 'categories', where: { id: { exists: true } } })

  // Placeholder media, only where nothing still points at it
  const { docs: media } = await payload.find({ collection: 'media', limit: 500, depth: 0 })
  let removedMedia = 0
  for (const item of media) {
    if (!/^(product|photo)-/.test(item.filename ?? '')) continue
    const used = await payload.find({
      collection: 'products',
      where: { images: { in: [item.id] } },
      limit: 1,
      depth: 0,
    })
    if (used.totalDocs > 0) continue
    await payload.delete({ collection: 'media', id: item.id })
    removedMedia += 1
  }

  const after = {
    products: (await payload.count({ collection: 'products' })).totalDocs,
    categories: (await payload.count({ collection: 'categories' })).totalDocs,
    brands: (await payload.count({ collection: 'brands' })).totalDocs,
    media: (await payload.count({ collection: 'media' })).totalDocs,
  }
  payload.logger.info(
    `After — products ${after.products}, categories ${after.categories}, ` +
      `brands ${after.brands} (kept), media ${after.media} (removed ${removedMedia} placeholders)`,
  )
  process.exit(0)
}

try {
  await run()
} catch (error) {
  console.error('Wipe failed:', error)
  process.exit(1)
}
