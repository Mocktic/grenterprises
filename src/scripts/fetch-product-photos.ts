import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Real product photographs, sourced from Wikimedia Commons.
 *
 * Commons is used rather than a general image search because it publishes a
 * machine-readable licence for every file. That means each photograph can be
 * checked before it is used and its attribution stored alongside it, instead of
 * quietly putting someone's copyrighted marketing shot on a commercial site.
 *
 * These are placeholders: they show the right kind of equipment, not the exact
 * part number. Replace them with photographs of actual stock.
 */

/** Licences that permit commercial use. Attribution is recorded for all of them. */
const ALLOWED = [
  /^cc0/i,
  /public domain/i,
  /^cc by(?!-nc)/i,
  /^cc-by(?!-nc)/i,
]

/**
 * Titles to refuse outright.
 *
 * Learned the hard way: the first pass returned a documented *counterfeit*
 * Samsung battery for the battery category and a German ECG printout for the
 * cables category. A counterfeit product on a medical supplier's page is a
 * reputational problem, and a chart is not a photograph of stock.
 */
const REJECT_TITLE = [
  /counterfeit|fake|replica|knock.?off/i,
  /diagram|chart|graph|plot|trace|printout|scheme|schematic/i,
  /\blogo\b|\bicon\b|screenshot/i,
  // Commons' medical holdings lean heavily on military and clinical-scene
  // photography, neither of which belongs in a parts catalogue.
  /navy|army|soldier|military|marine|airman|medevac|combat|troop/i,
  /illustration|artwork|drawing|painting|engraving|poster|diagramm/i,
  /patient|nurse|doctor|surgeon|hospital ward|operating theatre/i,
  /\bekg\b.*normal|normal.*\bekg\b/i,
  /animation|\bgif\b/i,
]

/** Ranked best-first: no-attribution licences win ties. */
const rank = (licence: string) => {
  if (/^cc0|public domain/i.test(licence)) return 0
  if (/^cc.?by.?sa/i.test(licence)) return 2
  return 1
}

/** The subset of the Commons API response this script relies on. */
type CommonsImageInfo = {
  thumburl?: string
  url?: string
  thumbwidth?: number
  width?: number
  thumbheight?: number
  height?: number
  extmetadata?: Record<string, { value?: string }>
}

type CommonsPage = { title: string; imageinfo?: CommonsImageInfo[] }
type CommonsResponse = { query?: { pages?: Record<string, CommonsPage> } }

type Candidate = {
  title: string
  url: string
  licence: string
  artist: string
  width: number
  height: number
}

const strip = (html: string) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()

const search = async (query: string): Promise<Candidate[]> => {
  const api =
    'https://commons.wikimedia.org/w/api.php?action=query&generator=search' +
    `&gsrsearch=${encodeURIComponent('filetype:bitmap ' + query)}` +
    '&gsrlimit=12&gsrnamespace=6&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=1400&format=json'

  const res = await fetch(api, { headers: { 'User-Agent': 'GREnterprises-site/1.0 (catalogue placeholder images)' } })
  if (!res.ok) return []
  const json = (await res.json()) as CommonsResponse
  const pages = json?.query?.pages
  if (!pages) return []

  return Object.values(pages)
    .map((p) => {
      const ii = p.imageinfo?.[0]
      if (!ii) return null
      const meta = ii.extmetadata ?? {}
      return {
        title: p.title as string,
        url: (ii.thumburl ?? ii.url) as string,
        licence: strip(meta.LicenseShortName?.value ?? ''),
        artist: strip(meta.Artist?.value ?? 'Unknown'),
        width: ii.thumbwidth ?? ii.width ?? 0,
        height: ii.thumbheight ?? ii.height ?? 0,
      } as Candidate
    })
    .filter((c): c is Candidate => !!c)
    .filter((c) => ALLOWED.some((re) => re.test(c.licence)))
    .filter((c) => c.width >= 640 && !/\.svg$/i.test(c.title))
    .filter((c) => !REJECT_TITLE.some((re) => re.test(c.title)))
    .sort((a, b) => rank(a.licence) - rank(b.licence) || b.width - a.width)
}

/** Queries per category, best first; each falls back to the next. */
/** Restrict a run to named categories: CATEGORIES="Patient Plates,Electrosurgery" */
const ONLY = (process.env.CATEGORIES ?? '')
  .split(',')
  .map((v) => v.trim())
  .filter(Boolean)

