import './load-env'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import fs from 'fs'
import path from 'path'

const artifactDir = '/Users/alainf./.gemini/antigravity/brain/06c77112-df6c-4b7f-ba5c-c507caf7b6c3/'

const mapping = [
  {
    slug: 'comment-creer-une-carte-postale-inoubliable',
    file: 'blog_guide_postcard_v1_1771627364203.png',
  },
  {
    slug: 'pourquoi-la-carte-postale-revient-a-la-mode',
    file: 'blog_digital_vs_physical_v1_1771627383552.png',
  },
  { slug: 'top-5-destinations-photos-ete', file: 'blog_top_destinations_v1_1771627405002.png' },
  { slug: 'astuces-photos-voyage', file: 'blog_photo_tips_v1_1771627421502.png' },
  { slug: 'bagage-cabine-organisation', file: 'blog_carryon_packing_v1_1771627436775.png' },
  { slug: 'city-guide-cannes', file: 'blog_cannes_guide_v1_1771627457639.png' },
  { slug: 'evolution-carte-postale', file: 'blog_evolution_postcard_v1_1771627474776.png' },
]

async function uploadImages() {
  const payload = await getPayload({ config })

  for (const item of mapping) {
    const filePath = path.join(artifactDir, item.file)
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`)
      continue
    }

    console.log(`Uploading ${item.file} for post ${item.slug}...`)

    const fileBuffer = fs.readFileSync(filePath)
    const fileData = {
      data: fileBuffer,
      name: item.file,
      mimetype: 'image/png',
      size: fileBuffer.byteLength,
    }

    try {
      // 1. Create Media
      const media = await payload.create({
        collection: 'media',
        data: {
          alt: `Image for ${item.slug}`,
        },
        file: fileData as any,
      })

      // 2. Link to Post
      const posts = await payload.find({
        collection: 'posts',
        where: {
          slug: { equals: item.slug },
        },
      })

      if (posts.totalDocs > 0) {
        await payload.update({
          collection: 'posts',
          id: posts.docs[0].id,
          data: {
            image: media.id,
          },
        })
        console.log(`Successfully linked image to post: ${item.slug}`)
      } else {
        console.warn(`Post not found for slug: ${item.slug}`)
      }
    } catch (error) {
      console.error(`Error processing ${item.slug}:`, error)
    }
  }

  process.exit(0)
}

uploadImages()
