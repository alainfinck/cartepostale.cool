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
    ],
}
