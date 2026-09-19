import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
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
 * Product images live in Cloudflare R2 in production — chosen over Vercel Blob
 * because R2 charges nothing for egress, and image bandwidth is the cost that
 * grows as the catalogue succeeds. With the R2 vars unset, uploads fall back to
 * local disk so the site runs with no cloud credentials.
 */
const r2Configured = Boolean(
  process.env.R2_BUCKET &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_ENDPOINT,
)

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
    ...(r2Configured
    ? [
        s3Storage({
          collections: { media: true },
          bucket: process.env.R2_BUCKET as string,
          config: {
            endpoint: process.env.R2_ENDPOINT,
            region: 'auto',
            credentials: {
              accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
              secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
            },
          },
        }),
        ]
      : []),
  ],
})
