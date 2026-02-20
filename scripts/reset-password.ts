/**
 * Réinitialise le mot de passe d'un utilisateur (utile si le hash a été créé
 * avec un autre format, ex. create-user-direct.mjs avant correctif).
 * Run: pnpm exec tsx scripts/reset-password.ts
 */
import 'dotenv/config'
import { getPayload } from 'payload'
// @ts-expect-error path resolution for script
import config from '../src/payload.config.ts'

const EMAIL = 'alain@wallprint.fr'
const NEW_PASSWORD = 'caldera'

async function main() {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'users',
    where: { email: { equals: EMAIL } },
    limit: 1,
  })

  if (docs.length === 0) {
    console.error(`Utilisateur ${EMAIL} introuvable.`)
    process.exit(1)
  }

  const user = docs[0]
  await payload.update({
    collection: 'users',
    id: user.id,
    data: { password: NEW_PASSWORD } as any,
    overrideAccess: true,
  })

  console.log(`Mot de passe réinitialisé pour ${EMAIL}.`)
  console.log('Connectez-vous sur http://localhost:3000/connexion')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
