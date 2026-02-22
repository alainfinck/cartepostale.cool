/**
 * API proxy pour la bibliothèque de musique Pixabay.
 * Pixabay propose des milliers de titres gratuits et libres de droits (CC0).
 *
 * Configuration : variable d'environnement PIXABAY_API_KEY
 * Obtenir une clé gratuite : https://pixabay.com/api/docs/
 *
 * Si la clé n'est pas configurée ou est payante, la route retourne une liste vide.
 */

import { NextRequest, NextResponse } from 'next/server'

const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY?.trim()

export interface PixabayMusicTrack {
  id: number
  title: string
  url: string
  duration: number
  artist: string
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') || 'ambient'
  const perPage = Math.min(parseInt(searchParams.get('per_page') || '20', 10), 50)

  if (!PIXABAY_API_KEY) {
    return NextResponse.json(
      {
        tracks: [],
        message:
          'PIXABAY_API_KEY non configurée. Ajoutez-la dans vos variables d\'environnement pour activer la bibliothèque de musique. Clé gratuite sur pixabay.com/api/docs/',
      },
      { status: 200 },
    )
  }

  try {
    // Pixabay Music API - endpoint documenté sur pixabay.com/api/docs/
    const url = new URL('https://pixabay.com/api/music/')
    url.searchParams.set('key', PIXABAY_API_KEY)
    url.searchParams.set('q', q)
    url.searchParams.set('per_page', String(perPage))

    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
      next: { revalidate: 300 }, // Cache 5 min
    })

    if (!res.ok) {
      // Si l'endpoint music n'existe pas (404), retourner liste vide
      if (res.status === 404) {
        return NextResponse.json({ tracks: [], message: 'API music non disponible' }, { status: 200 })
      }
      throw new Error(`Pixabay API error: ${res.status}`)
    }

    const data = await res.json()

    const tracks: PixabayMusicTrack[] = (data.hits || []).map((hit: any) => {
      const url = hit.preview?.url || hit.url || hit.audio || hit.download || hit.video?.url
      if (!url) return null
      return {
        id: hit.id,
        title: hit.title || hit.tags || 'Sans titre',
        url,
        duration: hit.duration || 0,
        artist: hit.user || hit.artist || 'Pixabay',
      }
    }).filter(Boolean) as PixabayMusicTrack[]

    return NextResponse.json({ tracks })
  } catch (err) {
    console.error('[pixabay-music] Error:', err)
    return NextResponse.json(
      { tracks: [], message: 'Erreur lors de la recherche' },
      { status: 200 },
    )
  }
}
