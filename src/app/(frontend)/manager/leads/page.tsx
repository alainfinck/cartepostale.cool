import { Suspense } from 'react'
import { getAllLeads } from '@/actions/leads-actions'
import { ManagerLeadsClient } from './ManagerLeadsClient'

export const dynamic = 'force-dynamic'

export default async function ManagerLeadsPage() {
    const result = await getAllLeads()
    
    return (
        <div className="space-y-6">
            <Suspense fallback={<div className="flex items-center gap-2 text-muted-foreground p-4">Chargement…</div>}>
                <ManagerLeadsClient initialData={result} />
            </Suspense>
        </div>
    )
}
