import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { ComponentProps } from 'react'

const badge = cva(
  'inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs font-medium leading-tight',
  {
    variants: {
      tone: {
        neutral: 'border-line-strong bg-surface-muted text-ink-muted',
        success: 'border-success/25 bg-success-soft text-success',
        caution: 'border-caution/25 bg-caution-soft text-caution',
        brand: 'border-primary/20 bg-primary-soft text-primary-deep',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
)

export const Badge = ({
  className,
  tone,
  ...props
}: ComponentProps<'span'> & VariantProps<typeof badge>) => (
  <span className={cn(badge({ tone }), className)} {...props} />
)

const availabilityMap = {
  'in-stock': { label: 'In stock', tone: 'success' as const },
  'made-to-order': { label: 'Made to order', tone: 'caution' as const },
  discontinued: { label: 'Discontinued', tone: 'neutral' as const },
}

export const AvailabilityBadge = ({ value }: { value?: string | null }) => {
  const state = availabilityMap[value as keyof typeof availabilityMap]
  if (!state) return null
  return <Badge tone={state.tone}>{state.label}</Badge>
}
