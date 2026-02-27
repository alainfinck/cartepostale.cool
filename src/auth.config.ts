import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

const parseBooleanEnv = (value?: string): boolean | undefined => {
  if (!value) return undefined

  const normalized = value.trim().toLowerCase()
  if (normalized === 'true') return true
  if (normalized === 'false') return false
  return undefined
}

const authUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL
const trustHostFromEnv =
  parseBooleanEnv(process.env.AUTH_TRUST_HOST) ?? parseBooleanEnv(process.env.NEXTAUTH_TRUST_HOST)
const trustHost =
  trustHostFromEnv !== undefined
    ? trustHostFromEnv
    : Boolean(authUrl) || process.env.NODE_ENV === 'production'

export const authConfig: NextAuthConfig = {
  trustHost,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
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
