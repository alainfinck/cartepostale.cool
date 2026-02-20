'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

import { randomUUID } from 'crypto'

export async function loginWithGoogle(accessToken: string) {
  try {
    // 1. Verify the access token by fetching user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!userInfoResponse.ok) {
      return { error: 'Token Google invalide ou expiré.' }
    }

    const googleUser = await userInfoResponse.json()
    const email = googleUser.email

    if (!email) {
      return { error: "Impossible de récupérer l'email depuis Google." }
    }

    // 2. Find user in Payload
    const payload = await getPayload({ config: configPromise })
    const users = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email,
        },
      },
    })

    const user = users.docs[0]

    if (!user) {
      return { error: "Aucun compte associé à cet email. Veuillez contacter l'administrateur." }
    }

    // 3. Generate Session Token (JWT)
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

    await payload.update({
      collection: 'users',
      id: user.id,
      data: { sessions: updatedSessions },
    })

    // Payload 3.0 uses 'payload-token' cookie by default.
    // We sign the user data with the Payload Secret.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, hash, salt, ...safeUser } = user as any

    const token = jwt.sign(
      {
        ...safeUser,
        collection: 'users',
        sid: sid,
      },
      process.env.PAYLOAD_SECRET || '',
      {
        expiresIn: '7d', // Session duration
      },
    )

    // 4. Set Cookie
    ;(await cookies()).set('payload-token', token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    })

    return { success: true }
  } catch (error) {
    console.error('Google Login Error:', error)
    return { error: 'Une erreur interne est survenue.' }
  }
}
