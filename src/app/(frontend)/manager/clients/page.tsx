import { getAllUsers } from '@/actions/manager-actions'
import { ManagerClientsClient } from './ManagerClientsClient'

export const dynamic = 'force-dynamic'

export default async function ManagerClientsPage() {
  const initialData = await getAllUsers({ limit: 50 })

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
