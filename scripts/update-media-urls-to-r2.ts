/**
 * Met à jour la BDD pour que les médias et postcards pointent vers les URLs R2.
 * - Collection media : champ `url` = URL publique R2
 * - Collection postcards : champ `frontImageURL` = URL R2 de l’image de face (si frontImage = media)
 *
 * À lancer après la migration des fichiers (migrate-media-to-r2) ou quand les fichiers sont déjà sur R2.
 * Nécessite R2_PUBLIC_BASE_URL dans .env.
 *
 * Usage: pnpm run update-media-urls-to-r2
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const R2_BASE = process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, '')

if (!R2_BASE) {
  console.error('Variable manquante: R2_PUBLIC_BASE_URL')
  process.exit(1)
}

function mediaToR2Url(filename: string, prefix?: string | null): string {
  const path = [prefix, encodeURIComponent(filename)].filter(Boolean).join('/')
  return `${R2_BASE}/${path}`
}

async function main() {
  const payload = await getPayload({ config })

  // 1. Mettre à jour tous les documents media : url = URL R2
  let mediaPage = 1
  let mediaUpdated = 0
  while (true) {
    const { docs, hasNextPage } = await payload.find({
      collection: 'media',
      limit: 100,
      page: mediaPage,
      depth: 0,
    })
    for (const doc of docs) {
      const filename = doc.filename as string | undefined
      if (!filename) continue
      const prefix = (doc as { prefix?: string }).prefix
      const url = mediaToR2Url(filename, prefix)
      await payload.update({
        collection: 'media',
        id: doc.id,
        data: { url },
      })
      mediaUpdated++
      console.log(`Media ${doc.id}: url → ${url}`)
    }
    if (!hasNextPage) break
    mediaPage++
  }
  console.log(`\nMedia: ${mediaUpdated} document(s) mis à jour.`)

  // 2. Mettre à jour les postcards : frontImageURL = URL R2 du media frontImage
  let postcardPage = 1
  let postcardsUpdated = 0
  while (true) {
    const { docs, hasNextPage } = await payload.find({
      collection: 'postcards',
      limit: 100,
      page: postcardPage,
      depth: 0,
    })
    for (const postcard of docs) {
      const frontImageId = postcard.frontImage as number | null | undefined
      if (frontImageId == null) continue
      const media = await payload.findByID({
        collection: 'media',
        id: frontImageId,
        depth: 0,
      })
      const filename = media.filename as string | undefined
      if (!filename) continue
      const prefix = (media as { prefix?: string }).prefix
      const frontImageURL = mediaToR2Url(filename, prefix)
      await payload.update({
        collection: 'postcards',
        id: postcard.id,
        data: { frontImageURL },
      })
      postcardsUpdated++
      console.log(`Postcard ${postcard.id}: frontImageURL → ${frontImageURL}`)
    }
    if (!hasNextPage) break
    postcardPage++
  }
  console.log(`\nPostcards: ${postcardsUpdated} document(s) mis à jour.`)
  console.log('\n--- Terminé ---')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
