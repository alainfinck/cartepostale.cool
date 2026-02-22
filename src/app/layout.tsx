import React, { Suspense } from 'react'
import Script from 'next/script'
import { FacebookPixel } from '@/components/FacebookPixel'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <Script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="a094f013-b700-48cd-85c3-5110fe81f558"
        />
      </head>
      {/* suppressHydrationWarning: Cursor IDE preview can inject data-cursor-element-id into the DOM, causing hydration mismatch. Test in a normal browser to confirm the app is fine. */}
      <body suppressHydrationWarning>
        {children}
        {/* Meta Facebook Pixel — tracking sur toutes les pages */}
        <Suspense fallback={null}>
          <FacebookPixel />
        </Suspense>
      </body>
    </html>
  )
}
