import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

async function run() {
  const payload = await getPayload({ config })
  const email = 'alain@wallprint.fr'

  const { docs: users } = await payload.find({
    collection: 'users',
    where: {
      email: {
        equals: email,
      },
    },
  })

  if (users.length > 0) {
    const user = users[0]
    console.log(`User ${email} found with current role: ${user.role}. Updating to admin...`)
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        role: 'admin',
      },
    })
    console.log(`User ${email} is now admin.`)
  } else {
    console.log(`User ${email} not found.`)
  }

  process.exit(0)
}

run()
