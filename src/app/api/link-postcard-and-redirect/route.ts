import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { linkPostcardToCurrentUser } from '@/actions/auth-actions'

/**
 * GET: After Google (or other) login, link a postcard to the current user then redirect.
 * Used as callbackUrl when connexion page has linkPostcard param.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const postcard = searchParams.get('postcard')
  const redirectParam = searchParams.get('redirect')
  const redirect =
    redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('//')
      ? redirectParam
      : '/espace-client'

  if (!postcard?.trim()) {
    return NextResponse.redirect(new URL(redirect, request.url))
  }

  const user = await getCurrentUser()
  if (!user?.id) {
    const connexionUrl = new URL('/connexion', request.url)
    connexionUrl.searchParams.set('callbackUrl', redirect)
    connexionUrl.searchParams.set('linkPostcard', postcard.trim())
    return NextResponse.redirect(connexionUrl)
  }

  const result = await linkPostcardToCurrentUser(postcard.trim())
  if (!result.success) {
    return NextResponse.redirect(new URL(redirect, request.url))
  }

  return NextResponse.redirect(new URL(redirect, request.url))
}
