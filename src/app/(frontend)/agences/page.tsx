import React from 'react'
import { Metadata } from 'next'
import AgencesLandingClient from './AgencesLandingClient'

export const metadata: Metadata = {
  title: 'Agences & Pro - Marque blanche | Cartes postales à votre image',
  description:
    "Solution marque blanche pour agences : diffusez votre image sur des cartes postales, photothèque dédiée, tarifs agences, statistiques et campagnes pour vos clients.",
  openGraph: {
    title: 'Agences & Pro - Marque blanche | CartePostale.cool',
    description:
      'Cartes postales en marque blanche pour agences. Tarifs dédiés, photothèque, analytics et marketing pour vos clients.',
    images: [
      {
        url: 'https://img.cartepostale.cool/demo/photo-1486406146926-c627a92ad1ab.jpg',
        width: 1200,
        height: 630,
        alt: 'CartePostale.cool Agences',
      },
    ],
  },
}

export default function AgencesLandingPage() {
  return <AgencesLandingClient />
}
