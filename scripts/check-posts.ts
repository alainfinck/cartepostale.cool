import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

async function checkPosts() {
  const payload = await getPayload({ config })
  const posts = await payload.find({
    collection: 'posts',
    limit: 100,
  })

  console.log('--- Blog Posts Status ---')
  for (const post of posts.docs) {
    const hasImage = !!post.image
    console.log(`Post: "${post.title}" (ID: ${post.id}) - Has Image: ${hasImage}`)
    if (hasImage) {
      // @ts-ignore
      console.log(`  Image ID: ${post.image.id || post.image}`)
    }
  }
  process.exit(0)
}

checkPosts()
