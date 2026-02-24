import { Metadata } from 'next'
import { getAgencyPostcards } from '@/actions/agence-actions'
import DevClient from '@/app/(frontend)/espace-client/dev/DevClient'

export const metadata: Metadata = {
  title: 'Espace Dev (Agence)',
  description: 'Outils développeurs pour les cartes postales de votre agence',
}

export const dynamic = 'force-dynamic'

export default async function EspaceAgenceDevPage() {
  const initialData = await getAgencyPostcards()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">
          Espace Développeur (Agence)
        </h1>
        <p className="text-stone-500">
          Récupérez le code d&apos;intégration (iframe) pour afficher de manière élégante les cartes
          postales de votre agence sur vos propres sites ou applications.
        </p>
      </div>

      <DevClient postcards={initialData.docs} />
    </div>
  )
}
