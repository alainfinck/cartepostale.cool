import type { CollectionConfig } from 'payload'

export const EmailTemplates: CollectionConfig = {
  slug: 'email-templates',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nom du modèle',
    },
    {
      name: 'subject',
      type: 'text',
      required: true,
      label: 'Sujet du mail',
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
      label: 'Corps du mail',
    },
    {
      name: 'targetRole',
      type: 'select',
      label: 'Cible par défaut',
      options: [
        { label: 'Tous', value: 'all' },
        { label: 'Clients', value: 'client' },
        { label: 'Agences', value: 'agence' },
      ],
      defaultValue: 'all',
    },
  ],
}
