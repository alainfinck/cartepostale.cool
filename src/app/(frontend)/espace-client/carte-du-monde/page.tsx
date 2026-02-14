import { Metadata } from 'next'
import { getMyPostcards } from '@/actions/espace-client-actions'
import WorldMapClient from './WorldMapClient'

export const metadata: Metadata = {
  title: 'Carte du monde',
  description: 'Visualisez toutes vos cartes postales sur la carte du monde.',
}

export const dynamic = 'force-dynamic'

export default async function EspaceClientWorldMapPage() {
  const initialData = await getMyPostcards({ limit: 500 })
  return <WorldMapClient initialData={initialData} />
}
