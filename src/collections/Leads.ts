import type { CollectionConfig } from 'payload'

export const Leads: CollectionConfig = {
    slug: 'leads',
    admin: {
        useAsTitle: 'email',
        defaultColumns: ['email', 'code', 'isUsed', 'createdAt'],
    },
    access: {
        read: ({ req: { user } }) => {
            if (user?.role === 'admin' || user?.role === 'agence') return true
            return false
        },
        create: () => true, // Anyone can submit their email
        update: ({ req: { user } }) => {
            if (user?.role === 'admin' || user?.role === 'agence') return true
            return false
        },
        delete: ({ req: { user } }) => user?.role === 'admin',
    },
    fields: [
        {
            name: 'email',
            type: 'email',
            required: true,
            unique: true,
            index: true,
        },
        {
            name: 'code',
            type: 'text',
            required: true,
            unique: true,
            index: true,
            admin: {
                description: 'Code de remise unique généré pour ce lead',
            },
        },
        {
            name: 'isUsed',
            type: 'checkbox',
            defaultValue: false,
        },
        {
            name: 'usedAt',
            type: 'date',
        },
        {
            name: 'source',
            type: 'text',
            defaultValue: 'exit-intent',
        },
        {
            name: 'usedByPostcard',
            type: 'relationship',
            relationTo: 'postcards',
            admin: {
                description: 'La carte postale qui a utilisé ce code',
            },
        },
    ],
    timestamps: true,
}
