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
      name: 'hash',
      type: 'text',
      hidden: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'salt',
      type: 'text',
      hidden: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'resetPasswordToken',
      type: 'text',
      hidden: true,
    },
    {
      name: 'resetPasswordExpiration',
      type: 'date',
      hidden: true,
    },
    {
      name: 'loginAttempts',
      type: 'number',
      hidden: true,
      defaultValue: 0,
    },
    {
      name: 'lockUntil',
      type: 'date',
      hidden: true,
    },
    // Champs requis par authjs / NextAuth
    {
      name: 'emailVerified',
      type: 'date',
    },
    {
      name: 'image',
      type: 'text',
    },
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
        description: 'Agence liée au compte (pour rôle Agence ou Client).',
        condition: (data) => data?.role === 'agence' || data?.role === 'client',
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
    {
      name: 'sessions',
      type: 'array',
      label: 'Sessions',
      fields: [
        {
          name: 'id',
          type: 'text',
          required: true,
        },
        {
          name: 'createdAt',
          type: 'date',
          required: true,
        },
        {
          name: 'expiresAt',
          type: 'date',
          required: true,
        },
        {
          name: 'userAgent',
          type: 'text',
        },
        {
          name: 'ip',
          type: 'text',
        },
      ],
      admin: {
        readOnly: true,
        condition: (data) => Boolean(data?.sessions),
      },
    },
  ],
}
