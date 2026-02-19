import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

async function main() {
  const payload = await getPayload({ config })
  const posts = await payload.find({
    collection: 'posts',
    limit: 100,
  })

  console.log(
    'Found posts:',
    posts.docs.map((p) => ({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
    })),
  )
  process.exit(0)
}

main()
