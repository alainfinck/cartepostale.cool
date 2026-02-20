import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

export const GalleryTag: CollectionConfig = {
  slug: 'gallery-tags',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    slugField({ fieldToUse: 'name' }),
    {
      name: 'agency',
      type: 'relationship',
      relationTo: 'agencies',
      admin: {
        description: 'Agence propriétaire de ce tag (laisser vide pour les tags globaux)',
      },
    },
  ],
}
