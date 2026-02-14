'use client'

import { ManagerClientsClient } from './ManagerClientsClient'
import type { UsersResult } from '@/actions/manager-actions'

export function ManagerClientsLayout({ initialData }: { initialData: UsersResult }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Clients</h1>
        <p className="text-muted-foreground">Liste des utilisateurs inscrits.</p>
      </div>
      <ManagerClientsClient initialData={initialData} />
    </div>
  )
}
