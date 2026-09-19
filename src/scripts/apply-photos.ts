import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Applies hand-picked candidate photographs.
 *
 * Automated "take the first search hit" produced military scenes, a medical
 * illustration and a warning label, because Commons' medical holdings are not
 * a product catalogue. Candidates are fetched in bulk, reviewed, and the
 * choices recorded here so the run is reproducible.
 *
 * Local placeholders. Real stock photography replaces them before launch.
 */
const PICKS: Record<string, { from: string; index: number }> = {
  'ecg-cables-leads': { from: 'ecg-cables-leads', index: 1 },     // ECG tab electrode
  'oxygen-sensors': { from: 'oxygen-sensors', index: 0 },          // galvanic oxygen cells
  'compatible-batteries': { from: 'compatible-batteries', index: 1 }, // battery pack
  'patient-monitors': { from: 'patient-monitors', index: 3 },      // GE Dash 5000 bedside monitor
  electrosurgery: { from: 'electrosurgery', index: 0 },            // electrosurgical generator
  'patient-plates': { from: 'electrosurgery', index: 3 },          // electrode plates + handpiece
}

const run = async () => {
  const index = JSON.parse(fs.readFileSync('/tmp/gr-candidates/index.json', 'utf8'))
  const payload = await getPayload({ config })
  const { docs: categories } = await payload.find({ collection: 'categories', limit: 100, depth: 0 })

  let applied = 0
  for (const category of categories) {
    const pick = PICKS[category.slug as string]
    if (!pick) continue

    const candidate = index[pick.from]?.find((c: { i: number }) => c.i === pick.index)
    if (!candidate) {
      payload.logger.warn(`${category.name}: candidate ${pick.from}#${pick.index} missing`)
      continue
    }

    const filename = `photo-${category.slug}${path.extname(candidate.file) || '.jpg'}`

    const existing = await payload.find({
      collection: 'media',
      where: { filename: { equals: filename } },
      limit: 1,
    })
    let reuse: (number | string)[] = []
    if (existing.docs[0]) {
      const { docs } = await payload.find({
        collection: 'products',
        where: { images: { in: [existing.docs[0].id] } },
        limit: 500,
        depth: 0,
      })
      reuse = docs.map((d) => d.id)
      await payload.delete({ collection: 'media', id: existing.docs[0].id })
    }

    const staged = `/tmp/${filename}`
    fs.copyFileSync(candidate.file, staged)

    const media = await payload.create({
      collection: 'media',
      data: {
        alt: `${category.name} — representative equipment photograph`,
        credit: `${candidate.title} — ${candidate.licence}, via Wikimedia Commons`,
      },
      filePath: staged,
    })

    await payload.update({ collection: 'categories', id: category.id, data: { image: media.id } })

    const { docs: products } = await payload.find({
      collection: 'products',
      where: { category: { equals: category.id } },
      limit: 500,
      depth: 1,
    })

    for (const product of products) {
      const current = Array.isArray(product.images) ? product.images : []
      const placeholderOnly = current.every((m) =>
        typeof m === 'object' && m
          ? /^(product|photo)-/.test(String((m as { filename?: string }).filename ?? ''))
          : false,
      )
      if (current.length > 0 && !placeholderOnly && !reuse.includes(product.id)) continue
      await payload.update({ collection: 'products', id: product.id, data: { images: [media.id] } })
      applied += 1
    }

    payload.logger.info(`${category.name}: ${candidate.title.replace('File:', '')}`)
  }

  payload.logger.info(`Applied to ${applied} products.`)
  process.exit(0)
}

try {
  await run()
} catch (error) {
  console.error('Apply failed:', error)
  process.exit(1)
}
