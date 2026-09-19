import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Placeholder product artwork, one illustration per category.
 *
 * Deliberately drawn rather than downloaded. The only images on the web that
 * actually depict a Nellcor DS100A or an Erbe pencil are the manufacturers'
 * own marketing photographs, which are their copyright — the same reason the
 * supplied catalogue PDF was not mined for artwork. Generic stock photography
 * avoids the copyright problem but creates a worse one: a purchase officer who
 * orders a patient plate from a picture of a different product has been
 * misled, and in this trade that is a returned order at best.
 *
 * These read as diagrams, not photographs, so nobody mistakes them for the
 * article. They are scaffolding until real photographs exist.
 */

const INK = '#1e3a6e'
const BLUE = '#2d5bb9'
const SOFT = '#5b9bd5'

const panel = (art: string) => `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
  <rect width="1200" height="1200" fill="#f6f8fb"/>
  <g opacity="0.06" stroke="${INK}" stroke-width="2">
    ${Array.from({ length: 15 }, (_, i) => `<line x1="${i * 80}" y1="0" x2="${i * 80}" y2="1200"/>`).join('')}
    ${Array.from({ length: 15 }, (_, i) => `<line x1="0" y1="${i * 80}" x2="1200" y2="${i * 80}"/>`).join('')}
  </g>
  <g fill="none" stroke="${INK}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"
     transform="translate(600 600)">
    ${art}
  </g>
</svg>`

const art: Record<string, string> = {
  'SpO2 Sensors & Probes': `
    <path d="M-250 -70 q0 -90 90 -90 h170 q90 0 90 90 v40 h-350 z"/>
    <path d="M-250 70 q0 90 90 90 h170 q90 0 90 -90 v-40 h-350 z"/>
    <circle cx="-80" cy="-40" r="26" fill="${BLUE}" stroke="none"/>
    <circle cx="-80" cy="40" r="26" fill="${SOFT}" stroke="none"/>
    <path d="M100 0 h130 q60 0 60 60 v150"/>`,
  'ECG Cables & Leads': `
    <rect x="-300" y="-90" width="170" height="180" rx="28"/>
    <circle cx="-215" cy="-30" r="18" fill="${BLUE}" stroke="none"/>
    <circle cx="-215" cy="30" r="18" fill="${SOFT}" stroke="none"/>
    <path d="M-130 -50 q180 -40 310 -150"/>
    <path d="M-130 0 h310"/>
    <path d="M-130 50 q180 40 310 150"/>
    <circle cx="200" cy="-200" r="30" fill="${SOFT}" stroke="none"/>
    <circle cx="200" cy="0" r="30" fill="${BLUE}" stroke="none"/>
    <circle cx="200" cy="200" r="30" fill="${SOFT}" stroke="none"/>`,
  'Patient Plates': `
    <rect x="-300" y="-190" width="600" height="380" rx="70"/>
    <path d="M0 -190 v380" stroke-dasharray="26 26"/>
    <rect x="-230" y="-120" width="180" height="240" rx="40" fill="${SOFT}" stroke="none" opacity="0.45"/>
    <rect x="50" y="-120" width="180" height="240" rx="40" fill="${BLUE}" stroke="none" opacity="0.3"/>
    <path d="M300 60 h110 q50 0 50 50 v120"/>`,
  'Fetal Monitoring': `
    <circle cx="0" cy="0" r="200"/>
    <circle cx="0" cy="0" r="120" stroke="${BLUE}"/>
    <circle cx="0" cy="0" r="50" fill="${SOFT}" stroke="none"/>
    <path d="M-200 -30 h-220 q-60 0 -60 60 v40"/>
    <path d="M200 -30 h220 q60 0 60 60 v40"/>`,
  'Respiratory & Airway': `
    <path d="M-260 180 q-60 -260 120 -330 q150 -58 260 44"/>
    <ellipse cx="160" cy="-60" rx="110" ry="80" transform="rotate(28 160 -60)"/>
    <ellipse cx="160" cy="-60" rx="56" ry="38" transform="rotate(28 160 -60)" stroke="${SOFT}"/>
    <path d="M-260 180 h-70" stroke="${BLUE}"/>`,
  'Oxygen Sensors': `
    <rect x="-170" y="-210" width="340" height="420" rx="46"/>
    <path d="M-170 -110 h340" stroke="${SOFT}"/>
    <circle cx="-70" cy="60" r="34" fill="${BLUE}" stroke="none"/>
    <circle cx="70" cy="60" r="34" fill="${SOFT}" stroke="none"/>
    <path d="M-80 -210 v-70"/>
    <path d="M80 -210 v-70"/>`,
  Electrosurgery: `
    <rect x="-300" y="-55" width="420" height="110" rx="46"/>
    <path d="M120 -48 l170 48 l-170 48 z" fill="${BLUE}" stroke="${INK}"/>
    <rect x="-210" y="-34" width="120" height="68" rx="28" fill="${SOFT}" stroke="none"/>
    <rect x="-50" y="-34" width="120" height="68" rx="28" fill="${BLUE}" stroke="none" opacity="0.5"/>
    <path d="M-300 0 h-70 q-60 0 -60 60 v150"/>`,
  Laryngoscopes: `
    <rect x="-90" y="-60" width="180" height="330" rx="52"/>
    <path d="M-90 -60 h-40 q-50 0 -50 -50 v-30"/>
    <path d="M90 -60 q170 -40 190 -230 q4 -40 -40 -40 q-40 0 -48 40 q-30 150 -170 160"/>
    <circle cx="150" cy="-160" r="26" fill="${SOFT}" stroke="none"/>
    <path d="M-60 60 h120" stroke="${BLUE}"/>
    <path d="M-60 140 h120" stroke="${BLUE}"/>`,
  'Compatible Batteries': `
    <rect x="-290" y="-180" width="580" height="360" rx="54"/>
    <rect x="-290" y="-60" width="580" height="4" stroke="${SOFT}"/>
    <rect x="-210" y="20" width="110" height="110" rx="18" fill="${BLUE}" stroke="none"/>
    <rect x="-50" y="20" width="110" height="110" rx="18" fill="${SOFT}" stroke="none"/>
    <rect x="110" y="20" width="110" height="110" rx="18" fill="${SOFT}" stroke="none" opacity="0.4"/>
    <path d="M-160 -180 v-60 h120 v60"/>
    <path d="M60 -180 v-60 h120 v60"/>`,
  'Patient Monitors': `
    <rect x="-340" y="-250" width="680" height="440" rx="42"/>
    <path d="M-260 -30 h90 l30 -80 l40 170 l44 -220 l38 190 l26 -60 h230" stroke="${BLUE}" stroke-width="14"/>
    <path d="M-120 230 h240" stroke-width="22"/>
    <circle cx="240" cy="-180" r="22" fill="${SOFT}" stroke="none"/>`,
}

