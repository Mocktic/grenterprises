import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '@/payload/access'
import { slugField } from '@/payload/fields/slug'
import { seoGroup } from '@/payload/fields/seo'
import { revalidateOnChange, revalidateOnDelete } from '@/payload/hooks/revalidate'

export const Brands: CollectionConfig = {
  slug: 'brands',
  admin: {
    components: {
      edit: {
        beforeDocumentControls: ['@/components/admin/CancelButton#CancelButton'],
      },
    },
    useAsTitle: 'name',
    group: 'Catalogue',
    defaultColumns: ['name', 'updatedAt'],
    description: 'Manufacturers you supply for. Each one gets its own page.',
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    afterChange: [revalidateOnChange((doc) => `/brands/${doc.slug}`)],
    afterDelete: [revalidateOnDelete()],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    slugField('name'),
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'description', type: 'textarea' },
    seoGroup,
  ],
}
