/**
 * Cloudflare Turnstile. With no secret configured (local development) the check
 * passes, so the form is testable without cloud credentials.
 */
export const verifyTurnstile = async (token?: string, ip?: string): Promise<boolean> => {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true
  if (!token) return false

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token, remoteip: ip }),
    })
    const data = (await res.json()) as { success?: boolean }
    return Boolean(data.success)
  } catch (error) {
    console.error('[turnstile] verification failed:', error)
    return false
  }
}
