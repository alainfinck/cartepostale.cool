import { Metadata } from 'next'
import { getMyPostcards, updateMyPostcard, updateMyPostcardStatus, deleteMyPostcard } from '@/actions/espace-client-actions'
import ManagerClient, { type ManagerClientActions } from '@/app/(frontend)/manager/ManagerClient'

export const metadata: Metadata = {
  title: 'Mes cartes',
  description: 'Gérez vos cartes postales',
}

export const dynamic = 'force-dynamic'

async function buildClientActions(): Promise<ManagerClientActions> {
  return {
    fetchPostcards: async (filters) => {
      const status = filters?.status !== 'all' ? filters?.status : undefined
      return getMyPostcards({ status, search: filters?.search })
    },
    updatePostcard: updateMyPostcard,
    updatePostcardStatus: updateMyPostcardStatus,
    deletePostcard: deleteMyPostcard,
  }
}

export default async function EspaceClientCartesPage() {
  const [initialData, actions] = await Promise.all([
    getMyPostcards(),
    buildClientActions(),
  ])
  return <ManagerClient initialData={initialData} actions={actions} />
}
