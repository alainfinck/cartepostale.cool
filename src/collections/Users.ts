import type { CollectionConfig } from 'payload'
import { sendEmail, generateWelcomeEmail } from '@/lib/email-service'

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
    afterChange: [
      async ({ doc, operation }) => {
        if (operation === 'create' && doc.email) {
          try {
            await sendEmail({
              to: doc.email,
              subject: 'Bienvenue sur CartePostale.cool ! 💌',
              html: generateWelcomeEmail(doc.name || doc.email.split('@')[0]),
            })
          } catch (error) {
            console.error('Erreur lors de l’envoi de l’email de bienvenue:', error)
          }
        }
      },
    ],
    beforeChange: [
      ({ data, req, operation }) => {
        const isAdmin = req.user?.role === 'admin'
        // Si ce n'est pas un admin qui fait la modif
        if (!isAdmin) {
          // À l'inscription publique (create), on force toujours le rôle 'user'
          if (operation === 'create') {
            if (data) data.role = 'user'
          }
          // En modification (update), si l'utilisateur est connecté (donc via API/UI),
          // on l'empêche de s'auto-attribuer un rôle sensible.
          // Si pas de req.user, on considère que c'est une opération système/script (Local API).
          if (operation === 'update' && req.user && data) {
            if (data.role === 'admin' || data.role === 'agence') {
              data.role = req.user.role ?? 'user'
            }
          }
        }
        return data
      },
    ],
  },
  fields: [
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
      name: 'credits',
      type: 'number',
      defaultValue: 0,
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
