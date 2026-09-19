import type { Access, PayloadRequest } from 'payload'

/** Signed-in admin users only. */
export const authenticated: Access = ({ req: { user } }) => Boolean(user)

/** Anyone, including anonymous visitors. */
export const anyone: Access = () => true

/** Nobody via the public API. Server-side Local API calls bypass this. */
export const nobody: Access = () => false

/** admin access must resolve to a plain boolean, not a Where clause. */
export const isAdminUser = ({ req }: { req: PayloadRequest }): boolean => Boolean(req.user)
