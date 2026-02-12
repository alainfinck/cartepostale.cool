/**
 * Donne le rôle admin à un utilisateur (accès /manager).
 * Run: pnpm exec tsx scripts/set-admin.ts
 */
import 'dotenv/config'
import { getPayload } from 'payload'
// @ts-expect-error path resolution for script
import config from '../src/payload.config.ts'

const EMAIL = 'alain@wallprint.fr'

async function main() {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'users',
    where: { email: { equals: EMAIL } },
    limit: 1,
  })

  if (docs.length === 0) {
    console.error(`Utilisateur non trouvé : ${EMAIL}`)
    console.log('Créez d’abord le compte avec : pnpm exec tsx scripts/create-user.ts')
    process.exit(1)
  }

  const user = docs[0]
  if (user.role === 'admin') {
    console.log(`${EMAIL} a déjà le rôle admin. Accès manager : http://localhost:3000/manager`)
    process.exit(0)
    return
  }

  await payload.update({
    collection: 'users',
    id: user.id,
    data: { role: 'admin' },
  })

  console.log(`Rôle admin attribué à ${EMAIL}.`)
  console.log('Accès manager : http://localhost:3000/manager')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
