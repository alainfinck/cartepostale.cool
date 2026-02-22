/**
 * API proxy pour la recherche d'images Pixabay.
 * Images gratuites et libres de droits (CC0).
 *
 * Configuration : variable d'environnement PIXABAY_API_KEY
 * Obtenir une clé gratuite : https://pixabay.com/api/docs/
 */

import { NextRequest, NextResponse } from 'next/server'

const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY?.trim()

export interface PixabayImage {
  id: number
  webformatURL: string
  previewURL: string
  largeImageURL?: string
  user: string
  tags: string
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') || 'nature'
  const perPage = Math.min(parseInt(searchParams.get('per_page') || '20', 10), 50)

  if (!PIXABAY_API_KEY) {
    return NextResponse.json(
      {
        hits: [],
        total: 0,
        message:
          "PIXABAY_API_KEY non configurée. Ajoutez-la dans vos variables d'environnement.",
      },
      { status: 200 },
    )
  }

  try {
    const url = new URL('https://pixabay.com/api/')
    url.searchParams.set('key', PIXABAY_API_KEY)
    url.searchParams.set('q', q)
    url.searchParams.set('per_page', String(perPage))
    url.searchParams.set('image_type', 'photo')
    url.searchParams.set('safesearch', 'true')

    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
      next: { revalidate: 300 },
    })

    if (!res.ok) {
      throw new Error(`Pixabay API error: ${res.status}`)
    }

    const data = await res.json()
    const hits = (data.hits || []).map((hit: any) => ({
      id: hit.id,
      webformatURL: hit.webformatURL || hit.largeImageURL,
      previewURL: hit.previewURL || hit.webformatURL,
      largeImageURL: hit.largeImageURL || hit.webformatURL,
      user: hit.user || 'Pixabay',
      tags: hit.tags || '',
    }))

    return NextResponse.json({ hits, total: data.totalHits || 0 })
  } catch (err) {
    console.error('[pixabay-images] Error:', err)
    return NextResponse.json(
      { hits: [], total: 0, message: 'Erreur lors de la recherche' },
      { status: 200 },
    )
  }
}
