'use client'

import { ManagerClientsClient } from './ManagerClientsClient'
import ManagerStickers from '../ManagerStickers'
import type { UsersResult } from '@/actions/manager-actions'

export function ManagerClientsLayout({ initialData }: { initialData: UsersResult }) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <aside className="lg:w-80 shrink-0">
        <div className="sticky top-6 max-h-[85vh] pr-1 space-y-6 overflow-y-auto">
          <ManagerStickers />
        </div>
      </aside>

      <main className="flex-1 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Clients</h1>
          <p className="text-muted-foreground">Liste des utilisateurs inscrits.</p>
        </div>
        <ManagerClientsClient initialData={initialData} />
      </main>
    </div>
  )
}
