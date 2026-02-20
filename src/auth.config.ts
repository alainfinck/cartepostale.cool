import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { getPayload } from 'payload'
import payloadConfig from '@payload-config'

export const authConfig: NextAuthConfig = {
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

        const payload = await getPayload({ config: payloadConfig })
        const { docs } = await payload.find({
          collection: 'users',
          where: {
            email: {
              equals: (credentials.email as string).toLowerCase(),
            },
          },
          // On veut récupérer le hash même s'il est caché d'habitude
          showHiddenFields: true,
        })

        const user = docs[0]

        if (!user || !(user as any).hash) return null

        // Comparaison du mot de passe avec le hash stocké par Payload
        const isPasswordCorrect = await bcrypt.compare(
          credentials.password as string,
          (user as any).hash,
        )

        if (!isPasswordCorrect) return null

        return {
          id: user.id.toString(),
          email: user.email,
          name: (user as any).name,
          role: (user as any).role,
        }
      },
    }),
  ],
}
