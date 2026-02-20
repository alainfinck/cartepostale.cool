import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

import { randomUUID } from 'crypto'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/connexion?error=missing_token', request.url))
  }

  try {
    const payload = await getPayload({ config })

    // Find user with this token
    const result = await payload.find({
      collection: 'users',
      where: {
        magicLinkToken: {
          equals: token,
        },
        magicLinkExpires: {
          greater_than: new Date().toISOString(),
        },
      },
    })

    if (result.totalDocs === 0) {
      return NextResponse.redirect(new URL('/connexion?error=invalid_token', request.url))
    }

    const user = result.docs[0]

    // Create session for user
    const sid = randomUUID()
    const now = new Date()
    const tokenExpInMs = 7 * 24 * 60 * 60 * 1000
    const expiresAt = new Date(now.getTime() + tokenExpInMs)

    const session = {
      id: sid,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    }

    let updatedSessions = user.sessions || []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updatedSessions = updatedSessions.filter((s: any) => new Date(s.expiresAt) > now)
    updatedSessions.push(session)

    // Invalidate token & update session
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        magicLinkToken: null,
        magicLinkExpires: null,
        sessions: updatedSessions,
      },
    })

    // Generate Payload JWT
    // Note: In detailed implementations, we might use payload.login() but that usually requires password.
    // We can manually sign a JWT compatible with Payload's strategy if we know the secret.
    const secret = process.env.PAYLOAD_SECRET || ''

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, hash, salt, ...safeUser } = user
    const fieldsToSign = {
      ...safeUser,
      collection: 'users',
      sid: sid,
    }

    const jwtToken = jwt.sign(fieldsToSign, secret, {
      expiresIn: '7d', // Session duration
    })

    // Redirect: allow ?redirect= path (same-origin path only)
    const redirectParam = searchParams.get('redirect')
    const defaultRedirect = '/espace-client'
    const path =
      redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('//')
        ? redirectParam
        : defaultRedirect
    const response = NextResponse.redirect(new URL(path, request.url))

    // Set the cookie
    response.cookies.set('payload-token', jwtToken, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })

    return response
  } catch (error) {
    console.error('Magic login error:', error)
    return NextResponse.redirect(new URL('/connexion?error=server_error', request.url))
  }
}
