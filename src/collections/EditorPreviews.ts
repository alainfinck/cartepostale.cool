import type { CollectionConfig } from 'payload'

/**
 * Stockage temporaire des aperçus "Voir comme le destinataire" (éditeur).
 * TTL 5 min ; partagé en base pour que toutes les instances (serverless) voient les données.
 */
export const EditorPreviews: CollectionConfig = {
  slug: 'editor-previews',
  admin: {
    hidden: true,
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => false,
  },
  fields: [
    {
      name: 'token',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { hidden: true },
    },
    {
      name: 'data',
      type: 'json',
      required: true,
      admin: { hidden: true },
    },
    {
      name: 'expiresAt',
      type: 'date',
      required: true,
      admin: { hidden: true },
    },
  ],
}
