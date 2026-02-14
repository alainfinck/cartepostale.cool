import { Suspense } from 'react'
import { getAllUsers, getAllAgencies } from '@/actions/manager-actions'
import { ManagerClientsLayout } from './ManagerClientsLayout'

export const dynamic = 'force-dynamic'

export default async function ManagerClientsPage() {
  const [initialData, agenciesResult] = await Promise.all([
    getAllUsers({ limit: 50 }),
    getAllAgencies({ limit: 200 }),
  ])

  return (
    <div className="space-y-6">
      <Suspense fallback={<div className="flex items-center gap-2 text-muted-foreground p-4">Chargement…</div>}>
        <ManagerClientsLayout initialData={initialData} agencies={agenciesResult.docs} />
      </Suspense>
    </div>
  )
}
