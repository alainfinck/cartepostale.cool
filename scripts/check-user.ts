import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

async function run() {
  const payload = await getPayload({ config })
  const email = 'alain@wallprint.fr'

  const { docs: users } = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
  })

  if (users.length > 0) {
    console.log('Current user data:', JSON.stringify(users[0], null, 2))
  } else {
    console.log('User not found')
  }
  process.exit(0)
}

run()
