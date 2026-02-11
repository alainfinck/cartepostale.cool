import type { CollectionConfig } from 'payload'

export const Templates: CollectionConfig = {
    slug: 'templates',
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
            name: 'imageUrl',
            type: 'upload',
            relationTo: 'media',
            required: true,
        },
        {
            name: 'category',
            type: 'select',
            options: [
                { label: 'Beach', value: 'beach' },
                { label: 'City', value: 'city' },
                { label: 'Mountain', value: 'mountain' },
                { label: 'Abstract', value: 'abstract' },
            ],
            required: true,
        },
    ],
}
