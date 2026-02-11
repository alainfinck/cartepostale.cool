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
    ],
}
