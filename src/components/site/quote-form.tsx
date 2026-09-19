'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Field, Input, Textarea } from '@/components/ui/input'
import { quoteSchema, type QuoteFieldErrors } from '@/lib/quote-schema'

export type QuoteFormProps = {
  productId?: string | number
  productName?: string
  /** Called once the enquiry is saved. The page variant uses it to navigate. */
  onSuccess?: () => void
  /** Rendered in place of the default confirmation, for the dialog. */
  renderSuccess?: () => React.ReactNode
  idPrefix?: string
}

export const QuoteForm = ({
  productId,
  productName,
  onSuccess,
  renderSuccess,
  idPrefix = 'q',
}: QuoteFormProps) => {
  const pathname = usePathname()
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [errors, setErrors] = useState<QuoteFieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)

  const id = (name: string) => `${idPrefix}-${name}`

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    const form = new FormData(event.currentTarget)
    const payload = {
      name: String(form.get('name') ?? ''),
      phone: String(form.get('phone') ?? ''),
      email: String(form.get('email') ?? ''),
      organisation: String(form.get('organisation') ?? ''),
      city: String(form.get('city') ?? ''),
      quantity: form.get('quantity') ? Number(form.get('quantity')) : undefined,
      message: String(form.get('message') ?? ''),
      consent: form.get('consent') === 'on',
      website: String(form.get('website') ?? ''),
      productId,
      sourcePage: pathname,
    }

    const parsed = quoteSchema.safeParse(payload)
    if (!parsed.success) {
      const next: QuoteFieldErrors = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof QuoteFieldErrors
        if (key && !next[key]) next[key] = issue.message
      }
      setErrors(next)
      return
    }

    setErrors({})
    setStatus('sending')

    try {
      const res = await fetch('/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })
      if (!res.ok) throw new Error(String(res.status))
      setStatus('sent')
      onSuccess?.()
    } catch {
      setStatus('idle')
      setFormError(
        'Could not send that. Please call us on +91 94653 24507 and we will take the details.',
      )
    }
  }

  if (status === 'sent') {
    if (renderSuccess) return <>{renderSuccess()}</>
    return (
      <div className="flex flex-col items-center gap-3 rounded-card border border-line bg-surface-muted p-10 text-center">
        <CheckCircle2 className="size-10 text-success" aria-hidden />
        <p className="text-lg font-semibold text-ink">Request received</p>
        <p className="text-ink-muted">
          We will call you back with a quote, usually within one working day.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-1 flex-col">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" htmlFor={id('name')} required error={errors.name}>
          <Input id={id('name')} name="name" autoComplete="name" required />
        </Field>

        <Field label="Phone" htmlFor={id('phone')} required error={errors.phone}>
          <Input id={id('phone')} name="phone" type="tel" inputMode="tel" autoComplete="tel" required />
        </Field>

        <Field label="Email" htmlFor={id('email')} error={errors.email}>
          <Input id={id('email')} name="email" type="email" autoComplete="email" />
        </Field>

        <Field label="Hospital or company" htmlFor={id('org')} error={errors.organisation}>
          <Input id={id('org')} name="organisation" autoComplete="organization" />
        </Field>

        <Field label="City" htmlFor={id('city')} error={errors.city}>
          <Input id={id('city')} name="city" autoComplete="address-level2" />
        </Field>

        <Field label="Quantity" htmlFor={id('qty')} error={errors.quantity}>
          <Input id={id('qty')} name="quantity" type="number" min={1} inputMode="numeric" />
        </Field>

        <div className="sm:col-span-2">
          <Field
            label={productName ? 'Anything else' : 'What do you need?'}
            htmlFor={id('msg')}
            error={errors.message}
            hint={
              productName
                ? undefined
                : 'Part number, or the make and model of your equipment — whichever you have.'
            }
          >
            <Textarea
              id={id('msg')}
              name="message"
              rows={productName ? 3 : 4}
              placeholder={
                productName
                  ? 'Delivery timeline, or any question about this part.'
                  : 'e.g. SpO2 sensor for Philips IntelliVue MX450, 10 pieces'
              }
            />
          </Field>
        </div>

        {/* Honeypot — hidden from people, irresistible to bots */}
        <div aria-hidden className="hidden">
          <label htmlFor={id('website')}>Website</label>
          <input id={id('website')} name="website" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="sm:col-span-2">
          <label className="flex items-start gap-2.5 text-sm text-ink-muted">
            <input
              type="checkbox"
              name="consent"
              defaultChecked
              className="mt-1 size-4 shrink-0 accent-[var(--color-primary)]"
            />
            <span>
              GR Enterprises may contact me about this enquiry by phone, WhatsApp, or email.
            </span>
          </label>
          {errors.consent && (
            <p role="alert" className="mt-1 text-xs font-medium text-warm">
              {errors.consent}
            </p>
          )}
        </div>
      </div>

      {formError && (
        <p role="alert" className="mt-4 rounded-control bg-warm-soft px-3 py-2 text-sm text-warm">
          {formError}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={status === 'sending'} className="min-w-40">
          {status === 'sending' ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Sending
            </>
          ) : (
            'Send request'
          )}
        </Button>
        <p className="text-xs text-ink-faint">No obligation. We never share your details.</p>
      </div>
    </form>
  )
}
