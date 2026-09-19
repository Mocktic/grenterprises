import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/site/breadcrumbs'
import { QuoteDialog } from '@/components/site/quote-dialog'
import { getSiteSettings } from '@/lib/site'
import { JsonLd } from '@/components/ui/json-ld'
import { localBusinessJsonLd } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'About us',
  description:
    'GR Enterprises has supplied medical equipment and accessories to hospitals across India since 1994. Registered government contractor, based in Mohali.',
  alternates: { canonical: '/about' },
}

export default async function AboutPage() {
  const settings = await getSiteSettings()
  const years = new Date().getFullYear() - (settings.establishedYear ?? 1994)

  return (
    <div className="px-4 py-6 lg:px-10 lg:py-8">
      <JsonLd data={localBusinessJsonLd(settings)} />
      <Breadcrumbs trail={[{ name: 'Home', href: '/' }, { name: 'About us', href: '/about' }]} />

      <article className="mt-4 max-w-2xl">
        <h1 className="text-h1">About GR Enterprises</h1>

        <p className="mt-5 text-lg text-ink-muted">
          For {years} years we have supplied medical equipment, accessories and consumables to
          hospitals, nursing homes and biomedical departments across India.
        </p>

        <div className="mt-8 space-y-5 text-ink-muted">
          <p>
            We began in {settings.establishedYear} and work today from {settings.address}. Much of
            what we do is unglamorous and important: finding the sensor, cable, patient plate or
            battery that keeps a working machine in service, often for equipment the original
            manufacturer no longer supports.
          </p>
          <p>
            We are a registered government contractor and supply against hospital tenders, with
            GSTIN and MSME documentation provided alongside every quote. Purchase departments
            dealing with us for the first time can ask for references.
          </p>
          <p>
            We hold stock for the lines we sell most, and source the rest. If a part is not listed
            on this site, it is worth asking — the catalogue here is smaller than what we can
            supply.
          </p>
        </div>

        <dl className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Established', value: settings.establishedYear },
            { label: 'GSTIN', value: settings.gstin, mono: true },
            { label: 'MSME', value: settings.msmeNumber, mono: true },
          ].map((item) => (
            <div key={item.label} className="rounded-card border border-line bg-surface-muted p-4">
              <dt className="eyebrow">{item.label}</dt>
              <dd className={`mt-1 text-ink ${item.mono ? 'font-mono text-sm' : 'text-lg font-medium'}`}>
                {item.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-10 border-t border-line pt-8">
          <h2 className="text-h2">Ask us about a part</h2>
          <p className="mt-2 text-ink-muted">
            Send the make and model of your equipment and we will tell you what fits.
          </p>
          <QuoteDialog label="Request a quote" size="lg" className="mt-5" />
        </div>
      </article>
    </div>
  )
}
