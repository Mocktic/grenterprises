import type { SiteDetails } from '@/lib/site'

/**
 * Purchase officers scan for these before they read anything else. Persistent,
 * quiet, and factual — the maroon from the logo appears here and nowhere else.
 */
export const TrustStrip = ({ settings }: { settings: SiteDetails }) => {
  const items = [
    settings.establishedYear ? `Since ${settings.establishedYear}` : null,
    ...(settings.credentials?.map((c) => c.label) ?? ['Govt. Contractor', 'Importer & Exporter']),
    settings.gstin ? `GSTIN ${settings.gstin}` : null,
    settings.msmeNumber ? `MSME ${settings.msmeNumber}` : null,
  ].filter(Boolean) as string[]

  return (
    <div className="border-b border-line bg-warm-soft">
      <div className="mx-auto max-w-[90rem] overflow-x-auto px-4 lg:px-6">
        <ul className="flex min-w-max items-center gap-x-3 py-1.5 text-xs text-warm">
          {items.map((item, i) => (
            <li key={item} className="flex items-center gap-3 whitespace-nowrap">
              {i > 0 && <span aria-hidden className="text-warm/30">·</span>}
              <span className={i === 0 ? 'font-semibold' : ''}>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
