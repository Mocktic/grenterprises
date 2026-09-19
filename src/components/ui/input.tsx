import * as React from 'react'
import { cn } from '@/lib/utils'

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-11 w-full rounded-control border border-line-strong bg-surface px-3 text-base',
        'placeholder:text-ink-faint transition-colors',
        'hover:border-ink-faint focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
        'disabled:cursor-not-allowed disabled:bg-surface-muted',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-control border border-line-strong bg-surface px-3 py-2.5 text-base',
        'placeholder:text-ink-faint transition-colors',
        'hover:border-ink-faint focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
        className,
      )}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'

export const Field = ({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
}: {
  label: string
  htmlFor: string
  required?: boolean
  hint?: string
  error?: string
  children: React.ReactNode
}) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
      {label}
      {required && <span className="ml-0.5 text-warm">*</span>}
    </label>
    {children}
    {hint && !error && <p className="text-xs text-ink-faint">{hint}</p>}
    {error && (
      <p role="alert" className="text-xs font-medium text-warm">
        {error}
      </p>
    )}
  </div>
)
