'use client'

import { useRouter } from 'next/navigation'
import { QuoteForm } from './quote-form'

export const QuotePageForm = () => {
  const router = useRouter()
  return (
    <QuoteForm
      idPrefix="qp"
      renderSuccess={() => null}
      onSuccess={() => router.push('/thank-you')}
    />
  )
}
