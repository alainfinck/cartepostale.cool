import type { CollectionConfig } from 'payload'

export const Postcards: CollectionConfig = {
    slug: 'postcards',
    admin: {
        useAsTitle: 'senderName',
    },
    fields: [
        {
            name: 'publicId',
            type: 'text',
            required: true,
            unique: true,
            index: true,
            admin: {
                position: 'sidebar',
                readOnly: true,
            },
        },
        {
            name: 'frontImage',
            type: 'upload',
            relationTo: 'media',
            required: false, // Can use frontImageURL instead
        },
        {
            name: 'frontImageURL',
            type: 'text',
            admin: {
                description: 'URL for template images',
            },
        },
        {
            name: 'frontCaption',
            type: 'text',
            admin: {
                description: 'Texte court affiché sur la face avant',
            },
        },
        {
            name: 'frontEmoji',
            type: 'text',
            admin: {
                description: 'Emoji affiché près du texte de la face avant',
            },
        },
        {
            name: 'message',
            type: 'textarea',
            required: true,
        },
        {
            name: 'recipients',
            type: 'array',
            fields: [
                {
                    name: 'email',
                    type: 'email',
                },
                {
                    name: 'phone',
                    type: 'text',
                },
                {
                    name: 'name',
                    type: 'text',
                },
            ],
        },
        {
            name: 'recipientName', // Primary/First recipient name for display
            type: 'text',
            required: false,
        },
        {
            name: 'senderName',
            type: 'text',
            required: false,
        },
        {
            name: 'senderEmail',
            type: 'email',
            required: false, // Optional for now, but we'll collect it
        },
        {
            name: 'location',
            type: 'text',
            required: false,
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
            name: 'stampLabel',
            type: 'text',
        },
        {
            name: 'stampYear',
            type: 'text',
        },
        {
            name: 'postmarkText',
            type: 'text',
            required: false,
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
        {
            name: 'author',
            type: 'relationship',
            relationTo: 'users',
            admin: {
                position: 'sidebar',
            },
        },
        {
            name: 'stickers',
            type: 'json',
            admin: {
                description: 'Liste des autocollants placés sur la carte (ID, x, y, scale, rotation)',
            },
        },
    ],
}
