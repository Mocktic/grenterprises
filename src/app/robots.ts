import type { MetadataRoute } from 'next'

const base = () => process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/search', '/thank-you'] }],
    sitemap: `${base()}/sitemap.xml`,
  }
}
