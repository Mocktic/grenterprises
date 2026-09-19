import Link from 'next/link'
import { SearchBar } from '@/components/site/search-bar'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16 lg:px-10">
      <div className="max-w-lg text-center">
        <p className="eyebrow">Page not found</p>
        <h1 className="mt-2 text-h1">We could not find that page</h1>
        <p className="mt-3 text-ink-muted">
          It may have moved, or the address may be mistyped. Search for a part number, or browse the
          catalogue.
        </p>

        <div className="mt-7">
          <SearchBar id="notfound-search" size="lg" />
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/products">All Products</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
