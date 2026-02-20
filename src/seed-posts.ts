import { getPayload } from 'payload'
import config from '@/payload.config'

async function seed() {
  const payload = await getPayload({ config })
  console.log('Got payload instance...')

  const existing = await payload.find({ collection: 'posts' })
  if (existing.totalDocs > 0) {
    console.log(`Already found ${existing.totalDocs} posts.`)
    process.exit(0)
  }

  await payload.create({
    collection: 'posts',
    data: {
      title: '5 Astuces pour de superbes cartes postales',
      slug: '5-astuces-cartes-postales',
      status: 'published',
      publishedDate: new Date().toISOString(),
      category: 'tips',
      excerpt:
        'Découvrez 5 astuces imparables pour envoyer des cartes postales mémorables lors de vos prochains voyages...',
      content: {
        root: {
          type: 'root',
          format: '',
          indent: 0,
          version: 1,
          children: [
            {
              type: 'paragraph',
              format: '',
              indent: 0,
              version: 1,
              children: [
                {
                  mode: 'normal',
                  text: 'Voici quelques astuces pour réussir vos cartes postales...',
                  type: 'text',
                  style: '',
                  detail: 0,
                  format: 0,
                  version: 1,
                },
              ],
            },
          ],
        },
      } as any,
    },
  })

  await payload.create({
    collection: 'posts',
    data: {
      title: 'Les plus belles destinations de 2026',
      slug: 'belles-destinations-2026',
      status: 'published',
      publishedDate: new Date('2026-02-15T12:00:00Z').toISOString(),
      category: 'travel',
      excerpt:
        "Vous cherchez l'inspiration pour votre prochain voyage ? Nous avons sélectionné les destinations incontournables de l'année...",
      content: {
        root: {
          type: 'root',
          format: '',
          indent: 0,
          version: 1,
          children: [
            {
              type: 'paragraph',
              format: '',
              indent: 0,
              version: 1,
              children: [
                {
                  mode: 'normal',
                  text: "L'année 2026 promet d'être incroyable pour les voyageurs...",
                  type: 'text',
                  style: '',
                  detail: 0,
                  format: 0,
                  version: 1,
                },
              ],
            },
          ],
        },
      } as any,
    },
  })

  console.log('Seeded posts successfully.')
  process.exit(0)
}

seed().catch(console.error)
