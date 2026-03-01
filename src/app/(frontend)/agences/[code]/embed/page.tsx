import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Agency } from '@/payload-types'
import AgenceEmbedWidget from './AgenceEmbedWidget'

interface PageProps {
  params: Promise<{ code: string }>
}

async function getAgencyByCode(code: string): Promise<Agency | null> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'agencies',
      where: { code: { equals: code } },
      limit: 1,
      depth: 0,
    })
    return (result.docs[0] as Agency) || null
  } catch {
    return null
  }
}

export default async function AgenceEmbedPage({ params }: PageProps) {
  const { code } = await params
  const agency = await getAgencyByCode(code)
  if (!agency) notFound()

  const primaryColor = agency.primaryColor || '#0d9488'
  const name = agency.name || 'notre agence'

  return (
    <AgenceEmbedWidget
      code={code}
      agencyName={name}
      primaryColor={primaryColor}
    />
  )
}
