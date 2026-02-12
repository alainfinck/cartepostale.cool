import React from 'react'
import './styles.css'
import { FrontendLayoutWrapper } from '@/components/layout/FrontendLayoutWrapper'

export const metadata = {
  metadataBase: new URL('https://cartepostale.cool'),
  title: {
    default: 'CartePostale.cool - Envoyez de vraies cartes depuis votre téléphone',
    template: '%s | CartePostale.cool'
  },
  description: 'Transformez vos photos numériques en véritables cartes postales papier. Imprimées et expédiées en 24h partout dans le monde.',
  keywords: ['carte postale', 'voyage', 'photos', 'souvenir', 'impression photo', 'application mobile'],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://cartepostale.cool',
    siteName: 'CartePostale.cool',
    title: 'CartePostale.cool - Envoyez de vraies cartes depuis votre téléphone',
    description: 'Transformez vos photos numériques en véritables cartes postales papier. Imprimées et expédiées en 24h partout dans le monde.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200&auto=format&fit=crop', // Default beautiful travel photo
        width: 1200,
        height: 630,
        alt: 'CartePostale.cool - Vos souvenirs en vrai',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CartePostale.cool - Envoyez de vraies cartes',
    description: 'Transformez vos photos numériques en véritables cartes postales papier.',
    images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200&auto=format&fit=crop'],
  },
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="fr">
      <body className="flex flex-col min-h-screen bg-[#fdfbf7] font-sans">
        <FrontendLayoutWrapper>{children}</FrontendLayoutWrapper>
      </body>
    </html>
  )
}
