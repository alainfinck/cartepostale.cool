import { Metadata } from 'next'
import { getCurrentUser } from '@/lib/auth'
import { getMyPostcards } from '@/actions/espace-client-actions'
import DevClient from './DevClient'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Espace Dev',
  description: 'Outils développeurs pour vos cartes postales',
}

export const dynamic = 'force-dynamic'

export default async function EspaceClientDevPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/connexion')
  }

  const initialData = await getMyPostcards()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">Espace Développeur</h1>
        <p className="text-stone-500">
          Récupérez le code d&apos;intégration (iframe) pour afficher de manière élégante vos cartes
          postales sur votre propre site ou application.
        </p>
      </div>

      <DevClient postcards={initialData.docs} />
    </div>
  )
}
