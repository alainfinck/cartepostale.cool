import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

export const GalleryCategory: CollectionConfig = {
  slug: 'gallery-categories',
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
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'gallery-categories',
      hasMany: false,
      admin: {
        description: 'Catégorie parente (laisser vide pour une catégorie de premier niveau)',
      },
    },
    {
      name: 'agency',
      type: 'relationship',
      relationTo: 'agencies',
      admin: {
        description:
          'Agence propriétaire de cette catégorie (laisser vide pour les catégories globales)',
      },
    },
  ],
}