const QUERIES: Record<string, string[]> = {
  'SpO2 Sensors & Probes': ['pulse oximeter device', 'fingertip pulse oximeter', 'pulse oximeter'],
  'ECG Cables & Leads': ['ecg electrode disposable', 'electrocardiography electrode', 'ecg cable connector'],
  'Patient Plates': ['electrosurgical dispersive electrode', 'grounding pad electrosurgery', 'electrosurgical generator device'],
  'Fetal Monitoring': ['fetal doppler device', 'cardiotocograph machine', 'obstetric ultrasound probe'],
  'Respiratory & Airway': ['laryngeal mask airway', 'oropharyngeal airway device', 'bag valve mask'],
  'Oxygen Sensors': ['mechanical ventilator device', 'anaesthesia machine device', 'oxygen concentrator'],
  Electrosurgery: ['bovie electrosurgical unit', 'electrosurgical generator device', 'electrocautery machine'],
  Laryngoscopes: ['laryngoscope', 'macintosh laryngoscope blade'],
  'Compatible Batteries': ['battery pack rechargeable', 'lithium polymer battery', 'nickel metal hydride battery pack'],
  'Patient Monitors': ['vital signs monitor device', 'philips intellivue', 'bedside monitor device'],
}

const run = async () => {
  const outDir = '/tmp/gr-photos'
  fs.mkdirSync(outDir, { recursive: true })
  const payload = await getPayload({ config })

  const { docs: categories } = await payload.find({ collection: 'categories', limit: 100, depth: 0 })
  let updated = 0
  const report: string[] = []

  for (const category of categories) {
    if (ONLY.length && !ONLY.includes(category.name)) continue
    const queries = QUERIES[category.name]
    if (!queries) continue

    let picked: Candidate | undefined
    for (const q of queries) {
      const results = await search(q)
      if (results.length) { picked = results[0]; break }
    }

    if (!picked) {
      payload.logger.warn(`${category.name}: no suitably licensed photo found, illustration kept`)
      continue
    }

    const ext = path.extname(new URL(picked.url).pathname) || '.jpg'
    const filename = `photo-${category.slug}${ext}`
    const file = path.join(outDir, filename)

    const img = await fetch(picked.url, {
      headers: { 'User-Agent': 'GREnterprises-site/1.0 (catalogue placeholder images)' },
    })
    if (!img.ok) { payload.logger.warn(`${category.name}: download failed`); continue }
    fs.writeFileSync(file, Buffer.from(await img.arrayBuffer()))

    const credit = `${picked.artist} — ${picked.licence}, via Wikimedia Commons`

    const existing = await payload.find({
      collection: 'media',
      where: { filename: { equals: filename } },
      limit: 1,
    })
    const previousId = existing.docs[0]?.id
    let reuse: (number | string)[] = []
    if (previousId) {
      const { docs } = await payload.find({
        collection: 'products',
        where: { images: { in: [previousId] } },
        limit: 500,
        depth: 0,
      })
      reuse = docs.map((d) => d.id)
      await payload.delete({ collection: 'media', id: previousId })
    }

    const media = await payload.create({
      collection: 'media',
      data: { alt: `${category.name} — representative equipment photograph`, credit },
      filePath: file,
    })

    await payload.update({ collection: 'categories', id: category.id, data: { image: media.id } })

    // Replace the illustrations we generated; never touch a real upload.
    const { docs: products } = await payload.find({
      collection: 'products',
      where: { category: { equals: category.id } },
      limit: 500,
      depth: 1,
    })

    for (const product of products) {
      const current = Array.isArray(product.images) ? product.images : []
      const onlyOurs = current.every((m) =>
        typeof m === 'object' && m
          ? String((m as { filename?: string }).filename ?? '').startsWith('product-') ||
            String((m as { filename?: string }).filename ?? '').startsWith('photo-')
          : false,
      )
      if (current.length > 0 && !onlyOurs && !reuse.includes(product.id)) continue
      await payload.update({ collection: 'products', id: product.id, data: { images: [media.id] } })
      updated += 1
    }

    report.push(`${category.name}\n    ${picked.title}\n    ${credit}`)
    payload.logger.info(`${category.name}: ${picked.licence} — ${products.length} products`)
  }

  payload.logger.info(`\n=== Attribution record ===\n${report.join('\n')}\n`)
  payload.logger.info(`Photographs applied to ${updated} products.`)
  process.exit(0)
}

try {
  await run()
} catch (error) {
  console.error('Photo fetch failed:', error)
  process.exit(1)
}
