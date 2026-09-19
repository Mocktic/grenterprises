import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '@/payload/access'
import { slugField } from '@/payload/fields/slug'
import { seoFields } from '@/payload/fields/seo'
import { revalidateOnChange, revalidateOnDelete } from '@/payload/hooks/revalidate'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    components: {
      edit: {
        beforeDocumentControls: ['@/components/admin/CancelButton#CancelButton'],
      },
    },
    useAsTitle: 'name',
    group: 'Catalogue',
    defaultColumns: ['name', 'partNumber', 'category', 'availability', 'updatedAt'],
    description: 'Everything you supply. Part number and compatibility matter most for search.',
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    afterChange: [revalidateOnChange((doc) => `/products/${doc.slug}`)],
    afterDelete: [revalidateOnDelete()],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    slugField('name'),
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Show this on the home page.' },
    },
    {
      name: 'availability',
      type: 'select',
      defaultValue: 'in-stock',
      options: [
        { label: 'In stock', value: 'in-stock' },
        { label: 'Made to order', value: 'made-to-order' },
        { label: 'Discontinued', value: 'discontinued' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Details',
          fields: [
            {
              name: 'partNumber',
              type: 'text',
              index: true,
              admin: {
                description:
                  'The manufacturer code, exactly as printed — e.g. PSR-11-75-KE7 or 989803206781. Buyers search for this, so get it right.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'category',
                  type: 'relationship',
                  relationTo: 'categories',
                  required: true,
                  admin: { width: '50%' },
                },
                {
                  name: 'brand',
                  type: 'relationship',
                  relationTo: 'brands',
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'shortDescription',
              type: 'textarea',
              maxLength: 220,
              admin: {
                description: 'One line, shown on product cards and in search results.',
              },
            },
            { name: 'description', type: 'richText' },
            {
              name: 'images',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              admin: { description: 'First image is used on cards and in search results.' },
            },
          ],
        },
        {
          label: 'Specifications',
          fields: [
            {
              name: 'specifications',
              type: 'array',
              labels: { singular: 'Specification', plural: 'Specifications' },
              admin: { description: 'Rendered as a table on the product page.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'label', type: 'text', required: true, admin: { width: '40%' } },
                    { name: 'value', type: 'text', required: true, admin: { width: '60%' } },
                  ],
                },
              ],
            },
            {
              name: 'variants',
              type: 'array',
              labels: { singular: 'Size or option', plural: 'Sizes and options' },
              admin: {
                description:
                  'Sizes or variations sold under this product — e.g. PCGel sizes 1 to 5, or Mac blades 1 to 4. Each can carry its own part number.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'label', type: 'text', required: true, admin: { width: '50%' } },
                    { name: 'partNumber', type: 'text', admin: { width: '50%' } },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Compatibility',
          description: 'The equipment this part fits. One row per model.',
          fields: [
            {
              name: 'compatibleWith',
              type: 'array',
              labels: { singular: 'Compatible model', plural: 'Compatible models' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'manufacturer',
                      type: 'text',
                      required: true,
                      admin: { width: '50%', placeholder: 'Philips' },
                    },
                    {
                      name: 'model',
                      type: 'text',
                      required: true,
                      admin: { width: '50%', placeholder: 'M2735A' },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Price',
          description:
            'Leave the price hidden to show "Price on request" instead. Showing a price also makes this product eligible to display that price in Google results.',
          fields: [
            {
              name: 'showPrice',
              type: 'checkbox',
              defaultValue: false,
              label: 'Show the price on the website',
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'price',
                  type: 'number',
                  min: 0,
                  admin: {
                    width: '50%',
                    step: 1,
                    description: 'In rupees.',
                    condition: (_, siblingData) => Boolean(siblingData?.showPrice),
                  },
                },
                {
                  name: 'priceNote',
                  type: 'text',
                  admin: {
                    width: '50%',
                    placeholder: 'per piece, excluding GST',
                    condition: (_, siblingData) => Boolean(siblingData?.showPrice),
                  },
                },
              ],
            },
          ],
        },
        { label: 'Search listing', name: 'seo', fields: seoFields },
      ],
    },
  ],
}
