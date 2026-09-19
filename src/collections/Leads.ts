import type { CollectionConfig } from 'payload'
import { authenticated, nobody } from '@/payload/access'

/**
 * Quote requests. Created only through the server-side /enquiry route — never
 * writable over the public REST or GraphQL API.
 *
 * Everything the customer submitted is read-only in the admin. A quote request
 * is a record of what someone actually said, and silently correcting a typo in
 * their phone number is how a lead gets lost. Only the fields the shop owns —
 * status and internal notes — can be edited.
 */
export const Leads: CollectionConfig = {
  slug: 'leads',
  labels: { singular: 'Quote request', plural: 'Quote requests' },
  admin: {
    components: {
      edit: {
        beforeDocumentControls: ['@/components/admin/CancelButton#CancelButton'],
      },
    },
    useAsTitle: 'name',
    group: 'Enquiries',
    defaultColumns: ['name', 'phone', 'product', 'status', 'createdAt'],
    description: 'Everyone who asked for a quote. Work down the list and update the status.',
  },
  access: {
    read: authenticated,
    create: nobody,
    update: authenticated,
    delete: authenticated,
  },
  timestamps: true,
  fields: [
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      required: true,
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Quoted', value: 'quoted' },
        { label: 'Won', value: 'won' },
        { label: 'Lost', value: 'lost' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, admin: { width: '50%', readOnly: true } },
        { name: 'phone', type: 'text', required: true, admin: { width: '50%', readOnly: true } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'email', type: 'email', admin: { width: '50%', readOnly: true } },
        { name: 'organisation', type: 'text', admin: { width: '50%', readOnly: true } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'city', type: 'text', admin: { width: '50%', readOnly: true } },
        { name: 'quantity', type: 'number', min: 1, admin: { width: '50%', readOnly: true } },
      ],
    },
    { name: 'product', type: 'relationship', relationTo: 'products', admin: { readOnly: true } },
    { name: 'message', type: 'textarea', admin: { readOnly: true } },
    {
      name: 'internalNotes',
      type: 'textarea',
      admin: { description: 'Only ever visible here. The customer never sees this.' },
    },
    {
      type: 'collapsible',
      label: 'Submission record',
      admin: { initCollapsed: true },
      fields: [
        { name: 'consent', type: 'checkbox', admin: { readOnly: true } },
        { name: 'sourcePage', type: 'text', admin: { readOnly: true } },
      ],
    },
  ],
}
