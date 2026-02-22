import React from 'react'
import { Metadata } from 'next'
import AgenceDemoClient from './AgenceDemoClient'

export const metadata: Metadata = {
  title: 'Démo Agence – Voyages Lumière | Cartes postales en marque blanche',
  description:
    'Découvrez comment Voyages Lumière utilise CartePostale.cool pour offrir à ses clients la création de cartes postales avec leurs images de destination. Démo interactive pour les agences de voyage, hôtels et offices du tourisme.',
  openGraph: {
    title: 'Démo Agence – Voyages Lumière | CartePostale.cool',
    description:
      "Exemple concret de marque blanche : une agence de voyage avec sa galerie d'images, son logo, et ses clients qui créent des cartes postales personnalisées.",
    images: [
      {
        url: 'https://img.cartepostale.cool/demo/photo-1486406146926-c627a92ad1ab.jpg',
        width: 1200,
        height: 630,
        alt: 'Démo Agence Voyages Lumière – CartePostale.cool',
      },
    ],
  },
}

export default function AgenceDemoPage() {
  return <AgenceDemoClient />
}
