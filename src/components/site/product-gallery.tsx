'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ImagePlaceholder } from '@/components/ui/image-placeholder'
import { cn } from '@/lib/utils'
import { mediaUrl } from '@/lib/media'
import type { Media } from '@/payload-types'

export const ProductGallery = ({ images, name }: { images: Media[]; name: string }) => {
  const [active, setActive] = useState(0)

  if (images.length === 0) {
    return (
      <div className="aspect-4/3 overflow-hidden rounded-card border border-line sm:aspect-square">
        <ImagePlaceholder />
        <span className="sr-only">No image available for {name}</span>
      </div>
    )
  }

  const current = images[active]

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-4/3 overflow-hidden rounded-card border border-line bg-surface-muted sm:aspect-square">
        <Image
          src={mediaUrl(current, 'hero')}
          alt={current.alt ?? name}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 40vw"
          className="object-contain p-6"
        />
      </div>

      {images.length > 1 && (
        <ul className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <li key={image.id}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`View image ${index + 1} of ${images.length}`}
                aria-current={index === active}
                className={cn(
                  'relative size-16 shrink-0 overflow-hidden rounded-control border bg-surface-muted transition-colors',
                  index === active
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-line hover:border-ink-faint',
                )}
              >
                <Image
                  src={mediaUrl(image, 'thumbnail')}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-contain p-1"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
