import { Suspense } from 'react'
import { Phone } from 'lucide-react'
import { Logo } from './logo'
import { SearchBar } from './search-bar'
import { HeaderSearch } from './header-search'
import { MobileNav } from './mobile-nav'
import { getSiteSettings, telLink, whatsappLink } from '@/lib/site'
import { getCategoryTree } from '@/lib/catalogue'

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.174.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 0 1 6.988 2.898 9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.8 11.8 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.9 11.9 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 0 0-3.48-8.413Z" />
  </svg>
)

export const Header = async () => {
  const [settings, categories] = await Promise.all([getSiteSettings(), getCategoryTree()])

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      {/* One search input for every breakpoint. It wraps to its own full-width
          row below the logo on phones and sits between the logo and the contact
          buttons from lg up, reordered with flexbox rather than rendered twice —
          two inputs would mean two elements claiming the same id and two search
          landmarks for a screen reader. */}
      <div className="mx-auto flex max-w-[90rem] flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 lg:flex-nowrap lg:gap-x-8 lg:px-6">
        <MobileNav categories={categories} settings={settings} />

        <Logo className="order-2" />

        <div className="order-4 w-full min-w-0 lg:order-3 lg:w-auto lg:flex-1 lg:justify-center">
          <Suspense fallback={<SearchBar id="site-search-static" className="lg:max-w-xl" />}>
            <HeaderSearch className="lg:max-w-xl" />
          </Suspense>
        </div>

        <div className="order-3 ml-auto flex shrink-0 items-center gap-2 lg:order-4 lg:ml-0">
          <a
            href={telLink(settings.phone)}
            className="inline-flex h-11 items-center gap-2 rounded-control border border-line-strong px-3 text-sm font-medium text-ink transition-colors hover:border-ink-faint hover:bg-surface-muted"
          >
            <Phone className="size-4 shrink-0 text-primary" aria-hidden />
            <span className="hidden font-mono xl:inline">{settings.phone}</span>
            <span className="sr-only xl:hidden">Call {settings.phone}</span>
          </a>
          {settings.whatsappNumber && (
            <a
              href={whatsappLink(
                settings.whatsappNumber,
                'Hello GR Enterprises, I would like to enquire about a product.',
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-control bg-[#25D366] px-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              <WhatsAppIcon className="size-4 shrink-0" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          )}
        </div>
      </div>
    </header>
  )
}
