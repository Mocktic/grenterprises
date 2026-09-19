import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Re-uploads media originals from local backups.
 *
 * Written after a failed storage migration removed the files: Payload's
 * update-with-file deletes the existing object before writing the replacement,
 * so an upload that throws leaves nothing behind. Anything irreplaceable must
 * be copied out before that kind of operation, not after.
 *
 * Sources are searched newest-first. Documents with no backup are reported
 * rather than skipped silently, because a missing report is how data loss goes
 * unnoticed.
 */
const SOURCES = ['/tmp', '/tmp/gr-photos', '/tmp/gr-heroes', '/tmp/gr-product-art']

const findSource = (filename: string): string | null => {
  const candidates = [filename]

  // Payload appends -1 when a filename collides; the backup lacks that suffix.
  const ext = path.extname(filename)
  const base = path.basename(filename, ext)
  if (/-\d+$/.test(base)) candidates.push(base.replace(/-\d+$/, '') + ext)

  // Backups may differ only in extension case.
  for (const c of [...candidates]) {
    candidates.push(c.replace(/\.jpe?g$/i, '.jpg'), c.replace(/\.jpe?g$/i, '.JPG'))
  }

  for (const dir of SOURCES) {
    for (const c of candidates) {
      const p = path.join(dir, c)
      if (fs.existsSync(p) && fs.statSync(p).isFile()) return p
    }
  }
  return null
}

const run = async () => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({ collection: 'media', limit: 500, depth: 0 })

  const restored: string[] = []
  const lost: string[] = []

  for (const doc of docs) {
    const filename = doc.filename
    if (!filename) continue

    const source = findSource(filename)
    if (!source) {
      lost.push(filename)
      continue
    }

    try {
      await payload.update({ collection: 'media', id: doc.id, data: {}, filePath: source })
      restored.push(filename)
    } catch (error) {
      payload.logger.error(`FAILED ${filename}: ${(error as Error).message}`)
      lost.push(filename)
    }
  }

  payload.logger.info(`Restored ${restored.length} of ${docs.length}`)
  if (lost.length) payload.logger.warn(`No backup for: ${lost.join(', ')}`)
  process.exit(0)
}

try {
  await run()
} catch (error) {
  console.error('Restore failed:', error)
  process.exit(1)
}
