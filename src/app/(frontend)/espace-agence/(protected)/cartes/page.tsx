import { Metadata } from 'next'
import { getAgencyPostcards } from '@/actions/agence-actions'
import ManagerClient from '@/app/(frontend)/manager/ManagerClient'

export const metadata: Metadata = {
  title: 'Cartes de l\'agence',
  description: 'Gérez les cartes postales de votre agence',
}

export const dynamic = 'force-dynamic'

export default async function EspaceAgenceCartesPage() {
  const initialData = await getAgencyPostcards()
  return <ManagerClient initialData={initialData} useAgenceActions />
}
