import React from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import EspaceClientNav from './EspaceClientNav'

export const dynamic = 'force-dynamic'

export default async function EspaceClientLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect('/connexion')

  return (
    <div className="flex flex-col lg:flex-row w-full max-w-7xl mx-auto lg:px-6 lg:py-8">
      <EspaceClientNav user={user} />
      <div className="flex-1 min-w-0 px-4 sm:px-6 py-6 lg:pl-8 lg:pr-0 lg:py-0">{children}</div>
    </div>
  )
}
