import type { GlobalConfig } from 'payload'
import { anyone, authenticated } from '@/payload/access'
import { revalidateGlobal } from '@/payload/hooks/revalidate'

/**
 * Everything the owner might want to change without a developer — most
 * importantly the phone number, which appears in a dozen places.
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Shop details',
  admin: {
    group: 'Settings',
    description: 'Contact details and credentials shown across the whole website.',
  },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobal()] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Contact',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'phone', type: 'text', required: true, admin: { width: '50%' } },
                {
                  name: 'whatsappNumber',
                  type: 'text',
                  admin: {
                    width: '50%',
                    description: 'Digits only with country code, e.g. 919465324507.',
                  },
                },
              ],
            },
            { name: 'email', type: 'email', required: true },
            { name: 'address', type: 'textarea', required: true },
            {
              type: 'row',
              fields: [
                { name: 'city', type: 'text', admin: { width: '33%' } },
                { name: 'state', type: 'text', admin: { width: '33%' } },
                { name: 'postalCode', type: 'text', admin: { width: '34%' } },
              ],
            },
            { name: 'openingHours', type: 'text', admin: { placeholder: 'Mon–Sat, 9:30am–7pm' } },
            {
              name: 'mapEmbedUrl',
              type: 'text',
              label: 'Google Maps embed',
              admin: {
                description:
                  'On Google Maps choose Share → Embed a map → Copy HTML, then paste it here. Pasting just the link works too. Leave blank and the map is built from the address above.',
              },
            },
          ],
        },
        {
          label: 'Credentials',
          description: 'Shown in the bar under the header. Purchase officers look for these.',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'establishedYear',
                  type: 'number',
                  defaultValue: 1994,
                  admin: { width: '33%' },
                },
                { name: 'gstin', type: 'text', admin: { width: '33%' } },
                { name: 'msmeNumber', type: 'text', admin: { width: '34%' } },
              ],
            },
            {
              name: 'drugLicenceNumber',
              type: 'text',
              label: 'Drug Licence Number',
              admin: {
                description: 'Shown in the bar under the header, alongside GSTIN and MSME.',
              },
            },
            {
              name: 'credentials',
              type: 'array',
              labels: { singular: 'Credential', plural: 'Credentials' },
              admin: { description: 'Short phrases, e.g. "Govt. Contractor", "Importer & Exporter".' },
              fields: [{ name: 'label', type: 'text', required: true }],
            },
          ],
        },
        {
          label: 'Home page',
          description: 'The banner at the top of the home page.',
          fields: [
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description:
                  'A wide photograph — your showroom, a shelf of stock, or equipment in use. Landscape, around 1600×1000, under 1 MB. This one IS cropped to fit, so keep the subject near the middle.',
              },
            },
            {
              name: 'heroHeadline',
              type: 'text',
              admin: { placeholder: 'Compatible parts for the equipment you already run.' },
            },
            {
              name: 'heroSubtext',
              type: 'textarea',
              maxLength: 260,
              admin: { description: 'One or two lines under the headline. Blank uses the default.' },
            },
          ],
        },
        {
          label: 'Pricing',
          fields: [
            {
              name: 'defaultShowPrice',
              type: 'checkbox',
              defaultValue: false,
              label: 'Show prices by default on new products',
            },
            {
              name: 'priceDisclaimer',
              type: 'text',
              defaultValue: 'All prices exclusive of GST. Subject to change without notice.',
              admin: { description: 'Small print shown wherever a price appears.' },
            },
          ],
        },
      ],
    },
  ],
}
