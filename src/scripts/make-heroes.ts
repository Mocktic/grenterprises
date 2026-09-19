import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Original hero artwork.
 *
 * The catalogue PDF turned out to embed third-party manufacturer marketing
 * images (Covidien/TY-CARE branding among them), which are not GR Enterprises'
 * to republish, and licence-unclear stock photography is no better on a
 * commercial site. These are drawn from scratch in the site's own palette, so
 * they can ship today with no rights question attached.
 *
 * They are a stand-in, not the destination: a photograph of the actual Mohali
 * showroom will outperform any of them.
 */

const BLUE = '#2d5bb9'
const DEEP = '#1e3a6e'
const LIGHT = '#5b9bd5'

const frame = (inner: string, bg = '#eef3fc') => `
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">
  <defs>
    <linearGradient id="wash" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="1000" fill="url(#wash)"/>
  ${inner}
</svg>`

/** 1. Connector array — the shape of the business: things that plug into things. */
const connectors = () => {
  let out = ''
  const rows = 3
  const cols = 4
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = 220 + c * 300
      const y = 250 + r * 240
      const o = 0.25 + ((r + c) % 3) * 0.2
      out += `
      <g opacity="${o}" stroke="${DEEP}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <rect x="${x - 60}" y="${y - 34}" width="120" height="68" rx="14"/>
        <path d="M${x + 60} ${y} h56"/>
        <circle cx="${x - 26}" cy="${y}" r="9" fill="${BLUE}" stroke="none"/>
        <circle cx="${x + 2}" cy="${y}" r="9" fill="${LIGHT}" stroke="none"/>
        <circle cx="${x + 30}" cy="${y}" r="9" fill="${BLUE}" stroke="none"/>
      </g>`
    }
  }
  return frame(out)
}

/** 2. Waveform — an ECG trace, the most recognisable object in this trade. */
const waveform = () => {
  const baseline = 520
  let d = `M0 ${baseline}`
  for (let i = 0; i < 5; i++) {
    const x = i * 320
    d += ` H${x + 120} l18 -34 l16 150 l20 -286 l20 236 l16 -66 H${x + 300}`
  }
  return frame(`
    <g opacity="0.08" stroke="${DEEP}" stroke-width="2">
      ${Array.from({ length: 21 }, (_, i) => `<line x1="${i * 80}" y1="0" x2="${i * 80}" y2="1000"/>`).join('')}
      ${Array.from({ length: 13 }, (_, i) => `<line x1="0" y1="${i * 80}" x2="1600" y2="${i * 80}"/>`).join('')}
    </g>
    <path d="${d}" fill="none" stroke="${BLUE}" stroke-width="9" stroke-linejoin="round" stroke-linecap="round" opacity="0.9"/>
    <path d="${d}" fill="none" stroke="${LIGHT}" stroke-width="22" stroke-linejoin="round" stroke-linecap="round" opacity="0.18"/>
  `)
}

/** 3. Catalogue grid — many parts, ordered, which is what they actually sell. */
const catalogue = () => {
  let out = ''
  const shapes = 24
  for (let i = 0; i < shapes; i++) {
    const col = i % 6
    const row = Math.floor(i / 6)
    const x = 180 + col * 250
    const y = 240 + row * 190
    const kind = i % 4
    const o = 0.18 + ((i * 7) % 5) * 0.12
    if (kind === 0) {
      out += `<circle cx="${x}" cy="${y}" r="48" fill="none" stroke="${DEEP}" stroke-width="7" opacity="${o}"/>
              <circle cx="${x}" cy="${y}" r="18" fill="${BLUE}" opacity="${o}"/>`
    } else if (kind === 1) {
      out += `<rect x="${x - 52}" y="${y - 30}" width="104" height="60" rx="12" fill="none" stroke="${DEEP}" stroke-width="7" opacity="${o}"/>`
    } else if (kind === 2) {
      out += `<path d="M${x - 50} ${y + 24} q50 -80 100 0" fill="none" stroke="${BLUE}" stroke-width="8" stroke-linecap="round" opacity="${o}"/>`
    } else {
      out += `<path d="M${x} ${y - 46} l42 24 v46 l-42 24 l-42 -24 v-46 z" fill="none" stroke="${LIGHT}" stroke-width="8" stroke-linejoin="round" opacity="${o}"/>`
    }
  }
  return frame(out, '#f6f8fb')
}

const variants = [
  { name: 'hero-connectors.png', svg: connectors(), alt: 'Illustration of medical equipment connectors and cables' },
  { name: 'hero-waveform.png', svg: waveform(), alt: 'Illustration of an ECG waveform across a measurement grid' },
  { name: 'hero-catalogue.png', svg: catalogue(), alt: 'Illustration of an ordered grid of medical equipment parts' },
]

const run = async () => {
  const outDir = path.resolve('/tmp/gr-heroes')
  fs.mkdirSync(outDir, { recursive: true })

  const payload = await getPayload({ config })

  for (const variant of variants) {
    const file = path.join(outDir, variant.name)
    await sharp(Buffer.from(variant.svg)).png().toFile(file)

    const existing = await payload.find({
      collection: 'media',
      where: { filename: { equals: variant.name } },
      limit: 1,
    })
    if (existing.docs[0]) {
      payload.logger.info(`${variant.name} already in media, skipping`)
      continue
    }

    await payload.create({
      collection: 'media',
      data: { alt: variant.alt },
      filePath: file,
    })
    payload.logger.info(`uploaded ${variant.name}`)
  }

  payload.logger.info('Hero artwork ready — pick one in Shop details → Home page.')
  process.exit(0)
}

try {
  await run()
} catch (error) {
  console.error('Hero generation failed:', error)
  process.exit(1)
}
