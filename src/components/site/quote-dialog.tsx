'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button, type ButtonProps } from '@/components/ui/button'
import { QuoteForm } from './quote-form'

type Props = {
  productId?: string | number
  productName?: string
  partNumber?: string | null
  label?: string
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
  className?: string
}

export const QuoteDialog = ({
  productId,
  productName,
  partNumber,
  label = 'Get a quote',
  variant = 'primary',
  size = 'md',
  className,
}: Props) => {
  const [open, setOpen] = useState(false)
  const [key, setKey] = useState(0)

  // Remount the form on close so a reopened dialog starts clean.
  const onOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) window.setTimeout(() => setKey((k) => k + 1), 200)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          {label}
        </Button>
      </DialogTrigger>

      <DialogContent aria-describedby="quote-desc">
        <div className="shrink-0 border-b border-line px-5 py-4 pr-12">
          <DialogTitle>Get a quote</DialogTitle>
          <DialogDescription id="quote-desc">
            Tell us how to reach you and we will send a price.
          </DialogDescription>

          {productName && (
            <div className="mt-3 rounded-control border border-line bg-surface-muted px-3 py-2">
              <p className="text-sm font-medium text-ink">{productName}</p>
              {partNumber && (
                <p className="mt-0.5 font-mono text-xs text-ink-muted">Part {partNumber}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <QuoteForm
            key={key}
            idPrefix="qd"
            productId={productId}
            productName={productName}
            renderSuccess={() => (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <CheckCircle2 className="size-10 text-success" aria-hidden />
                <p className="text-lg font-semibold text-ink">Request received</p>
                <p className="text-ink-muted">
                  We will call you back with a quote, usually within one working day.
                </p>
                <Button variant="secondary" className="mt-2" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              </div>
            )}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
