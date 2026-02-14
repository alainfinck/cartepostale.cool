import { Suspense } from 'react'
import { getAllLeads } from '@/actions/leads-actions'
import { ManagerCodesPromoClient } from './ManagerCodesPromoClient'

export const dynamic = 'force-dynamic'

export default async function ManagerCodesPromoPage() {
  const result = await getAllLeads()

  return (
    <div className="space-y-6">
      <Suspense fallback={<div className="flex items-center gap-2 text-muted-foreground p-4">Chargement…</div>}>
        <ManagerCodesPromoClient initialData={result} />
      </Suspense>
    </div>
  )
}
