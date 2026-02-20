'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { randomBytes, randomUUID } from 'crypto'

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
    const email = googleUser.email?.toLowerCase()
    const name = googleUser.name

    if (!email) {
      return { error: "Impossible de récupérer l'email depuis Google." }
    }

    // 2. Find or Create user in Payload
    const payload = await getPayload({ config: configPromise })
    const users = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email,
        },
      },
    })

    let user = users.docs[0]

    if (!user) {
      // Create new user if not exists
      const randomPassword = randomBytes(16).toString('hex')
      user = await payload.create({
        collection: 'users',
        data: {
          email,
          name: name || undefined,
          password: randomPassword,
          role: 'user', // Match schema defaultValue
        },
      })
    }

    // 3. Generate Session Token (JWT) mapping for Payload 3.x
    // Payload 3 requires an active session matching the session ID in the token.
    const sid = randomUUID()
    const now = new Date()
    // Session length: 7 days
    const tokenExpInMs = 7 * 24 * 60 * 60 * 1000
    const expiresAt = new Date(now.getTime() + tokenExpInMs)

    const session = {
      id: sid,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    }

    let updatedSessions = user.sessions || []
    // Remove expired
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updatedSessions = updatedSessions.filter((s: any) => new Date(s.expiresAt) > now)
    updatedSessions.push(session)

    // Save session in db
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        sessions: updatedSessions,
      },
    })

    // Prepare token fields explicitly avoiding passwords
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, hash, salt, ...safeUser } = user

    const secret = process.env.PAYLOAD_SECRET || ''
    const token = jwt.sign(
      {
        ...safeUser,
        collection: 'users',
        sid: sid, // Vital for Payload autologin
      },
      secret,
      {
        expiresIn: '7d', // Session duration
      },
    )

    // 4. Set Cookie
    const cookieStore = await cookies()
    cookieStore.set('payload-token', token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    })

    return { success: true, role: user.role || 'user', email: user.email }
  } catch (error) {
    console.error('Google Login Error:', error)
    return { error: 'Une erreur interne est survenue.' }
  }
}
