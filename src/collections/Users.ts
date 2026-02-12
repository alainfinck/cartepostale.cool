import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    create: () => true, // Inscription publique autorisée
    read: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user?.role === 'admin'),
  },
  hooks: {
    beforeChange: [
      ({ data, req, operation }) => {
        // À la création, forcer le rôle 'user' si l'utilisateur n'est pas admin (éviter inscription en admin)
        if (operation === 'create' && data && req.user?.role !== 'admin') {
          data.role = 'user'
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Client', value: 'client' },
        { label: 'User', value: 'user' },
      ],
      defaultValue: 'user',
      required: true,
    },
    {
      name: 'company',
      type: 'text',
    },
    {
      name: 'cardsCreated',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'plan',
      type: 'select',
      options: [
        { label: 'Free', value: 'free' },
        { label: 'Pro', value: 'pro' },
        { label: 'Enterprise', value: 'enterprise' },
      ],
      defaultValue: 'free',
    },
  ],
}
