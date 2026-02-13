import React, { Suspense } from 'react'
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
        url: '/images/demo/photo-1507525428034-b723cf961d3e.jpg',
        width: 1200,
        height: 630,
        alt: 'Créer ma carte postale',
      },
    ],
  },
}

function EditorFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" aria-hidden>
      <span className="text-muted-foreground">Chargement du studio…</span>
    </div>
  )
}

export default function EditorPage() {
  return (
    <Suspense fallback={<EditorFallback />}>
      <EditorClient />
    </Suspense>
  )
}
