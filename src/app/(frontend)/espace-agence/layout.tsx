import React from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { AgenceShell } from './AgenceShell'

export const dynamic = 'force-dynamic'

export default async function EspaceAgenceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/connexion')
  if (user.role !== 'agence') redirect('/')

  return <AgenceShell agencyId={user.agency ?? null}>{children}</AgenceShell>
}
