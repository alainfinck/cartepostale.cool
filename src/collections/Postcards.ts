import type { CollectionConfig } from 'payload'

export const Postcards: CollectionConfig = {
    slug: 'postcards',
    admin: {
        useAsTitle: 'senderName',
    },
    fields: [
        {
            name: 'frontImage',
            type: 'upload',
            relationTo: 'media',
            required: true,
        },
        {
            name: 'message',
            type: 'textarea',
            required: true,
        },
        {
            name: 'recipientName',
            type: 'text',
            required: true,
        },
        {
            name: 'senderName',
            type: 'text',
            required: true,
        },
        {
            name: 'location',
            type: 'text',
            required: true,
        },
        {
            name: 'coords',
            type: 'group',
            fields: [
                {
                    name: 'lat',
                    type: 'number',
                },
                {
                    name: 'lng',
                    type: 'number',
                },
            ],
        },
        {
            name: 'stampStyle',
            type: 'select',
            options: [
                { label: 'Classic', value: 'classic' },
                { label: 'Modern', value: 'modern' },
                { label: 'Airmail', value: 'airmail' },
            ],
            defaultValue: 'classic',
        },
        {
            name: 'date',
            type: 'date',
            required: true,
        },
        {
            name: 'status',
            type: 'select',
            options: [
                { label: 'Published', value: 'published' },
                { label: 'Draft', value: 'draft' },
                { label: 'Archived', value: 'archived' },
            ],
            defaultValue: 'draft',
        },
        {
            name: 'views',
            type: 'number',
            defaultValue: 0,
        },
        {
            name: 'shares',
            type: 'number',
            defaultValue: 0,
        },
        {
            name: 'mediaItems',
            type: 'array',
            fields: [
                {
                    name: 'media',
                    type: 'upload',
                    relationTo: 'media',
                },
                {
                    name: 'type',
                    type: 'select',
                    options: [
                        { label: 'Image', value: 'image' },
                        { label: 'Video', value: 'video' },
                    ],
                    defaultValue: 'image',
                }
            ],
        },
        {
            name: 'isPremium',
            type: 'checkbox',
            defaultValue: false,
        },
        {
            name: 'agency',
            type: 'relationship',
            relationTo: 'agencies',
        },
        {
            name: 'brandLogo',
            type: 'upload',
            relationTo: 'media',
        },
    ],
}
