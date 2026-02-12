import React from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import EspaceClientNav from './EspaceClientNav'

export const dynamic = 'force-dynamic'

export default async function EspaceClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/connexion')

  return (
    <div className="flex w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <EspaceClientNav user={user} />
      <div className="flex-1 min-w-0 pl-0 lg:pl-8">
        {children}
      </div>
    </div>
  )
}
