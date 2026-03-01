import { Metadata } from 'next'
import { getAgencyPostcards } from '@/actions/agence-actions'
import AgenceCartesClient from './AgenceCartesClient'

export const metadata: Metadata = {
  title: "Cartes de l'agence",
  description: 'Gérez et créez des cartes postales démo pour votre agence',
}

export const dynamic = 'force-dynamic'

export default async function EspaceAgenceCartesPage() {
  const initialData = await getAgencyPostcards()
  return <AgenceCartesClient initialData={initialData} />
}
