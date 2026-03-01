import type { CollectionConfig } from 'payload'

export const Agencies: CollectionConfig = {
  slug: 'agencies',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'code',
      type: 'text',
      unique: true,
    },
    {
      name: 'address',
      type: 'text',
    },
    {
      name: 'city',
      type: 'text',
    },
    {
      name: 'region',
      type: 'text',
    },
    {
      name: 'country',
      type: 'text',
      defaultValue: 'France',
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'email',
      type: 'text',
    },
    {
      name: 'website',
      type: 'text',
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'primaryColor',
      type: 'text',
    },
    {
      name: 'imageBank',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'qrCodeUrl',
      type: 'text',
    },
    // --- Bannière promotionnelle ---
    {
      name: 'bannerEnabled',
      type: 'checkbox',
      label: 'Bannière active sur les cartes',
      defaultValue: false,
    },
    {
      name: 'bannerText',
      type: 'text',
      label: 'Texte principal de la bannière',
    },
    {
      name: 'bannerSubtext',
      type: 'text',
      label: 'Sous-texte / accroche',
    },
    {
      name: 'bannerColor',
      type: 'text',
      label: 'Couleur de fond (hex)',
      defaultValue: '#0d9488',
    },
    {
      name: 'bannerTextColor',
      type: 'text',
      label: 'Couleur du texte (hex)',
      defaultValue: '#ffffff',
    },
    {
      name: 'bannerLink',
      type: 'text',
      label: 'Lien (URL) de la bannière',
    },
    {
      name: 'bannerImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Image de fond (optionnelle)',
    },
  ],
}
