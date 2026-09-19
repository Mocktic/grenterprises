import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { importExportPlugin } from '@payloadcms/plugin-import-export'
import sharp from 'sharp'

import { Users } from '@/collections/Users'
import { Media } from '@/collections/Media'
import { Categories } from '@/collections/Categories'
import { Brands } from '@/collections/Brands'
import { Products } from '@/collections/Products'
import { Leads } from '@/collections/Leads'
import { SiteSettings } from '@/globals/SiteSettings'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Where uploads are stored.
 *
 * Both adapters are wired up so the choice is an environment variable rather
 * than a code change. Vercel Blob is the quickest thing to turn on; Cloudflare
 * R2 is where this should end up, because R2 charges nothing for egress and
 * image bandwidth is the cost that grows as the catalogue succeeds.
 *
 * Set STORAGE_DRIVER explicitly, or leave it unset and the first configured
 * adapter wins. With neither configured, uploads go to local disk so the site
 * runs with no cloud credentials at all.
 *
 * Switching drivers does NOT move existing files. Anything already uploaded
 * stays in the old store and has to be re-uploaded, so switch before the
 * catalogue is populated, not after.
 */
const r2Configured = Boolean(
  process.env.R2_BUCKET &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_ENDPOINT,
)

const blobConfigured = Boolean(process.env.BLOB_READ_WRITE_TOKEN)

const resolveDriver = (): 'vercel-blob' | 'r2' | 'local' => {
  const requested = process.env.STORAGE_DRIVER?.trim()

  if (requested === 'vercel-blob') {
    if (blobConfigured) return 'vercel-blob'
    console.warn('[storage] STORAGE_DRIVER=vercel-blob but BLOB_READ_WRITE_TOKEN is unset — using local disk')
    return 'local'
  }
  if (requested === 'r2') {
    if (r2Configured) return 'r2'
    console.warn('[storage] STORAGE_DRIVER=r2 but the R2_* vars are incomplete — using local disk')
    return 'local'
  }
  if (requested === 'local') return 'local'
  if (requested) console.warn(`[storage] unknown STORAGE_DRIVER "${requested}" — falling back to auto-detect`)

  if (blobConfigured) return 'vercel-blob'
  if (r2Configured) return 'r2'
  return 'local'
}

const storageDriver = resolveDriver()

/**
 * Exactly one storage plugin is always registered, with `enabled` deciding
 * whether it actually stores remotely and `alwaysInsertFields` keeping its
 * columns in the schema either way.
 *
 * Registering none when running locally looked tidier but was wrong: dropping
 * the plugin drops the `_objectkey` column it owns, so every switch between
 * local and cloud became a destructive migration that Drizzle stops to ask
 * about. Keeping the fields pinned makes STORAGE_DRIVER a runtime setting
 * rather than a schema change.
 */
const storagePlugin =
  storageDriver === 'r2'
    ? s3Storage({
        enabled: true,
        alwaysInsertFields: true,
        /**
         * Serve straight from the storage CDN rather than proxying every image
         * through Payload. These are public product photos on a catalogue that
         * wants to be indexed — routing them through a function would add a hop,
         * bill a function invocation per image, and give Google a slower URL for
         * no access-control benefit.
         */
        collections: { media: { disablePayloadAccessControl: true } },
        bucket: process.env.R2_BUCKET as string,
        config: {
          endpoint: process.env.R2_ENDPOINT,
          region: 'auto',
          credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
          },
        },
      })
    : vercelBlobStorage({
        enabled: storageDriver === 'vercel-blob',
        alwaysInsertFields: true,
        /**
         * Serve straight from the storage CDN rather than proxying every image
         * through Payload. These are public product photos on a catalogue that
         * wants to be indexed — routing them through a function would add a hop,
         * bill a function invocation per image, and give Google a slower URL for
         * no access-control benefit.
         */
        collections: { media: { disablePayloadAccessControl: true } },
        token: process.env.BLOB_READ_WRITE_TOKEN,
      })

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: ' · GR Enterprises',
    },
    components: {
      // Payload's sidebar lists collections but has no route home.
      beforeNavLinks: ['@/components/admin/NavDashboardLink#NavDashboardLink'],
      beforeDashboard: ['@/components/admin/DashboardStats#DashboardStats'],
    },
  },
  collections: [Products, Categories, Brands, Media, Leads, Users],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI || '' },
  }),
  sharp,
  plugins: [
    /**
     * CSV and JSON export on every catalogue collection, plus import.
     * CSV opens directly in Excel, which is what was actually asked for, and
     * import is the only sane way to get the remaining hundreds of catalogue
     * lines in without typing them one at a time.
     */
    importExportPlugin({
      collections: [
        { slug: 'products' },
        { slug: 'categories' },
        { slug: 'brands' },
        { slug: 'leads' },
        { slug: 'media' },
      ],
      overrideExportCollection: ({ collection }) => ({
        ...collection,
        admin: { ...collection.admin, group: 'Settings' },
      }),
      overrideImportCollection: ({ collection }) => ({
        ...collection,
        admin: { ...collection.admin, group: 'Settings' },
      }),
    }),
    storagePlugin,
  ],
})
