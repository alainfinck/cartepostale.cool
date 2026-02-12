import React from 'react'
import { Metadata } from 'next'
import EditorClient from './EditorClient'

export const metadata: Metadata = {
  title: 'Créer ma Carte Postale - Studio de Création en Ligne',
  description: 'Personnalisez votre carte postale : ajoutez votre photo, rédigez votre message avec une écriture manuscrite et signez. Envoi simple et rapide.',
  openGraph: {
    title: 'Créer ma Carte Postale - Studio de Création en Ligne | CartePostale.cool',
    description: 'Personnalisez votre carte postale : ajoutez votre photo, rédigez votre message avec une écriture manuscrite et signez.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'Créer ma carte postale',
      },
    ],
  },
}

export default function EditorPage() {
  return <EditorClient />
}
