import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, BadgeCheck, FileCheck2, PackageSearch, Truck } from 'lucide-react'
import { ProductScroller } from '@/components/site/product-scroller'
import { QuoteDialog } from '@/components/site/quote-dialog'
import { Button } from '@/components/ui/button'
import { getCategoryShowcase, getBrands } from '@/lib/catalogue'
import { getSiteSettings, telLink } from '@/lib/site'
import { isMedia, mediaUrl } from '@/lib/media'

export default async function HomePage() {
  const [showcase, brands, settings] = await Promise.all([
    getCategoryShowcase(6, 10),
    getBrands(),
    getSiteSettings(),
  ])

  const hero = isMedia(settings.heroImage) ? settings.heroImage : null
  const headline = settings.heroHeadline || 'Compatible parts for the equipment you already run.'
  const subtext =
    settings.heroSubtext ||
    'SpO2 sensors, ECG cables, patient plates, airway devices and batteries — for Masimo, Philips, Medtronic, Erbe, GE and more. Tell us the part number and we will quote it.'

  return (
    <>
      {/* Hero. Splits into text + image once a photograph is set in the admin;
          until then it stays a full-width text band rather than showing a hole. */}
      <section className="border-b border-line bg-linear-to-b from-primary-soft/60 to-surface">
        <div
          className={
            hero
              ? 'grid items-center gap-8 px-4 py-10 lg:grid-cols-2 lg:gap-12 lg:px-10 lg:py-14'
              : 'px-4 py-12 lg:px-10 lg:py-16'
          }
        >
          <div className={hero ? '' : 'max-w-3xl'}>
            <p className="eyebrow">
              {settings.city} · Supplying hospitals since {settings.establishedYear}
            </p>
            <h1 className="mt-3 text-h1 font-semibold lg:text-display">{headline}</h1>
            <p className="mt-4 text-lg text-ink-muted">{subtext}</p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="/products">
                  Show products <ArrowRight className="size-4" />
                </Link>
              </Button>
              <QuoteDialog label="Request a quote" variant="secondary" size="lg" />
            </div>

            <p className="mt-4 text-sm text-ink-faint">
              Know the part number? Search for it in the bar above.
            </p>
          </div>

          {hero && (
            <div className="relative aspect-4/3 overflow-hidden rounded-card border border-line bg-surface-muted lg:aspect-3/2">
              <Image
                src={mediaUrl(hero, 'hero')}
                alt={hero.alt ?? 'GR Enterprises medical equipment'}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          )}
        </div>
      </section>

      {/* Popular categories, each a scrollable row. Replaces the old category
          grid, which only repeated the sidebar without showing any stock. */}
      {showcase.length > 0 ? (
        <div className="divide-y divide-line">
          {showcase.map(({ category, products, total }) => (
            <section key={category.id} className="px-4 py-10 lg:px-10">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate text-h2">{category.name}</h2>
                  {category.description && (
                    <p className="mt-1 line-clamp-1 text-sm text-ink-muted">
                      {category.description}
                    </p>
                  )}
                </div>
                <Button asChild variant="quiet" size="sm" className="shrink-0">
                  <Link href={`/categories/${category.slug}`}>
                    {total > products.length ? `All ${total}` : 'View all'}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>

              <ProductScroller products={products} label={category.name} />
            </section>
          ))}
        </div>
      ) : (
        <section className="px-4 py-14 lg:px-10">
          <div className="rounded-card border border-dashed border-line-strong p-10 text-center">
            <PackageSearch className="mx-auto size-7 text-line-strong" aria-hidden />
            <p className="mt-3 font-medium text-ink">No products yet</p>
            <p className="mt-1 text-sm text-ink-muted">
              Add categories and products in the admin panel and they appear here.
            </p>
          </div>
        </section>
      )}

      {/* Brands */}
      {brands.length > 0 && (
        <section className="border-t border-line bg-surface-muted px-4 py-10 lg:px-10">
          <p className="eyebrow">Compatible with</p>
          <h2 className="mt-1 mb-6 text-h2">Equipment we supply for</h2>
          <ul className="flex flex-wrap gap-2">
            {brands.map((brand) => (
              <li key={brand.id}>
                <Link
                  href={`/brands/${brand.slug}`}
                  className="inline-flex items-center rounded-control border border-line bg-surface px-3 py-1.5 text-sm text-ink-muted transition-colors hover:border-primary/40 hover:bg-primary-soft hover:text-primary-deep"
                >
                  {brand.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Why us — the credentials a purchase officer checks before ordering */}
      <section className="border-t border-line px-4 py-10 lg:px-10 lg:py-14">
        <p className="eyebrow">Why GR Enterprises</p>
        <h2 className="mt-1 mb-6 text-h2">Built for hospital purchase departments</h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: BadgeCheck,
              title: `${new Date().getFullYear() - (settings.establishedYear ?? 1994)} years in the trade`,
              body: `Supplying hospitals and biomedical departments since ${settings.establishedYear}, with the references to show for it.`,
            },
            {
              icon: FileCheck2,
              title: 'Tender-ready paperwork',
              body: 'Registered government contractor. GSTIN and MSME documentation supplied with every quote.',
            },
            {
              icon: PackageSearch,
              title: 'Hard-to-source parts',
              body: 'Compatible consumables and spares for equipment that manufacturers have moved on from.',
            },
            {
              icon: Truck,
              title: 'Despatch across India',
              body: `Showroom in ${settings.city} for Tricity buyers; courier despatch everywhere else.`,
            },
          ].map(({ icon: Icon, title, body }) => (
            <li key={title} className="rounded-card border border-line bg-surface p-5">
              <Icon className="size-5 text-primary" aria-hidden />
              <h3 className="mt-3 text-sm font-semibold text-ink">{title}</h3>
              <p className="mt-1.5 text-sm text-ink-muted">{body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Closing call to action */}
      <section className="border-t border-line px-4 py-12 lg:px-10">
        <div className="rounded-card border border-line bg-linear-to-br from-primary-deep to-primary px-6 py-10 text-center lg:px-10">
          <h2 className="text-h2 text-white">Cannot find the part you need?</h2>
          <p className="mx-auto mt-2 max-w-xl text-white/80">
            Send us the equipment make and model. We source compatible consumables and spares that
            are no longer easy to find.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <QuoteDialog
              label="Request a quote"
              variant="secondary"
              size="lg"
              className="border-transparent"
            />
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="text-white hover:bg-white/10 hover:text-white"
            >
              <a href={telLink(settings.phone)}>
                <span className="font-mono">{settings.phone}</span>
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
