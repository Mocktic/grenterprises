import { revalidatePath } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'

/**
 * Cache invalidation on publish.
 *
 * Without this the owner edits a product, reloads the site, sees no change, and
 * concludes the admin is broken. Revalidating on write means the site updates
 * the moment they press save — the behaviour they expect, and the only one that
 * survives a handover.
 *
 * `revalidatePath('/', 'layout')` clears the whole route tree. That is blunt,
 * but catalogue edits are infrequent and a stale sidebar is worse than a cold
 * cache. Tag-based invalidation was tried and dropped: it adds a second thing
 * to keep in sync for no benefit at this size.
 *
 * Payload hooks also run outside a Next request (seed scripts, CLI), where
 * these calls throw. That is harmless, so it is swallowed.
 */
const safely = (run: () => void) => {
  try {
    run()
  } catch {
    // Not inside a Next.js request context — nothing to revalidate.
  }
}

type PathBuilder = (doc: Record<string, unknown>) => string | undefined

const revalidate = (doc: unknown, buildPath?: PathBuilder) =>
  safely(() => {
    const path = buildPath?.(doc as Record<string, unknown>)
    if (path) revalidatePath(path)
    revalidatePath('/', 'layout')
  })

export const revalidateOnChange =
  (buildPath?: PathBuilder): CollectionAfterChangeHook =>
  ({ doc }) => {
    revalidate(doc, buildPath)
    return doc
  }

export const revalidateOnDelete =
  (buildPath?: PathBuilder): CollectionAfterDeleteHook =>
  ({ doc }) => {
    revalidate(doc, buildPath)
    return doc
  }

export const revalidateGlobal =
  (): GlobalAfterChangeHook =>
  ({ doc }) => {
    revalidate(doc)
    return doc
  }
