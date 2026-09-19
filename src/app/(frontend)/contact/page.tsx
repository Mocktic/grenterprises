import type { Metadata } from 'next'
import { Mail, MapPin, Phone, Clock } from 'lucide-react'
import { Breadcrumbs } from '@/components/site/breadcrumbs'
import { QuoteDialog } from '@/components/site/quote-dialog'
import { formattedAddress, getSiteSettings, mapEmbedSrc, telLink, whatsappLink } from '@/lib/site'
import { JsonLd } from '@/components/ui/json-ld'
import { localBusinessJsonLd } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Visit or call GR Enterprises — medical equipment supplier in Mohali, serving Chandigarh, Mohali and Panchkula.',
  alternates: { canonical: '/contact' },
}

export default async function ContactPage() {
  const settings = await getSiteSettings()

  const details = [
    { icon: Phone, label: 'Phone', value: settings.phone, href: telLink(settings.phone), mono: true },
    { icon: Mail, label: 'Email', value: settings.email, href: `mailto:${settings.email}` },
    {
      icon: MapPin,
      label: 'Address',
      value: formattedAddress(settings),
    },
    { icon: Clock, label: 'Opening hours', value: settings.openingHours },
  ]

  return (
    <div className="px-4 py-6 lg:px-10 lg:py-8">
      <JsonLd data={localBusinessJsonLd(settings)} />
      <Breadcrumbs trail={[{ name: 'Home', href: '/' }, { name: 'Contact', href: '/contact' }]} />

      <header className="mt-4 mb-8 max-w-2xl">
        <h1 className="text-h1">Contact us</h1>
        <p className="mt-3 text-ink-muted">
          Call for a quote, or come to the showroom in {settings.city}. We supply across India and
          deal directly with hospital purchase departments.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <dl className="space-y-5">
            {details.map(({ icon: Icon, label, value, href, mono }) => (
              <div key={label} className="flex gap-3">
                <Icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                <div>
                  <dt className="eyebrow">{label}</dt>
                  <dd className={`mt-1 text-ink ${mono ? 'font-mono' : ''}`}>
                    {href ? (
                      <a href={href} className="transition-colors hover:text-primary">
                        {value}
                      </a>
                    ) : (
                      value
                    )}
                  </dd>
                </div>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            <QuoteDialog label="Request a quote" size="lg" />
            {settings.whatsappNumber && (
              <a
                href={whatsappLink(settings.whatsappNumber, 'Hello GR Enterprises,')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center rounded-control border border-line-strong px-5 text-sm font-medium text-ink transition-colors hover:border-ink-faint hover:bg-surface-muted"
              >
                Message on WhatsApp
              </a>
            )}
          </div>

          <div className="mt-8 rounded-card border border-line bg-surface-muted p-5">
            <p className="eyebrow">Registration</p>
            <dl className="mt-2 space-y-1 text-sm">
              <div className="flex gap-2">
                <dt className="text-ink-muted">GSTIN</dt>
                <dd className="font-mono text-ink">{settings.gstin}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-ink-muted">MSME</dt>
                <dd className="font-mono text-ink">{settings.msmeNumber}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="overflow-hidden rounded-card border border-line">
          <iframe
            src={mapEmbedSrc(settings)}
            title={`Map showing GR Enterprises in ${settings.city}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="aspect-4/3 w-full lg:aspect-auto lg:h-full lg:min-h-[26rem]"
          />
        </div>
      </div>
    </div>
  )
}
