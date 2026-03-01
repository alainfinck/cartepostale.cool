import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Agency, Gallery, GalleryCategory } from '@/payload-types'

export interface AgencyGalleryItemPublic {
  id: string
  title: string
  imageUrl: string
  caption: string | null
  categoryId: number | null
  categoryName: string | null
}

export interface AgencyGalleryCategoryPublic {
  id: number
  name: string
  slug: string
}

/** GET: public gallery for agency by code. Query: category (id), search (string). Returns items + categories. */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Code agence manquant' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('category')
    const search = searchParams.get('search')?.trim() ?? ''

    const payload = await getPayload({ config })

    const agencyResult = await payload.find({
      collection: 'agencies',
      where: { code: { equals: code } },
      limit: 1,
      depth: 0,
    })
    const agency = (agencyResult.docs[0] as Agency) || null
    if (!agency) {
      return NextResponse.json({ error: 'Agence introuvable' }, { status: 404 })
    }

    const agencyId = agency.id

    const galleryWhere: { and: Array<Record<string, unknown>> } = {
      and: [{ agency: { equals: agencyId } }],
    }
    if (categoryId && categoryId !== 'all') {
      const cid = parseInt(categoryId, 10)
      if (!Number.isNaN(cid)) galleryWhere.and.push({ category: { equals: cid } })
    }
    if (search.length > 0) {
      galleryWhere.and.push({
        or: [
          { title: { contains: search } },
          { caption: { contains: search } },
        ],
      })
    }

    const [galleryResult, categoriesResult] = await Promise.all([
      payload.find({
        collection: 'gallery',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        where: galleryWhere as any,
        depth: 2,
        limit: 300,
        sort: 'order',
      }),
      payload.find({
        collection: 'gallery-categories',
        where: {
          or: [
            { agency: { equals: agencyId } },
            { agency: { exists: false } },
          ],
        },
        depth: 0,
        limit: 100,
      }),
    ])

    const items: AgencyGalleryItemPublic[] = (galleryResult.docs as Gallery[]).map((doc) => {
      const img = doc.image
      let imageUrl = ''
      if (typeof img === 'object' && img !== null && 'url' in img) {
        imageUrl = (img as { url?: string | null }).url ?? ''
      }
      if (!imageUrl && typeof img === 'object' && img !== null && 'filename' in img) {
        const fn = (img as { filename?: string | null }).filename
        if (fn) imageUrl = `/media/${encodeURIComponent(fn)}`
      }
      const cat = doc.category
      const categoryIdOut =
        typeof cat === 'object' && cat !== null && 'id' in cat ? (cat as GalleryCategory).id : null
      const categoryNameOut =
        typeof cat === 'object' && cat !== null && 'name' in cat
          ? (cat as GalleryCategory).name ?? null
          : null
      return {
        id: String(doc.id),
        title: doc.title,
        imageUrl,
        caption: doc.caption ?? null,
        categoryId: categoryIdOut,
        categoryName: categoryNameOut,
      }
    })

    const categories: AgencyGalleryCategoryPublic[] = (
      categoriesResult.docs as GalleryCategory[]
    ).map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug ?? String(c.id),
    }))

    return NextResponse.json({ items, categories })
  } catch (e) {
    console.error('GET /api/public/agency/[code]/gallery:', e)
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la galerie de l'agence" },
      { status: 500 },
    )
  }
}
