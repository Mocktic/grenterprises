import type { CollectionConfig } from 'payload'
import { authenticated, isAdminUser } from '@/payload/access'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    group: 'Settings',
    defaultColumns: ['name', 'email', 'updatedAt'],
  },
  access: {
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
    admin: isAdminUser,
  },
  fields: [{ name: 'name', type: 'text', required: true }],
}
