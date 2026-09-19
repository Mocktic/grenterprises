import type { Metadata } from 'next'
import { IBM_Plex_Mono, IBM_Plex_Sans, IBM_Plex_Serif } from 'next/font/google'
import { Header } from '@/components/site/header'
import { TrustStrip } from '@/components/site/trust-strip'
import { CategorySidebar } from '@/components/site/category-sidebar'
import { Footer } from '@/components/site/footer'
import { getSiteSettings } from '@/lib/site'
import { getCategoryTree } from '@/lib/catalogue'
import '../globals.css'

/**
 * One superfamily, two voices. IBM Plex was drawn for technical documentation,
 * which is exactly the register of a parts catalogue — and the mono harmonises
 * with the sans instead of fighting it.
 */
const sans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plex-sans',
  display: 'swap',
})

const serif = IBM_Plex_Serif({
  subsets: ['latin'],
  weight: ['600'],
  variable: '--font-plex-serif',
  display: 'swap',
})

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'),
  title: {
    default: 'GR Enterprises — Medical equipment & accessories, Mohali',
    template: '%s · GR Enterprises',
  },
  description:
    'Supplier of medical equipment, sensors, cables and compatible accessories to hospitals across India since 1994. Based in Mohali, serving Chandigarh, Mohali and Panchkula.',
  openGraph: {
    type: 'website',
    siteName: 'GR Enterprises',
    locale: 'en_IN',
  },
  robots: { index: true, follow: true },
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([getSiteSettings(), getCategoryTree()])

  return (
    <html lang="en-IN" className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
      <body className="min-h-screen antialiased">
        <a href="#main" className="skip-link">
          Skip to content
        </a>

        <Header />
        <TrustStrip settings={settings} />

        <div className="mx-auto flex w-full max-w-[90rem]">
          <CategorySidebar categories={categories} />
          <main id="main" className="min-w-0 flex-1">
            {children}
          </main>
        </div>

        <Footer />
      </body>
    </html>
  )
}
