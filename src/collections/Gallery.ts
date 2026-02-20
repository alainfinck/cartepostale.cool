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
        description: "Ordre d'affichage (plus petit = en premier)",
      },
    },
    {
      name: 'agency',
      type: 'relationship',
      relationTo: 'agencies',
      admin: {
        description: 'Agence propriétaire de cette image (laisser vide pour les images globales)',
      },
    },
    {
      name: 'views',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'usages',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Nombre de fois où cette image a été utilisée sur une carte postale',
        readOnly: true,
      },
    },
  ],
}
