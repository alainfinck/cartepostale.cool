import React from 'react'
import { Metadata } from 'next'
import HomeClient from './HomeClient'

export const metadata: Metadata = {
    title: 'Envoyez de vraies cartes depuis votre téléphone', // Combines with template to become "Envoyez... | CartePostale.cool"
    description: 'Transformez vos photos numériques en véritables cartes postales papier. Imprimées et expédiées en 24h partout dans le monde. Créez votre souvenir maintenant !',
    openGraph: {
        title: 'Envoyez de vraies cartes depuis votre téléphone | CartePostale.cool',
        description: 'Transformez vos photos numériques en véritables cartes postales papier. Imprimées et expédiées en 24h partout dans le monde.',
        images: [
            {
                url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
                width: 1200,
                height: 630,
                alt: 'CartePostale.cool - Envoyez un coin de paradis',
            },
        ],
    },
}

export default function Page() {
    return <HomeClient />
}
