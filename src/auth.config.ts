import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

// Variables Coolify : GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET || process.env.PAYLOAD_SECRET,
  trustHost: true,
  providers: [
    ...(googleClientId && googleClientSecret
      ? [
          Google({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          }),
        ]
      : []),
    Credentials({
      name: 'Email/Mot de passe',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          // Utilisation d'un import dynamique pour éviter les cycles au build (si nécessaire)
          // et s'assurer que Payload est chargé côté serveur uniquement.
          const { getPayload } = await import('payload')
          const { default: config } = await import('@payload-config')
          const payload = await getPayload({ config })

          const result = await payload.login({
            collection: 'users',
            data: {
              email: credentials.email as string,
              password: credentials.password as string,
            },
          })

          if (result.user) {
            return result.user as any
          }
        } catch (error) {
          console.error('Erreur Credentials Authorize:', error)
          return null
        }
        return null
      },
    }),
  ],
}
