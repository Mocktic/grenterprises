'use client'

import { useState } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Menu, X } from 'lucide-react'
import { CategoryList } from './category-sidebar'
import { SiteLinks } from './site-links'
import type { CategoryNode } from '@/lib/catalogue'
import type { SiteDetails } from '@/lib/site'

export const MobileNav = ({
  categories,
  settings,
}: {
  categories: CategoryNode[]
  settings: SiteDetails
}) => {
  const [open, setOpen] = useState(false)

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger
        className="order-1 -ml-2 rounded-control p-2 text-ink transition-colors hover:bg-surface-muted lg:hidden"
        aria-label="Open catalogue menu"
      >
        <Menu className="size-5" />
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="dialog-overlay fixed inset-0 z-50 bg-ink/40 lg:hidden" />
        <DialogPrimitive.Content className="fixed inset-y-0 left-0 z-50 flex w-[min(20rem,85vw)] flex-col bg-surface shadow-2xl lg:hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <DialogPrimitive.Title className="eyebrow">Catalogue</DialogPrimitive.Title>
            <DialogPrimitive.Close
              className="rounded p-1.5 text-ink-muted hover:bg-surface-muted hover:text-ink"
              aria-label="Close menu"
            >
              <X className="size-5" />
            </DialogPrimitive.Close>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <CategoryList categories={categories} onNavigate={() => setOpen(false)} />

            <SiteLinks onNavigate={() => setOpen(false)} />
          </div>

          <div className="border-t border-line bg-surface-muted px-4 py-3 text-sm">
            <p className="font-mono text-ink">{settings.phone}</p>
            <p className="mt-0.5 text-xs text-ink-faint">{settings.openingHours}</p>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
