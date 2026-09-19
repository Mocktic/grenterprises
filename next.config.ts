import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const remotePatterns: NonNullable<NextConfig['images']>['remotePatterns'] = [
  // Vercel Blob. next/image refuses any host not listed here, so without this
  // every migrated product image returns 400 rather than rendering.
  { protocol: 'https', hostname: '**.public.blob.vercel-storage.com' },
]

// Cloudflare R2 public bucket, when that is the configured driver
if (process.env.R2_PUBLIC_URL) {
  remotePatterns.push({
    protocol: 'https',
    hostname: new URL(process.env.R2_PUBLIC_URL).hostname,
  })
}

const nextConfig: NextConfig = {
  images: { remotePatterns },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
