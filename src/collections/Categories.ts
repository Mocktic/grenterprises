import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '@/payload/access'
import { slugField } from '@/payload/fields/slug'
import { seoGroup } from '@/payload/fields/seo'
import { revalidateOnChange, revalidateOnDelete } from '@/payload/hooks/revalidate'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    components: {
      edit: {
        beforeDocumentControls: ['@/components/admin/CancelButton#CancelButton'],
      },
    },
    useAsTitle: 'name',
    group: 'Catalogue',
    defaultColumns: ['name', 'parent', 'displayOrder', 'updatedAt'],
    description: 'Sections of the catalogue. These fill the sidebar on every page.',
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    afterChange: [revalidateOnChange((doc) => `/categories/${doc.slug}`)],
    afterDelete: [revalidateOnDelete()],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    slugField('name'),
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
      admin: {
        position: 'sidebar',
        description: 'Leave blank for a main category. Set one to nest this underneath it.',
      },
      filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
    },
    {
      name: 'displayOrder',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Lower numbers appear first in the sidebar.' },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: { description: 'One or two lines shown at the top of the category page.' },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Landscape, around 1200×800. Shown on the home page tile for this category.',
      },
    },
    seoGroup,
  ],
}
