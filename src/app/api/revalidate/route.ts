import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag, revalidatePath } from 'next/cache'

/**
 * Route d'invalidation manuelle du cache pour une carte.
 * Usage : GET /api/revalidate?publicId=Zm4i&secret=REVALIDATE_SECRET
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const secret = searchParams.get('secret')
  const publicId = searchParams.get('publicId')

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  if (!publicId) {
    return NextResponse.json({ error: 'publicId required' }, { status: 400 })
  }

  revalidateTag(`postcard-${publicId}`)
  revalidatePath(`/carte/${publicId}`)

  return NextResponse.json({ revalidated: true, publicId })
}
