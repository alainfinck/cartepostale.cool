import React from 'react'
import { Metadata } from 'next'
import GalerieClient from './GalerieClient'

export const metadata: Metadata = {
    title: 'Galerie & Inspiration - Les Plus Belles Cartes',
    description: 'Découvrez comment nos utilisateurs partagent leurs souvenirs de voyage. Galerie de cartes postales, témoignages et idées créatives.',
    openGraph: {
        title: 'Galerie & Inspiration - Les Plus Belles Cartes | CartePostale.cool',
        description: 'Découvrez comment nos utilisateurs partagent leurs souvenirs de voyage.',
        images: [
            {
                url: '/images/demo/photo-1488646953014-85cb44e25828.jpg',
                width: 1200,
                height: 630,
                alt: 'Galerie CartePostale.cool',
            },
        ],
    },
}

export default function GaleriePage() {
    return <GalerieClient />
}
