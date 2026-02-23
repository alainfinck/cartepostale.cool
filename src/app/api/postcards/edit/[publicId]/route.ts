import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getCurrentUser } from '@/lib/auth'

/** GET: return postcard by publicId for editing (current user must be author) */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ publicId: string }> },
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
    }

    const { publicId } = await params
    if (!publicId) {
      return NextResponse.json({ error: 'publicId manquant' }, { status: 400 })
    }

    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'postcards',
      where: {
        and: [
          { publicId: { equals: publicId } },
          { author: { equals: user.id } },
        ],
      },
      depth: 2,
      limit: 1,
    })

    if (result.totalDocs === 0) {
      return NextResponse.json({ error: 'Carte non trouvée' }, { status: 404 })
    }

    const postcard = result.docs[0]
    return NextResponse.json(postcard)
  } catch (err) {
    console.error('[API] postcards/edit/[publicId]:', err)
    return NextResponse.json(
      { error: 'Erreur lors du chargement de la carte' },
      { status: 500 },
    )
  }
}
