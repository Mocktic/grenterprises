'use client'

import { useSearchParams } from 'next/navigation'
import { SearchBar } from './search-bar'

/**
 * Keeps the header field in step with the URL, so arriving on /search?q=M3538A
 * still shows M3538A in the box. Without this the query looks discarded and
 * people retype it.
 */
export const HeaderSearch = ({ className }: { className?: string }) => {
  const params = useSearchParams()
  const q = params.get('q') ?? ''
  return <SearchBar id="site-search" key={q} defaultValue={q} className={className} />
}
