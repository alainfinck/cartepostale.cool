import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Agency, Media } from '@/payload-types'
import AgencePublicClient from './AgencePublicClient'

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
      depth: 1,
    })
    return (result.docs[0] as Agency) || null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params
  const agency = await getAgencyByCode(code)
  if (!agency) return { title: 'Agence introuvable' }

  const logoUrl =
    typeof agency.logo === 'object' && agency.logo
      ? (agency.logo as { url?: string | null }).url
      : null

  return {
    title: `${agency.name} — Cartes postales`,
    description: `Créez et envoyez une carte postale ${agency.name}. Partagez vos souvenirs avec vos proches.`,
    openGraph: {
      title: `${agency.name} — Cartes postales`,
      description: `Créez une carte postale brandée ${agency.name}.`,
      images: logoUrl ? [{ url: logoUrl }] : [],
    },
  }
}

export default async function AgencePublicPage({ params }: PageProps) {
  const { code } = await params
  const agency = await getAgencyByCode(code)
  if (!agency) notFound()

  const logoUrl =
    typeof agency.logo === 'object' && agency.logo
      ? ((agency.logo as { url?: string | null }).url ?? null)
      : null

  const bannerImageUrl =
    typeof (agency as any).bannerImage === 'object' && (agency as any).bannerImage
      ? (((agency as any).bannerImage as { url?: string | null }).url ?? null)
      : null

  const agencyData = {
    id: agency.id,
    code: agency.code || code,
    name: agency.name,
    logoUrl,
    primaryColor: agency.primaryColor || '#0d9488',
    website: agency.website || null,
    phone: agency.phone || null,
    email: agency.email || null,
    city: agency.city || null,
    address: agency.address || null,
    bannerEnabled: Boolean((agency as any).bannerEnabled),
    bannerText: (agency as any).bannerText || null,
    bannerSubtext: (agency as any).bannerSubtext || null,
    bannerColor: (agency as any).bannerColor || '#0d9488',
    bannerTextColor: (agency as any).bannerTextColor || '#ffffff',
    bannerLink: (agency as any).bannerLink || null,
    bannerImageUrl,
  }

  return <AgencePublicClient agency={agencyData} />
}
