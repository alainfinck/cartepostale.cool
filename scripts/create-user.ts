/**
 * One-off script to create a user for dashboard access.
 * Run from project root: pnpm exec tsx scripts/create-user.ts
 */
import 'dotenv/config'
import { getPayload } from 'payload'
// @ts-expect-error path resolution for script
import config from '../src/payload.config.ts'

const EMAIL = 'alain@wallprint.fr'
const PASSWORD = 'caldera'

async function main() {
  const payload = await getPayload({ config })

  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: EMAIL } },
    limit: 1,
  })

  if (existing.docs.length > 0) {
    console.log(`Utilisateur ${EMAIL} existe déjà. Vous pouvez vous connecter avec ce compte.`)
    process.exit(0)
    return
  }

  await payload.create({
    collection: 'users',
    data: {
      email: EMAIL,
      password: PASSWORD,
      name: 'Alain',
      role: 'user',
    } as any,
  })

  console.log(`Compte créé : ${EMAIL}`)
  console.log(
    'Connectez-vous sur http://localhost:3000/connexion puis accédez au tableau de bord : http://localhost:3000/espace-client',
  )
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
