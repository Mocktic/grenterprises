import { z } from 'zod'

/**
 * Shared by the dialog and the API route, so the browser and the server always
 * agree on what a valid enquiry is.
 *
 * Deliberately permissive: only name and phone are required. Every extra
 * required field costs leads, and the owner can ask for the rest on the call.
 */
export const quoteSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(100),
  phone: z
    .string()
    .trim()
    .min(7, 'Enter a phone number we can reach you on')
    .max(20)
    .regex(/^[\d\s+\-()]+$/, 'Use digits, spaces, and + - ( ) only'),
  email: z.union([z.email('Check this email address'), z.literal('')]).optional(),
  organisation: z.string().trim().max(120).optional(),
  city: z.string().trim().max(80).optional(),
  quantity: z.coerce.number().int().min(1).max(100000).optional(),
  message: z.string().trim().max(2000).optional(),
  consent: z.boolean().refine((v) => v, 'Please agree to be contacted'),
  productId: z.coerce.number().int().positive().optional(),
  sourcePage: z.string().max(300).optional(),
  /**
   * Honeypot. Real people never see this field, so anything in it is a bot.
   * Deliberately unconstrained: the route accepts these silently with a 200 so
   * the bot believes it succeeded. Failing validation here would name the trap
   * field in the error and teach scrapers to skip it.
   */
  website: z.string().optional(),
  turnstileToken: z.string().optional(),
})

export type QuoteInput = z.infer<typeof quoteSchema>
export type QuoteFieldErrors = Partial<Record<keyof QuoteInput, string>>
