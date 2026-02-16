import { Metadata } from 'next'
import Script from 'next/script'
import './globals.css' // Changed from styles.css as per provided code edit
import { FrontendLayoutWrapper } from '@/components/layout/FrontendLayoutWrapper' // Kept this import as it's not explicitly removed by the provided snippet, but the layout component itself changes.

// The siteUrl constant is removed as per the provided code edit.

export const metadata: Metadata = {
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
        url: '/media/enveloppe-social2.jpg', // Use the new envelope social share image
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
  // PWA Configuration
  manifest: '/manifest.json',
  themeColor: '#14b8a6',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false, // Disable zoom for better mobile UX
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CartePostale',
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
      {/* Service Worker Registration */}
      <Script id="sw-register" strategy="afterInteractive">
        {`
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js').then(
                (registration) => {
                  console.log('SW registered:', registration);
                },
                (err) => {
                  console.log('SW registration failed:', err);
                }
              );
            });
          }
        `}
      </Script>
      {/* The original div and FrontendLayoutWrapper are replaced by the new structure */}
      <div className="flex flex-col min-h-screen bg-[#faf8f5] font-sans antialiased">
        <FrontendLayoutWrapper>{children}</FrontendLayoutWrapper>
      </div>
    </>
  )
}
