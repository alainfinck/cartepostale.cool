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
export function FrontendLayoutWrapper({
  children,
  exitIntentEnabled = true,
}: {
  children: React.ReactNode
  exitIntentEnabled?: boolean
}) {
  const pathname = usePathname()
  const isManager = pathname?.startsWith('/manager')
  const isEspaceAgence = pathname?.startsWith('/espace-agence')
  const isDashboard = pathname?.startsWith('/dashboard')
  const isEspaceClient = pathname?.startsWith('/espace-client')
  const isPostcardView = pathname?.startsWith('/carte/')

  // On /manager and /espace-agence we don't show the public Navbar/Footer
  if (isManager || isEspaceAgence) {
    return (
      <>
        <ServiceWorkerRegistration />
        <main className="flex-grow">{children}</main>
        <ScrollToTopButton />
      </>
    )
  }

  const showExitIntent = !isEspaceClient && !isPostcardView && exitIntentEnabled

  const hideNavAndFooter = isPostcardView || isDashboard

  return (
    <>
      <ServiceWorkerRegistration />
      {!hideNavAndFooter && <Navbar />}
      <main className="flex-grow">{children}</main>
      {!hideNavAndFooter && <Footer />}
      <ScrollToTopButton />
      {showExitIntent && <ExitIntentPopup />}
    </>
  )
}
