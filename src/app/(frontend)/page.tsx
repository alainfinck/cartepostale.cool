import React from 'react'
import { Metadata } from 'next'
import HomeClient from './HomeClient'

export const metadata: Metadata = {
    title: 'Partagez vos souvenirs en cartes postales virtuelles',
    description: 'Transformez vos plus belles photos en cartes postales virtuelles personnalisées. Envoyez un souvenir unique instantanément par SMS, WhatsApp ou email.',
    openGraph: {
        title: 'Partagez vos souvenirs en cartes postales virtuelles | CartePostale.cool',
        description: 'Créez des cartes postales virtuelles inoubliables avec vos propres photos et vidéos. Partage instantané, souvenirs éternels.',
        images: [
            {
                url: '/media/image1-cartepostale.cool.jpeg',
                width: 1200,
                height: 630,
                alt: 'CartePostale.cool - Vos plus beaux souvenirs en un clic',
            },
        ],
    },
}

export default function Page() {
    return <HomeClient />
}
