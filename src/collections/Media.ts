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
    {
      name: 'location',
      type: 'text',
      admin: {
        description: 'Localisation de la photo (géocodage inversé depuis les données GPS EXIF)',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Utilisateur ayant téléchargé ce média (pour sa galerie personnelle)',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        if (!data) return data
        // Determine the prefix/folder based on referer
        let referer = ''
        if (req && typeof req.headers?.get === 'function') {
          referer = req.headers.get('referer') || ''
        } else if (req && req.headers && typeof req.headers === 'object') {
          referer = (req.headers as any).referer || ''
        }

        if (!data.prefix || data.prefix === '') {
          if (referer.includes('/admin/collections/gallery')) {
            data.prefix = 'gallery'
          } else if (
            referer.includes('/admin/collections/posts') ||
            referer.includes('/admin/collections/agencies') ||
            referer.includes('/admin/collections/stickers') ||
            referer.includes('/admin/collections/email-templates')
          ) {
            data.prefix = 'site'
          } else {
            // Default folder for general medias uploaded in Admin
            data.prefix = 'site'
          }
        }
        return data
      },
    ],
  },
  upload: {
    staticDir: 'public/media',
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
    // Allow creating media doc with only filename (e.g. after direct upload to R2 via presigned URL)
    filesRequiredOnCreate: false,
  },
}
