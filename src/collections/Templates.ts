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
                { label: 'Plage', value: 'beach' },
                { label: 'Ville', value: 'city' },
                { label: 'Nature', value: 'nature' },
                { label: 'Voyage', value: 'travel' },
                { label: 'Romantique', value: 'romantic' },
                { label: 'Fêtes', value: 'festive' },
                { label: 'Gastronomie', value: 'food' },
                { label: 'Abstrait', value: 'abstract' },
            ],
            required: true,
        },
    ],
}
