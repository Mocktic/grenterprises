import { Suspense } from 'react'
import { Phone } from 'lucide-react'
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon'
import { Logo } from './logo'
import { SearchBar } from './search-bar'
import { HeaderSearch } from './header-search'
import { MobileNav } from './mobile-nav'
import { getSiteSettings, telLink, whatsappLink } from '@/lib/site'
import { getCategoryTree } from '@/lib/catalogue'

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
