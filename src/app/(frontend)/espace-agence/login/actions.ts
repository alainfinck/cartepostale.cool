'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

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

    let user = users.docs[0]

    if (!user) {
      return { error: "Aucun compte associé à cet email. Veuillez contacter l'administrateur." }
    }

    // 3. Generate Session Token (JWT)
    // Payload 3.0 uses 'payload-token' cookie by default.
    // We sign the user data with the Payload Secret.
    const token = jwt.sign(
      {
        email: user.email,
        id: user.id,
        collection: 'users',
        ...user,
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
