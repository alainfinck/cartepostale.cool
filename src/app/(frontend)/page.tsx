import React from 'react'
import { Metadata } from 'next'
import HomeClient from './HomeClient'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.cartepostale.cool'
const ogImageUrl = `${siteUrl}/media/image1-cartepostale.cool.jpeg`

export const metadata: Metadata = {
    title: 'Partagez vos souvenirs en cartes postales virtuelles',
    description: 'Transformez vos plus belles photos en cartes postales virtuelles personnalisées. Envoyez un souvenir unique instantanément par SMS, WhatsApp ou email.',
    openGraph: {
        title: 'Partagez vos souvenirs en cartes postales virtuelles | CartePostale.cool',
        description: 'Créez des cartes postales virtuelles inoubliables avec vos propres photos et vidéos. Partage instantané, souvenirs éternels.',
        images: [
            {
                url: ogImageUrl,
                width: 1200,
                height: 630,
                alt: 'CartePostale.cool - Vos plus beaux souvenirs en un clic',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        images: [ogImageUrl],
    },
}

export default function Page() {
    return <HomeClient />
}
