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
        // À la création, forcer le rôle 'user' si l'utilisateur n'est pas admin (éviter inscription en admin/agence)
        if (operation === 'create' && data && req.user?.role !== 'admin') {
          data.role = 'user'
        }
        // En modification, empêcher l'auto-attribution du rôle admin ou agence
        if (operation === 'update' && data && req.user?.role !== 'admin') {
          if (data.role === 'admin' || data.role === 'agence') {
            data.role = req.user?.role ?? 'user'
          }
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
        { label: 'Agence', value: 'agence' },
        { label: 'Client', value: 'client' },
        { label: 'User', value: 'user' },
      ],
      defaultValue: 'user',
      required: true,
    },
    {
      name: 'agency',
      type: 'relationship',
      relationTo: 'agencies',
      admin: {
        condition: (data) => data?.role === 'agence',
      },
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
    {
      name: 'magicLinkToken',
      type: 'text',
      hidden: true,
    },
    {
      name: 'magicLinkExpires',
      type: 'date',
      hidden: true,
    },
  ],
}
