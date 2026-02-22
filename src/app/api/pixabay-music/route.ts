/**
 * API proxy pour la bibliothèque de musique Freesound.
 * Freesound propose des milliers de titres gratuits et libres de droits.
 *
 * Configuration : variable d'environnement FREESOUND_API_KEY
 * Obtenir une clé gratuite : https://freesound.org/apiv2/apply/
 */

import { NextRequest, NextResponse } from 'next/server'

const FREESOUND_API_KEY = process.env.FREESOUND_API_KEY?.trim()

export interface MusicTrack {
  id: number
  title: string
  url: string
  duration: number
  artist: string
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') || 'ambient'
  const page_size = Math.min(parseInt(searchParams.get('per_page') || '20', 10), 50)

  if (!FREESOUND_API_KEY) {
    return NextResponse.json(
      {
        tracks: [],
        message:
          "FREESOUND_API_KEY non configurée. Ajoutez-la dans vos variables d'environnement pour activer la bibliothèque de musique. Clé gratuite sur freesound.org/apiv2/apply/",
      },
      { status: 200 },
    )
  }

  try {
    // Freesound Search API
    const url = new URL('https://freesound.org/apiv2/search/text/')
    url.searchParams.set('token', FREESOUND_API_KEY)
    url.searchParams.set('query', q)
    url.searchParams.set('page_size', String(page_size))
    url.searchParams.set('fields', 'id,name,username,previews,duration')

    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
      next: { revalidate: 300 }, // Cache 5 min
    })

    if (!res.ok) {
      const errorData = await res.json()
      console.error('[freesound-music] API error:', res.status, errorData)
      return NextResponse.json(
        { tracks: [], message: `Erreur API Freesound: ${res.status}` },
        { status: 200 },
      )
    }

    const data = await res.json()

    const tracks: MusicTrack[] = (data.results || [])
      .map((hit: any) => {
        const url = hit.previews?.['preview-hq-mp3'] || hit.previews?.['preview-lq-mp3']
        if (!url) return null
        return {
          id: hit.id,
          title: hit.name || 'Sans titre',
          url,
          duration: hit.duration || 0,
          artist: hit.username || 'Freesound',
        }
      })
      .filter(Boolean) as MusicTrack[]

    return NextResponse.json({ tracks })
  } catch (err) {
    console.error('[freesound-music] Error:', err)
    return NextResponse.json(
      { tracks: [], message: 'Erreur lors de la recherche' },
      { status: 200 },
    )
  }
}
