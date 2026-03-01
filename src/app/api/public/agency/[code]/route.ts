import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Agency } from '@/payload-types'

/** GET: return public agency data by code (name, logoUrl) for editor white-label. No auth. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Code agence manquant' }, { status: 400 })
    }

    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'agencies',
      where: { code: { equals: code } },
      limit: 1,
      depth: 1,
    })
    const agency = (result.docs[0] as Agency) || null

    if (!agency) {
      return NextResponse.json({ error: 'Agence introuvable' }, { status: 404 })
    }

    const logoUrl =
      typeof agency.logo === 'object' && agency.logo
        ? ((agency.logo as { url?: string | null }).url ?? null)
        : null

    return NextResponse.json({
      id: agency.id,
      code: agency.code ?? code,
      name: agency.name,
      logoUrl,
    })
  } catch (e) {
    console.error('GET /api/public/agency/[code]:', e)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'agence' },
      { status: 500 },
    )
  }
}
