import type { CollectionConfig } from 'payload'

export const Reactions: CollectionConfig = {
    slug: 'reactions',
    admin: {
        useAsTitle: 'emoji',
    },
    access: {
        read: () => true,
        create: () => true,
        update: () => false,
        delete: () => false,
    },
    fields: [
        {
            name: 'postcard',
            type: 'relationship',
            relationTo: 'postcards',
            required: true,
            index: true,
        },
        {
            name: 'emoji',
            type: 'text',
            required: true,
        },
        {
            name: 'sessionId',
            type: 'text',
            required: true,
            index: true,
        },
    ],
}
