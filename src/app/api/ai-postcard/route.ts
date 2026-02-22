/**
 * POST /api/ai-postcard
 *
 * Generates a postcard image via NanoBanana AI.
 * This is a PAID feature – the client must have completed payment before calling.
 * The NanoBanana API key stays server-side.
 */

import { NextRequest, NextResponse } from 'next/server'
import { generatePostcardImage, type NanoBananaModel, type NanoBananaImageSize } from '@/lib/nanobanana'

export async function POST(request: NextRequest) {
  const apiKey = process.env.NANOBANANA_API_KEY?.trim()
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Génération IA non configurée (NANOBANANA_API_KEY manquant).' },
      { status: 503 },
    )
  }

  let body: {
    prompt?: string
    model?: NanoBananaModel
    imageSize?: NanoBananaImageSize
    num?: number
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corps de requête JSON invalide.' }, { status: 400 })
  }

  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : ''
  if (!prompt || prompt.length < 3) {
    return NextResponse.json(
      { error: 'Veuillez décrire l\'image souhaitée (minimum 3 caractères).' },
      { status: 400 },
    )
  }

  if (prompt.length > 500) {
    return NextResponse.json(
      { error: 'La description est trop longue (500 caractères max).' },
      { status: 400 },
    )
  }

  try {
    const result = await generatePostcardImage(apiKey, {
      prompt,
      model: body.model || 'gemini-2.5-flash-image-hd',
      imageSize: body.imageSize || '3:2',
      num: Math.min(body.num || 2, 4),
    })

    const images = result.data?.map((img) => img.url).filter(Boolean) ?? []
    if (images.length === 0) {
      return NextResponse.json(
        { error: 'Aucune image générée. Essayez avec une autre description.' },
        { status: 502 },
      )
    }

    return NextResponse.json({ images })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Erreur lors de la génération de l\'image IA.'
    console.error('AI postcard generation error:', message)
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
