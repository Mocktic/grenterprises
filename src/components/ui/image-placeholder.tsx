import Image from 'next/image'
import { cn } from '@/lib/utils'

/**
 * Shown where a product or category has no photograph yet. The brand mark at
 * low opacity reads as "ours, awaiting a photo" rather than as a broken image —
 * which matters because the owner will be adding pictures gradually over months.
 */
export const ImagePlaceholder = ({ className }: { className?: string }) => (
  <div className={cn('flex h-full items-center justify-center bg-surface-muted', className)}>
    <Image
      src="/mark.jpg"
      alt=""
      width={140}
      height={141}
      aria-hidden
      className="size-10 opacity-15 mix-blend-multiply"
    />
  </div>
)
