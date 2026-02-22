import React from 'react'
import { Metadata } from 'next'
import BusinessClient from './BusinessClient'

export const metadata: Metadata = {
    title: 'Marque blanche - Agences & Pro | Cartes postales à votre image',
    description: 'Solution marque blanche pour agences et professionnels : diffusez votre image de marque sur des cartes postales, centralisez les données clients, envois personnalisés à votre nom.',
    openGraph: {
        title: 'Marque blanche - Agences & Pro | CartePostale.cool',
        description: 'Diffusez votre marque sur chaque carte postale. Données clients, CRM, envois sous votre nom pour agences et professionnels.',
        images: [
            {
                url: 'https://img.cartepostale.cool/demo/photo-1486406146926-c627a92ad1ab.jpg',
                width: 1200,
                height: 630,
                alt: 'CartePostale.cool Business',
            },
        ],
    },
}

export default function BusinessPage() {
    return <BusinessClient />
}
