/**
 * Create or reactivate a temporary preview link for the editor.
 * POST body: postcard JSON (FrontendPostcard shape). Optional "slug" to reactivate the same link (TTL reset to 5 min).
 * Returns { slug } — URL is /carte/preview/[slug], valid 5 minutes.
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  setEditorPreview,
  generatePreviewToken,
} from '@/lib/editor-preview-store'

const VALID_SLUG = /^[a-f0-9]{24}$/ // 12 bytes hex = 24 chars

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Corps de requête invalide' },
        { status: 400 },
      )
    }
    const { slug: existingSlug, ...postcardData } = body
    const canReuse =
      existingSlug &&
      typeof existingSlug === 'string' &&
      VALID_SLUG.test(existingSlug)

    if (canReuse) {
      setEditorPreview(existingSlug, postcardData)
      return NextResponse.json({ slug: existingSlug })
    }
    const token = generatePreviewToken()
    setEditorPreview(token, postcardData)
    return NextResponse.json({ slug: token })
  } catch (e) {
    console.error('[API] editor/preview:', e)
    return NextResponse.json(
      { error: 'Impossible de créer l’aperçu' },
      { status: 500 },
    )
  }
}
