import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '@/payload/access'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Catalogue',
    description:
      'Product photos, category images and logos. Square 1200×1200 suits products; landscape 1600×1000 suits the home banner. Keep files under 1 MB — JPG for photographs, PNG when you need a transparent background.',
  },
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
    {
      name: 'credit',
      type: 'text',
      admin: {
        description:
          'Who took the photo and under what licence. Required for anything sourced from Wikimedia Commons or a stock library — leave blank for your own photographs.',
      },
    },
  ],
}
