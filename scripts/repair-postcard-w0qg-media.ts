/**
 * Répare la carte W0QG : tous les mediaItems ont media: null.
 * On assigne les N Media les plus récents (créés après la carte) aux N premiers slots.
 * Usage: pnpm exec tsx scripts/repair-postcard-w0qg.ts
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const PUBLIC_ID = 'W0QG'

async function main() {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'postcards',
    where: { publicId: { equals: PUBLIC_ID } },
    depth: 0,
    limit: 1,
  })
  if (result.totalDocs === 0) {
    console.log('Carte', PUBLIC_ID, 'introuvable.')
    process.exit(1)
  }

  const postcard = result.docs[0] as any
  const postcardId = postcard.id
  const createdAt = postcard.createdAt
  const count = postcard.mediaItems?.length ?? 0
  if (count === 0) {
    console.log('Aucun mediaItem à réparer.')
    process.exit(0)
  }

  const allRecent = await payload.find({
    collection: 'media',
    limit: 150,
    sort: '-createdAt',
  })
  const afterCard = (allRecent.docs as any[])
    .filter((m) => new Date(m.createdAt) >= new Date(createdAt))
    .reverse()
    .slice(0, count)

  if (afterCard.length < count) {
    console.log(
      `Seulement ${afterCard.length} Media trouvés après ${createdAt}, il en faut ${count}.`,
    )
    console.log('On assigne ceux disponibles.')
  }

  const mediaIds = afterCard.map((m: any) => m.id)
  const newMediaItems = postcard.mediaItems.map((item: any, i: number) => ({
    ...item,
    media: mediaIds[i] ?? item.media,
    type: item.type || 'image',
    note: item.note ?? undefined,
  }))

  await payload.update({
    collection: 'postcards',
    id: postcardId,
    data: { mediaItems: newMediaItems },
  })

  console.log('Carte', PUBLIC_ID, 'mise à jour:', mediaIds.length, 'media reliés.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
