'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ScrollToTopButton } from '@/components/ui/scroll-to-top'

/**
 * On /manager* routes we don't show the public Navbar/Footer (admin has its own shell).
 */
export function FrontendLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isManager = pathname?.startsWith('/manager')

  if (isManager) {
    return <>{children}</>
  }

  return (
    <>
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
      <ScrollToTopButton />
    </>
  )
}
