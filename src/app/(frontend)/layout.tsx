import { Metadata, Viewport } from 'next'

import './styles.css'
import { FrontendLayoutWrapper } from '@/components/layout/FrontendLayoutWrapper'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#14b8a6',
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'),
  title: {
    default: 'CartePostale.cool - Cartes postales numériques',
    template: '%s | CartePostale.cool',
  },
  description:
    'Créez et envoyez des cartes postales numériques personnalisées. Ajoutez vos photos, messages et partagez avec vos proches en un instant.',
  keywords: [
    'carte postale',
    'digital',
    'cartes virtuelles',
    'vacances',
    'voyage',
    'partage',
    'photos',
  ],
  authors: [{ name: 'CartePostale.cool' }],
  creator: 'CartePostale.cool',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://cartepostale.cool',
    siteName: 'CartePostale.cool',
    title: 'CartePostale.cool - Cartes postales numériques',
    description: 'Créez et envoyez des cartes postales numériques personnalisées.',
    images: [
      {
        url: '/media/enveloppe-social2.jpg',
        width: 1200,
        height: 630,
        alt: 'CartePostale.cool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CartePostale.cool',
    description: 'Créez et envoyez des cartes postales numériques personnalisées.',
    images: ['/media/enveloppe-social2.jpg'],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CartePostale.cool',
  },
  icons: {
    icon: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' }],
  },
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex flex-col min-h-screen bg-[#faf8f5] font-sans antialiased">
        <FrontendLayoutWrapper>{children}</FrontendLayoutWrapper>
        <InstallPrompt />
      </div>
    </>
  )
}
