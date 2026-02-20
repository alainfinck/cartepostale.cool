'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'

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
          role: 'user', // Default role for new users
        },
      })
    }

    // 3. Generate Session Token (JWT)
    // Payload 3.0 uses 'payload-token' cookie by default.
    // We sign the user data with the Payload Secret.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, hash, salt, ...safeUser } = user

    const token = jwt.sign(
      {
        ...safeUser,
        collection: 'users',
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

    return { success: true, role: user.role }
  } catch (error) {
    console.error('Google Login Error:', error)
    return { error: 'Une erreur interne est survenue.' }
  }
}
