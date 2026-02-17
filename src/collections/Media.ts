import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'exif',
      type: 'group',
      fields: [
        {
          name: 'gps',
          type: 'group',
          fields: [
            {
              name: 'latitude',
              type: 'number',
              admin: {
                description: "Latitude GPS extraite de l'image",
              },
            },
            {
              name: 'longitude',
              type: 'number',
              admin: {
                description: "Longitude GPS extraite de l'image",
              },
            },
          ],
        },
        {
          name: 'dateTime',
          type: 'date',
          admin: {
            description: 'Date et heure de la prise de vue (EXIF)',
          },
        },
        {
          name: 'cameraMake',
          type: 'text',
          admin: {
            description: "Fabricant de l'appareil photo",
          },
        },
        {
          name: 'cameraModel',
          type: 'text',
          admin: {
            description: "Modèle de l'appareil photo",
          },
        },
      ],
    },
  ],
  upload: {
    staticDir: 'public/media',
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
    // Allow creating media doc with only filename (e.g. after direct upload to R2 via presigned URL)
    filesRequiredOnCreate: false,
  },
}
