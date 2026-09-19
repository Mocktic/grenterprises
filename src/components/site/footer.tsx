import Link from 'next/link'
import { formattedAddress, getSiteSettings } from '@/lib/site'
import { getCategoryTree } from '@/lib/catalogue'

export const Footer = async () => {
  const [settings, categories] = await Promise.all([getSiteSettings(), getCategoryTree()])

  return (
    <footer className="mt-16 border-t border-line bg-surface-muted">
      <div className="mx-auto grid max-w-[90rem] gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="text-base font-semibold text-ink">GR Enterprises</p>
          <p className="mt-1 text-sm text-ink-muted">
            Medical equipment and accessories, supplied to hospitals across India since{' '}
            {settings.establishedYear}.
          </p>
          <address className="mt-4 text-sm not-italic text-ink-muted">
            {formattedAddress(settings)}
          </address>
        </div>

        <div>
          <p className="eyebrow">Catalogue</p>
          <ul className="mt-3 space-y-2 text-sm">
            {categories.slice(0, 7).map((c) => (
              <li key={c.id}>
                <Link
                  href={`/categories/${c.slug}`}
                  className="text-ink-muted transition-colors hover:text-primary"
                >
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/products" className="font-medium text-primary hover:underline">
                All Products
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow">Company</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/about" className="text-ink-muted transition-colors hover:text-primary">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-ink-muted transition-colors hover:text-primary">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/quote" className="text-ink-muted transition-colors hover:text-primary">
                Request a quote
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow">Get in touch</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-muted">
            <li>
              <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="font-mono hover:text-primary">
                {settings.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${settings.email}`} className="break-all hover:text-primary">
                {settings.email}
              </a>
            </li>
            <li className="pt-1 text-xs text-ink-faint">{settings.openingHours}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[90rem] flex-col gap-1 px-4 py-4 text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between lg:px-6">
          <p>
            © {new Date().getFullYear()} GR Enterprises. All rights reserved.
          </p>
          <p className="font-mono">
            GSTIN {settings.gstin} · MSME {settings.msmeNumber}
          </p>
        </div>
      </div>
    </footer>
  )
}
