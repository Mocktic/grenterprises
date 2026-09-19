import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { quoteSchema } from '@/lib/quote-schema'
import { notifyNewLead } from '@/lib/notify'
import { verifyTurnstile } from '@/lib/turnstile'

/**
 * Quote submissions. Lives at /enquiry rather than /api/quote because Payload
 * owns the whole /api namespace.
 *
 * Order matters: the lead is written to the database BEFORE any notification is
 * attempted. Losing an enquiry is the only failure this business truly cannot
 * absorb, so nothing that can fail runs ahead of the write.
 */
export const POST = async (request: Request) => {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Malformed request' }, { status: 400 })
  }

  const parsed = quoteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    )
  }

  const data = parsed.data

  // Honeypot: a real person never sees this field, so any value is a bot.
  // Answer 200 so the bot believes it succeeded and does not retry.
  if (data.website) return NextResponse.json({ ok: true })

  const ip = request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for') ?? undefined
  if (!(await verifyTurnstile(data.turnstileToken, ip?.split(',')[0]))) {
    return NextResponse.json({ error: 'Could not verify that request' }, { status: 403 })
  }

  const payload = await getPayloadClient()

  let lead
  try {
    lead = await payload.create({
      collection: 'leads',
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        organisation: data.organisation || undefined,
        city: data.city || undefined,
        quantity: data.quantity,
        message: data.message || undefined,
        product: data.productId,
        consent: data.consent,
        sourcePage: data.sourcePage,
        status: 'new',
      },
    })
  } catch (error) {
    console.error('[enquiry] could not save lead:', error)
    return NextResponse.json({ error: 'Could not save that enquiry' }, { status: 500 })
  }

  // Past this point the lead is safe. Notification failures are logged, not
  // surfaced — the customer has done their part.
  let productName: string | undefined
  let partNumber: string | undefined
  if (data.productId) {
    try {
      const product = await payload.findByID({
        collection: 'products',
        id: data.productId,
        depth: 0,
      })
      productName = product?.name
      partNumber = product?.partNumber ?? undefined
    } catch {
      // Product lookup is cosmetic; the enquiry still stands without it.
    }
  }

  await notifyNewLead({
    id: lead.id,
    name: data.name,
    phone: data.phone,
    email: data.email || undefined,
    organisation: data.organisation,
    city: data.city,
    quantity: data.quantity,
    message: data.message,
    productName,
    partNumber,
    sourcePage: data.sourcePage,
  })

  return NextResponse.json({ ok: true, id: lead.id })
}
