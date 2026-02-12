import React from 'react'
import { Metadata } from 'next'
import BusinessClient from './BusinessClient'

export const metadata: Metadata = {
    title: 'Solutions Entreprises - Marketing Direct Impactant',
    description: 'Boostez votre engagement client avec des campagnes de cartes postales automatisées. API, intégration CRM et envoi en masse pour agents immobiliers, e-commerce et agences.',
    openGraph: {
        title: 'Solutions Entreprises - Marketing Direct Impactant | CartePostale.cool',
        description: 'Boostez votre engagement client avec des campagnes de cartes postales automatisées. API, intégration CRM et envoi en masse.',
        images: [
            {
                url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
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
