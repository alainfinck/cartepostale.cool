import React from 'react'
import './styles.css'
import { FrontendLayoutWrapper } from '@/components/layout/FrontendLayoutWrapper'

export const metadata = {
  metadataBase: new URL('https://cartepostale.cool'),
  title: {
    default: 'cartepostale.cool - Partagez vos souvenirs en cartes postales virtuelles',
    template: '%s | cartepostale.cool'
  },
  description: 'Proposez une expérience unique à vos proches avec des cartes postales virtuelles personnalisées. Instantané, social et mémorable.',
  keywords: ['carte postale virtuelle', 'voyage', 'photos', 'souvenir numérique', 'partage social', 'application mobile'],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://cartepostale.cool',
    siteName: 'cartepostale.cool',
    title: 'cartepostale.cool - Partagez vos souvenirs en cartes postales virtuelles',
    description: 'Transformez vos plus belles photos en cartes postales virtuelles. Partagez vos souvenirs instantanément avec vos proches.',
    images: [
      {
        url: '/media/enveloppe-social2.jpg', // Use the new envelope social share image
        width: 1200,
        height: 630,
        alt: 'cartepostale.cool - Vos souvenirs, partout, tout de suite',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'cartepostale.cool - Cartes postales virtuelles',
    description: 'Créez et partagez des cartes postales virtuelles personnalisées de vos voyages.',
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
