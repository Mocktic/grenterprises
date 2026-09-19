import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getSiteSettings, telLink } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Request received',
  robots: { index: false, follow: false },
}

export default async function ThankYouPage() {
  const settings = await getSiteSettings()

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16 lg:px-10">
      <div className="max-w-md text-center">
        <CheckCircle2 className="mx-auto size-12 text-success" aria-hidden />
        <h1 className="mt-5 text-h1">Request received</h1>
        <p className="mt-3 text-ink-muted">
          Thank you. We will call you back with a quote, usually within one working day.
        </p>
        <p className="mt-2 text-sm text-ink-faint">
          Need it sooner? Call{' '}
          <a href={telLink(settings.phone)} className="font-mono text-primary hover:underline">
            {settings.phone}
          </a>
          .
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/products">Keep browsing</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
