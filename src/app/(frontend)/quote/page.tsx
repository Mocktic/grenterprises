import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/site/breadcrumbs'
import { QuotePageForm } from '@/components/site/quote-page-form'
import { getSiteSettings, telLink, whatsappLink } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Request a quote',
  description:
    'Send GR Enterprises your part number or equipment model and we will come back with a price, usually within one working day.',
  alternates: { canonical: '/quote' },
}

export default async function QuotePage() {
  const settings = await getSiteSettings()

  return (
    <div className="px-4 py-6 lg:px-10 lg:py-8">
      <Breadcrumbs trail={[{ name: 'Home', href: '/' }, { name: 'Request a quote', href: '/quote' }]} />

      <div className="mt-4 grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div>
          <h1 className="text-h1">Request a quote</h1>
          <p className="mt-3 max-w-xl text-ink-muted">
            Give us a part number, or the make and model of your equipment. We will confirm what
            fits and send a price.
          </p>

          <div className="mt-8 max-w-2xl">
            <QuotePageForm />
          </div>
        </div>

        <aside className="lg:pt-16">
          <div className="rounded-card border border-line bg-surface-muted p-6">
            <h2 className="text-sm font-semibold text-ink">Would rather talk?</h2>
            <p className="mt-2 text-sm text-ink-muted">
              Call during working hours and we will look it up while you are on the line.
            </p>
            <a
              href={telLink(settings.phone)}
              className="mt-4 block font-mono text-lg text-primary hover:underline"
            >
              {settings.phone}
            </a>
            <p className="mt-1 text-xs text-ink-faint">{settings.openingHours}</p>

            {settings.whatsappNumber && (
              <a
                href={whatsappLink(settings.whatsappNumber, 'Hello GR Enterprises,')}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex h-11 items-center rounded-control bg-[#25D366] px-4 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Message on WhatsApp
              </a>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
