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

  const heroSrc = isMedia(settings.heroImage) ? mediaUrl(settings.heroImage, 'hero') : '/hero.jpg'
  /**
   * The headline spans both halves of the business on purpose. "A single
   * oximeter" is the walk-in buying one device; "a whole ward" is the purchase
   * department fitting out a floor. The old line only spoke to the second, and
   * only about spares, which undersold the equipment they actually sell.
   */
  const headline = settings.heroHeadline || 'From a single oximeter to a whole ward.'
  const subtext =
    settings.heroSubtext ||
    'Complete medical equipment and the parts that keep it running - ECG machines, patient monitors, SpO2 meters, laryngoscopes, airway devices, sensors and batteries. One piece or a full department.'

  return (
    <>
      {/* Hero.
          The supplied photograph carries its own blue fade across the left
          third, so it was built for left-aligned type. A scrim is layered on
          anyway because `object-cover` crops differently at every width — on a
          phone the framing lands nearer the middle of the theatre, where that
          built-in fade has run out and white text would otherwise sit on pale
          tile. The scrim is lighter from lg up so the equipment stays visible. */}
      <section className="relative isolate flex min-h-[27rem] items-center overflow-hidden sm:min-h-[31rem] lg:min-h-[36rem]">
        <Image
          src={heroSrc}
          alt=""
          aria-hidden
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover object-[62%_center] lg:object-center"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-linear-to-r from-primary-deep/95 via-primary-deep/88 to-primary-deep/74 lg:from-primary-deep/88 lg:via-primary-deep/48 lg:to-primary-deep/15"
        />

        <div className="w-full px-4 py-14 sm:py-16 lg:px-10 lg:py-20">
          <div className="max-w-xl lg:max-w-2xl">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-white/75">
              {settings.city} · Hospitals, clinics and homes since {settings.establishedYear}
            </p>
            <h1 className="mt-3 text-h1 font-semibold text-white lg:text-display">{headline}</h1>
            <p className="mt-4 max-w-xl text-lg text-white/85">{subtext}</p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" variant="secondary" className="border-transparent bg-white text-primary-deep hover:bg-white/90">
                <Link href="/products">
                  Show products <ArrowRight className="size-4" />
                </Link>
              </Button>
              <QuoteDialog
                label="Request a quote"
                variant="ghost"
                size="lg"
                className="border border-white/45 text-white hover:bg-white/10 hover:text-white"
              />
            </div>
          </div>
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
          <h2 className="text-h2 text-white">Cannot find what you need?</h2>
          <p className="mx-auto mt-2 max-w-xl text-white/80">
            Tell us the equipment you are after, or the make and model you need parts for. We
            supply whole machines and the hard-to-find consumables that keep older ones running.
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
