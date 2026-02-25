import crypto from 'node:crypto'
import type { CollectionConfig } from 'payload'
import { revalidateTag, revalidatePath } from 'next/cache'

export const Postcards: CollectionConfig = {
  slug: 'postcards',
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        if (operation === 'create' && data && !data.contributionToken) {
          data.contributionToken = crypto.randomBytes(16).toString('hex')
        }
        return data
      },
    ],
    afterChange: [
      ({ doc }) => {
        const publicId = doc?.publicId
        if (publicId) {
          revalidateTag(`postcard-${publicId}`)
          revalidatePath(`/carte/${publicId}`)
        }
      },
    ],
  },
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
      required: false,
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
        description: 'Texte court affich\u00e9 sur la face avant',
      },
    },
    {
      name: 'frontEmoji',
      type: 'text',
      admin: {
        description: 'Emoji affich\u00e9 pr\u00e8s du texte de la face avant',
      },
    },
    {
      name: 'frontCaptionPosition',
      type: 'group',
      admin: {
        description: 'Position du bloc caption+emoji sur la face (x, y en % 0-100, centre du bloc)',
      },
      fields: [
        { name: 'x', type: 'number', defaultValue: 50 },
        { name: 'y', type: 'number', defaultValue: 85 },
      ],
    },
    {
      name: 'frontCaptionFontFamily',
      type: 'select',
      admin: { description: 'Police du texte accroche' },
      options: [
        { label: 'Serif', value: 'serif' },
        { label: 'Sans-serif', value: 'sans' },
        { label: 'Script / Cursive', value: 'cursive' },
        { label: 'Display', value: 'display' },
      ],
    },
    {
      name: 'frontCaptionFontSize',
      type: 'number',
      admin: { description: 'Taille du texte accroche (px)' },
      min: 12,
      max: 28,
    },
    {
      name: 'frontCaptionColor',
      type: 'select',
      admin: { description: 'Couleur du texte accroche' },
      options: [
        { label: 'Gris foncé', value: 'stone-900' },
        { label: 'Blanc', value: 'white' },
        { label: 'Noir', value: 'black' },
        { label: 'Teal', value: 'teal-800' },
        { label: 'Gris', value: 'stone-700' },
        { label: 'Ambre', value: 'amber-900' },
        { label: 'Rose', value: 'rose-900' },
        { label: 'Émeraude', value: 'emerald-900' },
      ],
    },
    {
      name: 'frontTextBgOpacity',
      type: 'number',
      admin: { description: 'Opacité du fond du bloc texte (0-100)' },
      min: 0,
      max: 100,
    },
    {
      name: 'frontCaptionPreset',
      type: 'text',
      admin: { description: 'Preset de style du texte accroche (ex: classic, elegant, bd…)' },
    },
    {
      name: 'frontCaptionWidth',
      type: 'number',
      admin: { description: 'Largeur du bloc caption en % de la carte (ex: 70)' },
      min: 20,
      max: 95,
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
      name: 'recipientName',
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
      required: false,
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
      name: 'eventType',
      type: 'select',
      admin: {
        description: "Type d'événement : adapte le thème visuel de la page de réception",
        position: 'sidebar',
      },
      options: [
        { label: 'Anniversaire', value: 'birthday' },
        { label: 'Vacances', value: 'vacation' },
        { label: 'Invitation', value: 'invitation' },
        { label: 'Naissance', value: 'birth' },
        { label: 'Noël', value: 'christmas' },
        { label: 'Mariage', value: 'wedding' },
        { label: 'Diplôme', value: 'graduation' },
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
        },
        {
          name: 'note',
          type: 'textarea',
          admin: {
            description: 'Note ou l\u00e9gende pour cette photo/vid\u00e9o',
          },
        },
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
        description: 'Liste des autocollants plac\u00e9s sur la carte (ID, x, y, scale, rotation)',
      },
    },
    {
      name: 'allowComments',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Autoriser les commentaires sur cette carte',
      },
    },
    {
      name: 'isPublic',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Si d\u00e9coch\u00e9, la carte sera priv\u00e9e et non list\u00e9e',
      },
    },
    {
      name: 'contributionToken',
      type: 'text',
      index: true,
      admin: {
        readOnly: true,
        description: 'Token secret pour permettre \u00e0 des tiers d\u2019ajouter des photos',
      },
    },
    {
      name: 'isContributionEnabled',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Autoriser l\u2019ajout de photos via le lien de contribution',
      },
    },
    {
      name: 'scratchCardEnabled',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Activer l\u2019effet carte \u00e0 gratter : le destinataire doit gratter l\u2019image pour r\u00e9v\u00e9ler le message ou la photo.',
      },
    },
    {
      name: 'scratchCardImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Image de couverture \u00e0 gratter (si vide, un visuel par d\u00e9faut sera utilis\u00e9).',
        condition: (data) => data.scratchCardEnabled === true,
      },
    },
    {
      name: 'puzzleCardEnabled',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Activer l\u2019effet puzzle : le destinataire doit reconstituer l\u2019image avant de lire le message.',
      },
    },
    {
      name: 'puzzleCardDifficulty',
      type: 'select',
      options: [
        { label: 'Facile (3\u00d73)', value: '3' },
        { label: 'Moyen (4\u00d74)', value: '4' },
        { label: 'Difficile (5\u00d75)', value: '5' },
      ],
      defaultValue: '3',
      admin: {
        description: 'Nombre de pi\u00e8ces du puzzle (lignes \u00d7 colonnes).',
        condition: (data) => data.puzzleCardEnabled === true,
      },
    },
    {
      name: 'audioMessage',
      type: 'text',
      admin: {
        description: 'Clé S3 ou URL du message audio enregistré',
      },
    },
    {
      name: 'audioDuration',
      type: 'number',
      admin: {
        description: 'Durée du message audio en secondes',
      },
    },
    {
      name: 'backgroundMusic',
      type: 'text',
      admin: {
        description: "URL de la musique d'ambiance (bibliothèque Freesound ou fichier uploadé)",
      },
    },
    {
      name: 'backgroundMusicTitle',
      type: 'text',
      admin: {
        description: "Titre de la musique d'ambiance pour affichage",
      },
    },
    {
      name: 'hideMap',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Masquer la carte géographique au verso de la carte',
      },
    },
  ],
}