const slug = (name: string) =>
  'product-' + name.toLowerCase().replace(/&/g, 'and').replace(/[^\w]+/g, '-').replace(/^-|-$/g, '')

const run = async () => {
  const outDir = '/tmp/gr-product-art'
  fs.mkdirSync(outDir, { recursive: true })
  const payload = await getPayload({ config })

  const { docs: categories } = await payload.find({ collection: 'categories', limit: 100, depth: 0 })
  let assigned = 0

  for (const category of categories) {
    const drawing = art[category.name]
    if (!drawing) {
      payload.logger.warn(`No illustration defined for "${category.name}" — skipped`)
      continue
    }

    const filename = `${slug(category.name)}.png`
    const file = path.join(outDir, filename)
    await sharp(Buffer.from(panel(drawing))).png().toFile(file)

    /**
     * Replace our own previous drawing rather than leaving a stale one behind.
     * The products that referenced it are collected first so they can be
     * pointed at the replacement — a product carrying a real photograph is
     * never in that list, so it is left alone.
     */
    const found = await payload.find({
      collection: 'media',
      where: { filename: { equals: filename } },
      limit: 1,
    })

    const previousId = found.docs[0]?.id
    let usedPreviously: (number | string)[] = []

    if (previousId) {
      const { docs: referencing } = await payload.find({
        collection: 'products',
        where: { images: { in: [previousId] } },
        limit: 500,
        depth: 0,
      })
      usedPreviously = referencing.map((d) => d.id)
      await payload.delete({ collection: 'media', id: previousId })
    }

    const media = await payload.create({
      collection: 'media',
      data: { alt: `Illustration representing ${category.name}` },
      filePath: file,
    })

    // Category tile
    await payload.update({
      collection: 'categories',
      id: category.id,
      data: { image: media.id },
    })

    // Every product in it that has no picture of its own
    const { docs: products } = await payload.find({
      collection: 'products',
      where: { category: { equals: category.id } },
      limit: 500,
      depth: 0,
    })

    for (const product of products) {
      const has = Array.isArray(product.images) && product.images.length > 0
      const wasOurs = usedPreviously.includes(product.id)
      if (has && !wasOurs) continue
      await payload.update({
        collection: 'products',
        id: product.id,
        data: { images: [media.id] },
      })
      assigned += 1
    }

    payload.logger.info(`${category.name}: ${products.length} products`)
  }

  payload.logger.info(`Done — artwork on ${categories.length} categories, ${assigned} products.`)
  process.exit(0)
}

try {
  await run()
} catch (error) {
  console.error('Product art failed:', error)
  process.exit(1)
}
