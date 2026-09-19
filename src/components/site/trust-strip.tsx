import type { SiteDetails } from '@/lib/site'

const Separator = () => (
  <span aria-hidden className="text-white/40">
    ·
  </span>
)

/**
 * One run of the credentials.
 *
 * `trailing` puts the separator after each item instead of between them, which
 * is what makes two copies read as one continuous line when the marquee loops.
 */
const CredentialList = ({
  items,
  trailing = false,
  duplicate = false,
}: {
  items: string[]
  trailing?: boolean
  duplicate?: boolean
}) => (
  <ul
    aria-hidden={duplicate || undefined}
    className="flex shrink-0 items-center gap-x-3 py-2 text-xs text-white"
  >
    {items.map((item, index) => (
      <li key={`${item}-${index}`} className="flex items-center gap-3 whitespace-nowrap">
        {index > 0 && !trailing && <Separator />}
        <span className={index === 0 ? 'font-semibold' : 'text-white/85'}>{item}</span>
        {trailing && <Separator />}
      </li>
    ))}
  </ul>
)

/**
 * Purchase officers scan for these before they read anything else. Persistent,
 * quiet, and factual.
 *
 * Below md the credentials no longer fit, so they scroll themselves rather than
 * asking the visitor to drag a bar they may not notice is there. Automatically
 * moving content is a WCAG 2.2.2 problem if it cannot be stopped, so the
 * marquee pauses on hover, focus and touch, and under `prefers-reduced-motion`
 * it does not animate at all — falling back to a normal horizontal scroll.
 *
 * The second copy of the list is what makes the loop seamless; it is
 * `aria-hidden` so the credentials are not announced twice.
 */
export const TrustStrip = ({ settings }: { settings: SiteDetails }) => {
  const items = [
    settings.establishedYear ? `Since ${settings.establishedYear}` : null,
    ...(settings.credentials?.map((c) => c.label) ?? ['Govt. Contractor', 'Importer & Exporter']),
    settings.gstin ? `GSTIN ${settings.gstin}` : null,
    settings.msmeNumber ? `MSME ${settings.msmeNumber}` : null,
    settings.drugLicenceNumber ? `Drug Licence ${settings.drugLicenceNumber}` : null,
  ].filter(Boolean) as string[]

  return (
    <div className="bg-linear-to-r from-primary-deep to-primary">
      <div className="mx-auto max-w-[90rem] px-4 lg:px-6">
        {/* Self-scrolling below md */}
        <div className="marquee-viewport md:hidden">
          <div className="marquee-track">
            <CredentialList items={items} trailing />
            <CredentialList items={items} trailing duplicate />
          </div>
        </div>

        {/* Everything fits from md up, so it simply sits still */}
        <div className="hidden md:block">
          <CredentialList items={items} />
        </div>
      </div>
    </div>
  )
}
