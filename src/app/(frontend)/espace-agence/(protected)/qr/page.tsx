import { Metadata } from 'next'
import { getAgencyInfo, getAgencyPostcards } from '@/actions/agence-actions'
import QrIntegrationClient from './QrIntegrationClient'

export const metadata: Metadata = {
  title: 'QR code & intégration',
  description: 'Gérez votre QR code et les codes d\'intégration pour votre site',
}

export const dynamic = 'force-dynamic'

export default async function QrIntegrationPage() {
  const [agency, postcardsData] = await Promise.all([
    getAgencyInfo(),
    getAgencyPostcards(),
  ])
  const postcards = postcardsData?.docs ?? []

  return (
    <QrIntegrationClient
      agencyCode={agency?.code ?? null}
      agencyName={agency?.name ?? 'Mon agence'}
      postcards={postcards}
    />
  )
}
