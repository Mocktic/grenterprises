'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * The signature element. A part number is data that gets transcribed into a
 * purchase order, so it is set in monospace and given a one-click copy — the
 * most common thing a biomedical engineer actually wants to do with it.
 */
export const SpecPlate = ({
  value,
  copyable = false,
  className,
}: {
  value: string
  copyable?: boolean
  className?: string
}) => {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard unavailable (insecure context or denied) — the number is
      // still selectable on screen, so there is nothing to recover from.
    }
  }

  if (!copyable) return <span className={cn('spec-plate', className)}>{value}</span>

  return (
    <span className={cn('spec-plate', className)}>
      {value}
      <button
        type="button"
        onClick={copy}
        className="-mr-1 rounded p-1 text-ink-faint transition-colors hover:bg-surface-sunken hover:text-ink"
        aria-label={copied ? 'Part number copied' : `Copy part number ${value}`}
      >
        {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
      </button>
    </span>
  )
}
