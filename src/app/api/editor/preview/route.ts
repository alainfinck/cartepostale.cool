/**
 * Create a temporary preview link for the editor.
 * POST body: postcard JSON (FrontendPostcard shape).
 * Returns { slug } — URL is /carte/preview/[slug], valid 5 minutes.
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  setEditorPreview,
  generatePreviewToken,
} from '@/lib/editor-preview-store'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Corps de requête invalide' },
        { status: 400 },
      )
    }
    const token = generatePreviewToken()
    setEditorPreview(token, body)
    return NextResponse.json({ slug: token })
  } catch (e) {
    console.error('[API] editor/preview:', e)
    return NextResponse.json(
      { error: 'Impossible de créer l’aperçu' },
      { status: 500 },
    )
  }
}
