import type { CollectionConfig } from 'payload'

export const Feedback: CollectionConfig = {
  slug: 'feedback',
  admin: {
    useAsTitle: 'message',
    defaultColumns: ['rating', 'message', 'pageUrl', 'createdAt'],
    group: 'Admin',
  },
  access: {
    read: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      return false
    },
    create: () => true, // Anyone can submit feedback
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'rating',
      type: 'number',
      min: 1,
      max: 5,
      admin: {
        description: 'Note de 1 à 5',
      },
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      admin: {
        description: 'Email de contact (facultatif)',
      },
    },
    {
      name: 'pageUrl',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'Nouveau', value: 'new' },
        { label: 'Lu', value: 'read' },
        { label: 'Traité', value: 'processed' },
      ],
    },
  ],
  timestamps: true,
}
