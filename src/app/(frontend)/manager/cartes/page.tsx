import { getAllPostcards } from '@/actions/manager-actions'
import ManagerClient from '../ManagerClient'

export const dynamic = 'force-dynamic'

export default async function ManagerCartesPage() {
  const initialData = await getAllPostcards({ limit: 50 })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Cartes postales</h1>
        <p className="text-muted-foreground">Gérer et filtrer toutes les cartes.</p>
      </div>
      <ManagerClient initialData={initialData} />
    </div>
  )
}
