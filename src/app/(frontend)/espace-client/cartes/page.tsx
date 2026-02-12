import { Metadata } from 'next'
import { getAllPostcards } from '@/actions/manager-actions'
import ManagerClient from '@/app/(frontend)/manager/ManagerClient'

export const metadata: Metadata = {
  title: 'Mes cartes',
  description: 'Gérez vos cartes postales',
}

export const dynamic = 'force-dynamic'

export default async function EspaceClientCartesPage() {
  const result = await getAllPostcards()
  return <ManagerClient initialData={result} />
}
