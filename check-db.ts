import { getPayload } from 'payload'
import config from './src/payload.config'

async function check() {
  const payload = await getPayload({ config })
  try {
    const users = await payload.find({
      collection: 'users',
      limit: 1,
    })
    console.log('Users found:', users.totalDocs)
    if (users.docs.length > 0) {
      console.log('User first doc keys:', Object.keys(users.docs[0]))
      console.log('Credits field:', users.docs[0].credits)
    }
  } catch (err) {
    console.error('Error querying users:', err)
  }
}

check().then(() => process.exit())
