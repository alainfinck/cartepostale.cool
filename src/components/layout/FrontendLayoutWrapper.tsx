'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ScrollToTopButton } from '@/components/ui/scroll-to-top'
import { ExitIntentPopup } from '@/components/ExitIntentPopup'
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration'

/**
 * On /manager* routes we don't show the public Navbar/Footer (admin has its own shell).
 */
export function FrontendLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isManager = pathname?.startsWith('/manager')
  const isEspaceClient = pathname?.startsWith('/espace-client')

  if (isManager) {
    return <>{children}</>
  }

  const showExitIntent = !isEspaceClient

  return (
    <>
      <ServiceWorkerRegistration />
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
      <ScrollToTopButton />
      {showExitIntent && <ExitIntentPopup />}
    </>
  )
}
