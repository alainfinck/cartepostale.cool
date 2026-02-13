import type { CollectionConfig } from 'payload'

export const Gallery: CollectionConfig = {
  slug: 'gallery',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      filterOptions: {
        mimeType: { contains: 'image' },
      },
    },
    {
      name: 'caption',
      type: 'textarea',
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'gallery-categories',
      hasMany: false,
      admin: {
        description: 'Catégorie de la photo',
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'gallery-tags',
      hasMany: true,
      admin: {
        description: 'Tags pour filtrer et rechercher',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Ordre d\'affichage (plus petit = en premier)',
      },
    },
  ],
}
