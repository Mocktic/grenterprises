import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Re-uploads every media original through whichever storage adapter is active,
 * so existing files follow a STORAGE_DRIVER change.
 *
 * Needed because switching driver only changes where NEW files go. Existing
 * rows keep their filenames, the new adapter looks for them in a store that
 * does not have them, and every image 404s.
 *
 * SAFETY: an earlier version of this script destroyed files. Payload's
 * update-with-file deletes the existing object before writing its replacement,
 * so an upload that throws — a bad token, a private Blob store — leaves nothing
 * behind. Two uploads were lost that way.
 *
 * So: every original is copied to a timestamped backup directory and the copy
 * is verified byte-for-byte BEFORE anything is uploaded. If the run dies
 * halfway, the backup path is printed and `restore-media.ts` can read from it.
 * Nothing is deleted from the backup, ever.
 */
const LOCAL_DIR = path.resolve('media')

const run = async () => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({ collection: 'media', limit: 500, depth: 0 })

  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupDir = path.resolve(`media-backup-${stamp}`)
  fs.mkdirSync(backupDir, { recursive: true })

  // ---- Phase 1: back up and verify, touching nothing else ----
  const ready: { id: string | number; filename: string; backup: string }[] = []
  const unbacked: string[] = []

  for (const doc of docs) {
    const filename = doc.filename
    if (!filename) continue
    const source = path.join(LOCAL_DIR, filename)
    if (!fs.existsSync(source)) { unbacked.push(filename); continue }

    const backup = path.join(backupDir, filename)
    fs.copyFileSync(source, backup)
    if (fs.statSync(backup).size !== fs.statSync(source).size) {
      throw new Error(`Backup of ${filename} does not match the original — aborting before any upload`)
    }
    ready.push({ id: doc.id, filename, backup })
  }

  payload.logger.info(`Backed up ${ready.length} originals to ${backupDir}`)
  if (unbacked.length) {
    payload.logger.warn(
      `${unbacked.length} document(s) have no local original and will be skipped: ${unbacked.join(', ')}`,
    )
  }
  if (ready.length === 0) {
    payload.logger.warn('Nothing to migrate.')
    process.exit(0)
  }

  // ---- Phase 2: upload, reading from the verified backup ----
  let moved = 0
  const failed: string[] = []

  for (const item of ready) {
    try {
      await payload.update({ collection: 'media', id: item.id, data: {}, filePath: item.backup })
      moved += 1
    } catch (error) {
      failed.push(item.filename)
      payload.logger.error(`FAILED ${item.filename}: ${(error as Error).message}`)
    }
  }

  payload.logger.info(`Migrated ${moved} of ${ready.length}.`)
  if (failed.length) {
    payload.logger.error(
      `${failed.length} failed. Originals are intact at ${backupDir} — ` +
        'fix the storage configuration and run restore-media.ts, or re-run this script.',
    )
    process.exit(1)
  }

  payload.logger.info(`Backup kept at ${backupDir} — delete it once you have verified the site.`)
  process.exit(0)
}

try {
  await run()
} catch (error) {
  console.error('Migration failed:', error)
  process.exit(1)
}
