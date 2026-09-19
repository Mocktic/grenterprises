import type { Field } from 'payload'

/**
 * Search-listing overrides. Both fall back to page content when blank, so the
 * owner only fills these in when they want to say something different from the
 * page itself.
 */
export const seoFields: Field[] = [
  {
    name: 'metaTitle',
    type: 'text',
    maxLength: 70,
    admin: {
      description: 'Headline shown in Google results. Around 60 characters. Blank uses the name.',
    },
  },
  {
    name: 'metaDescription',
    type: 'textarea',
    maxLength: 180,
    admin: {
      description:
        'Grey summary text under the Google headline. Around 155 characters. Blank uses the short description.',
    },
  },
]

export const seoGroup: Field = {
  name: 'seo',
  type: 'group',
  label: 'Search engine listing',
  fields: seoFields,
}
