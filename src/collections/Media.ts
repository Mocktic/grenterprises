import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '@/payload/access'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: { group: 'Catalogue' },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  upload: {
    mimeTypes: ['image/*'],
    focalPoint: true,
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 400, position: 'centre' },
      { name: 'card', width: 768 },
      { name: 'hero', width: 1400 },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description:
          'Describe the image for screen readers and search engines. E.g. "Masimo RAD 97 SpO2 sensor, adult soft rubber".',
      },
    },
  ],
}
