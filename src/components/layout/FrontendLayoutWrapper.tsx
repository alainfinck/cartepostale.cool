'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ScrollToTopButton } from '@/components/ui/scroll-to-top'
import { ExitIntentPopup } from '@/components/ExitIntentPopup'
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration'

/**
 * Routes that use their own shell (no main Navbar/Footer):
 * - /manager*, /espace-agence: admin/agency back-office
 * - /agences/[code]: page agence marque blanche (menu = header agence uniquement)
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
  const isPostcardView =
    pathname?.startsWith('/carte/') ||
    pathname?.startsWith('/carte2/') ||
    pathname?.startsWith('/view-scroll/')
  const isAgencyPage =
    pathname?.startsWith('/agences/') && pathname !== '/agences/demo'

  // Template marque blanche agence : pas de Navbar/Footer site principal, menu = header agence
  if (isAgencyPage) {
    return (
      <>
        <ServiceWorkerRegistration />
        <main className="flex-grow">{children}</main>
        <ScrollToTopButton />
      </>
    )
  }

  // Back-office : pas de Navbar/Footer
  if (isManager || isEspaceAgence) {
    return (
      <>
        <ServiceWorkerRegistration />
        <main className="flex-grow">{children}</main>
        <ScrollToTopButton />
      </>
    )
  }

  const searchParams = useSearchParams()
  const isEditorWhiteLabel =
    pathname === '/editor' && Boolean(searchParams?.get('agencyCode'))
  const showExitIntent =
    !isEspaceClient &&
    !isPostcardView &&
    !isEditorWhiteLabel &&
    !isAgencyPage &&
    exitIntentEnabled

  const hideNavAndFooter = isPostcardView || isDashboard || isEditorWhiteLabel

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
