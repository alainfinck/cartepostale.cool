import type { CollectionConfig } from 'payload'

export const Stickers: CollectionConfig = {
    slug: 'stickers',
    admin: {
        useAsTitle: 'name',
        defaultColumns: ['name', 'image', 'createdAt'],
    },
    access: {
        read: () => true, // Stickers are publicly readable for the editor
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true,
        },
        {
            name: 'image',
            type: 'upload',
            relationTo: 'media',
            required: true,
        },
        {
            name: 'category',
            type: 'select',
            options: [
                { label: 'Déco', value: 'deco' },
                { label: 'Voyage', value: 'travel' },
                { label: 'Amour', value: 'love' },
                { label: 'Fun', value: 'fun' },
                { label: 'Vintage', value: 'vintage' },
            ],
            defaultValue: 'deco',
        },
    ],
}
