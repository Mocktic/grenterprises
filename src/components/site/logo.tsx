import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

/**
 * The hexagon mark is artwork; the wordmark and tagline are set in live type.
 *
 * logo.jpg is 474×141, and within it the tagline occupies eleven pixels of
 * height. At any size that fits a header that is an unreadable smudge, and
 * upscaling a raster only enlarges the smudge. Live text stays crisp at every
 * breakpoint and on high-density screens.
 *
 * The proportions come from measuring the file: the wordmark caps are 25px, the
 * tagline band is 11px, and the gap between them is 8px. That puts the tagline
 * at roughly 0.45x the wordmark — which is also, not by accident, the size at
 * which its thirty-five characters span about the same width as the wordmark's
 * fourteen. That equal-width relationship is what makes the lockup read as one
 * unit, so the ratio is held rather than tuned by eye.
 *
 * Both colours are sampled from the glyph cores of the original.
 * Replace all of this with the vector artwork when it turns up.
 */
export const Logo = ({ className }: { className?: string }) => (
  <Link
    href="/"
    className={cn('flex shrink-0 items-center gap-2 lg:gap-2.5', className)}
    aria-label="GR Enterprises — home"
  >
    <Image
      src="/mark.jpg"
      alt=""
      width={140}
      height={141}
      priority
      aria-hidden
      className="size-8 shrink-0 mix-blend-multiply lg:size-9"
    />
    <span className="flex min-w-0 flex-col">
      <span className="font-serif text-[0.9375rem] font-bold leading-none tracking-[0.005em] text-logo lg:text-[1rem]">
        GR ENTERPRISES
      </span>
      <span className="mt-[0.15rem] font-serif text-[0.45rem] font-semibold leading-none text-logo-muted lg:mt-[0.18rem] lg:text-[0.5rem]">
        Govt. Contractor &amp; General Supplier
      </span>
    </span>
  </Link>
)
