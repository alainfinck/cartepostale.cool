import { Suspense } from 'react'
import { getAllUsers } from '@/actions/manager-actions'
import { ManagerClientsLayout } from './ManagerClientsLayout'

export const dynamic = 'force-dynamic'

export default async function ManagerClientsPage() {
  const initialData = await getAllUsers({ limit: 50 })

  return (
    <div className="space-y-6">
      <Suspense fallback={<div className="flex items-center gap-2 text-muted-foreground p-4">Chargement…</div>}>
        <ManagerClientsLayout initialData={initialData} />
      </Suspense>
    </div>
  )
}
