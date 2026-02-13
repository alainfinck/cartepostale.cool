import { Metadata } from 'next'
import { getMyPostcards } from '@/actions/espace-client-actions'
import ManagerClient from '@/app/(frontend)/manager/ManagerClient'

export const metadata: Metadata = {
  title: 'Mes cartes',
  description: 'Gérez vos cartes postales',
}

export const dynamic = 'force-dynamic'

export default async function EspaceClientCartesPage() {
  const initialData = await getMyPostcards()
  return <ManagerClient initialData={initialData} useEspaceClientActions /> 
}
