import type { CollectionConfig } from 'payload'

export const Comments: CollectionConfig = {
    slug: 'comments',
    admin: {
        useAsTitle: 'authorName',
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
            name: 'authorName',
            type: 'text',
            required: true,
            maxLength: 50,
        },
        {
            name: 'content',
            type: 'textarea',
            required: true,
            maxLength: 500,
        },
        {
            name: 'sessionId',
            type: 'text',
            required: true,
        },
    ],
}
