import type { Field } from 'payload'

export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

/**
 * URL slug, generated from `source` when left blank.
 * Kept editable so the owner can fix an awkward auto-slug, but never required
 * of them — leaving it empty always produces something valid.
 */
export const slugField = (source = 'name'): Field => ({
  name: 'slug',
  type: 'text',
  index: true,
  unique: true,
  admin: {
    position: 'sidebar',
    description: 'Web address for this page. Leave blank and it fills in from the name.',
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        if (typeof value === 'string' && value.trim().length > 0) return slugify(value)
        const from = data?.[source]
        if (typeof from === 'string' && from.trim().length > 0) return slugify(from)
        return value
      },
    ],
  },
})
