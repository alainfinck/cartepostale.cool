import type { CollectionConfig } from 'payload'

export const PostcardViewEvents: CollectionConfig = {
    slug: 'postcard-view-events',
    admin: {
        useAsTitle: 'openedAt',
        defaultColumns: ['postcard', 'openedAt', 'country', 'browser', 'durationSeconds'],
    },
    access: {
        read: ({ req: { user } }) => Boolean(user?.role === 'admin'),
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
            name: 'openedAt',
            type: 'date',
            required: true,
            admin: {
                description: 'Heure d\'ouverture de la carte',
            },
        },
        {
            name: 'closedAt',
            type: 'date',
            admin: {
                description: 'Heure de fermeture (si enregistrée)',
            },
        },
        {
            name: 'durationSeconds',
            type: 'number',
            admin: {
                description: 'Temps de vue en secondes',
            },
        },
        {
            name: 'userAgent',
            type: 'text',
            admin: {
                description: 'User-Agent du navigateur',
            },
        },
        {
            name: 'browser',
            type: 'text',
            admin: {
                description: 'Navigateur (parsé)',
            },
        },
        {
            name: 'os',
            type: 'text',
            admin: {
                description: 'Système d\'exploitation (parsé)',
            },
        },
        {
            name: 'referrer',
            type: 'text',
            admin: {
                description: 'Referrer de la page',
            },
        },
        {
            name: 'country',
            type: 'text',
            admin: {
                description: 'Pays (depuis headers ou geo)',
            },
        },
        {
            name: 'countryCode',
            type: 'text',
            admin: {
                description: 'Code pays (ex. FR)',
            },
        },
        {
            name: 'region',
            type: 'text',
            admin: {
                description: 'Région',
            },
        },
        {
            name: 'city',
            type: 'text',
            admin: {
                description: 'Ville',
            },
        },
        {
            name: 'sessionId',
            type: 'text',
            required: true,
            index: true,
            admin: {
                description: 'ID de session visiteur (déduplication)',
            },
        },
    ],
}
