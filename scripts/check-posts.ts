import './load-env'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import path from 'path'
import { fileURLToPath } from 'url'

async function checkPosts() {
  const payload = await getPayload({ config })

  const posts = await payload.find({
    collection: 'posts',
  })

  console.log(`Total posts in DB: ${posts.totalDocs}`)
  posts.docs.forEach((post: any) => {
    console.log(`- ${post.title} (${post.status})`)
  })

  const users = await payload.find({
    collection: 'users',
  })
  console.log(`Total users in DB: ${users.totalDocs}`)

  process.exit(0)
}

checkPosts()
