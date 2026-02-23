import { Metadata } from 'next'
import { getCurrentUser } from '@/lib/auth'
import { getMyPostcards } from '@/actions/espace-client-actions'
import ManagerClient from '@/app/(frontend)/manager/ManagerClient'

export const metadata: Metadata = {
  title: 'Mes cartes',
  description: 'Gérez vos cartes postales',
}

export const dynamic = 'force-dynamic'

export default async function EspaceClientCartesPage() {
  const [user, initialData] = await Promise.all([getCurrentUser(), getMyPostcards()])
  return (
    <ManagerClient
      initialData={initialData}
      useEspaceClientActions
      initialCredits={user?.credits ?? 0}
      userId={user?.id}
      userEmail={user?.email ?? null}
    />
  )
}
