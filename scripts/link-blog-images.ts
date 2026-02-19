import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function linkImages() {
  const payload = await getPayload({ config })

  console.log('--- Linking Images to Blog Posts ---')

  const postsToUpdate = [
    {
      id: 1, // "Comment créer une carte postale inoubliable ?"
      imageSource: 'methodes-carte.jpg',
      alt: 'Création carte postale',
    },
    {
      id: 2, // "Pourquoi la carte postale revient à la mode ?"
      imageSource: 'mode-carte.jpg',
      alt: 'Carte postale moderne',
    },
    {
      id: 3, // "Les 5 meilleures destinations pour vos photos cet été"
      imageSource: 'destinations-ete.jpg',
      alt: 'Plage été',
    },
  ]

  for (const postData of postsToUpdate) {
    try {
      console.log(`Processing Post ID: ${postData.id}`)

      const imagePath = path.resolve(__dirname, '../public/images/blog', postData.imageSource)
      let mediaId = undefined

      if (fs.existsSync(imagePath)) {
        // Create media
        const media = await payload.create({
          collection: 'media',
          data: {
            alt: postData.alt,
          },
          file: {
            data: fs.readFileSync(imagePath),
            mimetype: 'image/jpeg',
            name: postData.imageSource,
            size: fs.statSync(imagePath).size,
          },
        })
        mediaId = media.id
        console.log(`  Uploaded media: ${media.id}`)

        // Update post with media
        await payload.update({
          collection: 'posts',
          id: postData.id,
          data: {
            image: mediaId,
          },
        })
        console.log(`  Updated post ${postData.id} with image.`)
      } else {
        console.error(`  Image file not found: ${imagePath}`)
      }
    } catch (error) {
      console.error(`  Failed to update post ${postData.id}:`, error)
    }
  }

  console.log('--- Images Linked ---')
  process.exit(0)
}

linkImages().catch((err) => {
  console.error(err)
  process.exit(1)
})
