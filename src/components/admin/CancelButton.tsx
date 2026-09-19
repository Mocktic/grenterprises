'use client'

import { usePathname, useRouter } from 'next/navigation'

/**
 * Discards the current edit and returns to the list.
 *
 * Payload already guards against losing work — navigating away with unsaved
 * changes raises its own confirmation — so this deliberately routes rather than
 * mutating anything. The button exists to make "I did not mean to change this"
 * a visible option instead of something you have to know to do with the back
 * button.
 */
export const CancelButton = () => {
  const router = useRouter()
  const pathname = usePathname()

  // /admin/collections/<slug>/<id|create> -> /admin/collections/<slug>
  const listHref = pathname.replace(/\/[^/]+\/?$/, '')

  return (
    <button type="button" className="gr-cancel" onClick={() => router.push(listHref)}>
      Cancel
    </button>
  )
}
