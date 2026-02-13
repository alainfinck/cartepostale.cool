import type { CollectionConfig } from 'payload'
import crypto from 'node:crypto'

function generateToken(): string {
    return crypto.randomBytes(9).toString('base64url').slice(0, 12)
}

export const PostcardTrackingLinks: CollectionConfig = {
    slug: 'postcard-tracking-links',
    admin: {
        useAsTitle: 'token',
        defaultColumns: ['token', 'postcard', 'recipientFirstName', 'recipientLastName', 'views', 'createdAt'],
    },
    access: {
        read: ({ req: { user } }) => {
            if (!user) return false
            if (user.role === 'admin') return true
            return { author: { equals: user.id } }
        },
        create: ({ req: { user } }) => Boolean(user),
        update: ({ req: { user } }) => {
            if (!user) return false
            if (user.role === 'admin') return true
            return { author: { equals: user.id } }
        },
        delete: ({ req: { user } }) => {
            if (!user) return false
            if (user.role === 'admin') return true
            return { author: { equals: user.id } }
        },
    },
    hooks: {
        beforeValidate: [
            ({ data, operation }) => {
                if (operation === 'create' && data && !data.token) {
                    data.token = generateToken()
                }
                return data
            },
        ],
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
            name: 'token',
            type: 'text',
            required: true,
            unique: true,
            index: true,
            admin: {
                readOnly: true,
                description: 'Identifiant court pour l’URL /v/[token]',
            },
        },
        {
            name: 'recipientFirstName',
            type: 'text',
        },
        {
            name: 'recipientLastName',
            type: 'text',
        },
        {
            name: 'description',
            type: 'textarea',
        },
        {
            name: 'sentVia',
            type: 'select',
            options: [
                { label: 'Lien (copié)', value: 'link' },
                { label: 'Email', value: 'email' },
                { label: 'WhatsApp', value: 'whatsapp' },
                { label: 'SMS', value: 'sms' },
            ],
        },
        {
            name: 'sentAt',
            type: 'date',
            admin: {
                description: 'Date d’envoi (email / WhatsApp / SMS)',
            },
        },
        {
            name: 'views',
            type: 'number',
            defaultValue: 0,
        },
        {
            name: 'author',
            type: 'relationship',
            relationTo: 'users',
            required: true,
            admin: {
                position: 'sidebar',
            },
        },
    ],
}
