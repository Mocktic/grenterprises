import { Resend } from 'resend'

export type LeadNotification = {
  id: string | number
  name: string
  phone: string
  email?: string
  organisation?: string
  city?: string
  quantity?: number
  message?: string
  productName?: string
  partNumber?: string
  sourcePage?: string
}

/**
 * One method, so adding Telegram or WhatsApp later means writing a second
 * implementation and adding it to `notifiers` — nothing in the submission path
 * changes.
 */
export interface LeadNotifier {
  name: string
  send(lead: LeadNotification): Promise<void>
}

const adminUrl = (id: string | number) =>
  `${process.env.NEXT_PUBLIC_SERVER_URL ?? ''}/admin/collections/leads/${id}`

const line = (label: string, value?: string | number) =>
  value ? `<tr><td style="padding:4px 12px 4px 0;color:#5a6b85">${label}</td><td style="padding:4px 0;color:#0b1b33"><strong>${value}</strong></td></tr>` : ''

export const emailNotifier: LeadNotifier = {
  name: 'email',
  async send(lead) {
    const apiKey = process.env.RESEND_API_KEY
    const to = process.env.LEAD_NOTIFY_TO
    if (!apiKey || !to) {
      console.info('[lead] email not configured; lead saved as', lead.id)
      return
    }

    const resend = new Resend(apiKey)
    const subject = lead.productName
      ? `Quote request: ${lead.productName} — ${lead.name}`
      : `Quote request from ${lead.name}`

    await resend.emails.send({
      from: process.env.LEAD_NOTIFY_FROM ?? 'GR Enterprises <onboarding@resend.dev>',
      to,
      replyTo: lead.email || undefined,
      subject,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:560px">
          <h2 style="color:#0b1b33;margin:0 0 4px">New quote request</h2>
          <p style="color:#5a6b85;margin:0 0 16px">Call back within a day to stay ahead of other suppliers.</p>
          <table style="border-collapse:collapse;font-size:14px">
            ${line('Name', lead.name)}
            ${line('Phone', lead.phone)}
            ${line('Email', lead.email)}
            ${line('Organisation', lead.organisation)}
            ${line('City', lead.city)}
            ${line('Product', lead.productName)}
            ${line('Part number', lead.partNumber)}
            ${line('Quantity', lead.quantity)}
          </table>
          ${lead.message ? `<p style="margin:16px 0 0;color:#0b1b33"><em>"${lead.message}"</em></p>` : ''}
          <p style="margin:24px 0 0">
            <a href="${adminUrl(lead.id)}" style="color:#2d5bb9">Open this enquiry in the admin panel</a>
          </p>
        </div>
      `,
    })
  },
}

const notifiers: LeadNotifier[] = [emailNotifier]

/**
 * Never throws. The lead is already saved by the time this runs, and a failed
 * notification must not turn into a failed submission for the customer.
 */
export const notifyNewLead = async (lead: LeadNotification): Promise<void> => {
  await Promise.all(
    notifiers.map(async (notifier) => {
      try {
        await notifier.send(lead)
      } catch (error) {
        console.error(`[lead] ${notifier.name} notifier failed for lead ${lead.id}:`, error)
      }
    }),
  )
}
