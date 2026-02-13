import React from 'react'
import './styles.css'
import { FrontendLayoutWrapper } from '@/components/layout/FrontendLayoutWrapper'

export const metadata = {
  metadataBase: new URL('https://cartepostale.cool'),
  title: {
    default: 'cartepostale.cool - Envoyez de vraies cartes depuis votre téléphone',
    template: '%s | cartepostale.cool'
  },
  description: 'Transformez vos photos numériques en véritables cartes postales papier. Imprimées et expédiées en 24h partout dans le monde.',
  keywords: ['carte postale', 'voyage', 'photos', 'souvenir', 'impression photo', 'application mobile'],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://cartepostale.cool',
    siteName: 'cartepostale.cool',
    title: 'cartepostale.cool - Envoyez de vraies cartes depuis votre téléphone',
    description: 'Transformez vos photos numériques en véritables cartes postales papier. Imprimées et expédiées en 24h partout dans le monde.',
    images: [
      {
        url: '/media/enveloppe-social2.jpg', // Use the new envelope social share image
        width: 1200,
        height: 630,
        alt: 'cartepostale.cool - Vos souvenirs en vrai',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'cartepostale.cool - Envoyez de vraies cartes',
    description: 'Transformez vos photos numériques en véritables cartes postales papier.',
    images: ['/media/enveloppe-social2.jpg'],
  },
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="fr">
      <body className="flex flex-col min-h-screen bg-[#faf8f5] font-sans antialiased">
        <FrontendLayoutWrapper>{children}</FrontendLayoutWrapper>
      </body>
    </html>
  )
}
