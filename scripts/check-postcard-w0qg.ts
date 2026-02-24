/**
 * Vérifie la carte W0QG : mediaItems en base et URLs R2 (R2_PUBLIC_BASE_URL).
 * Usage: pnpm exec tsx scripts/check-postcard-w0qg.ts
 * (charge .env via dotenv si présent)
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const PUBLIC_ID = 'W0QG'
const R2_BASE = process.env.R2_PUBLIC_BASE_URL || ''

async function main() {
  console.log('R2_PUBLIC_BASE_URL:', R2_BASE || '(non défini)')
  console.log('')

  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'postcards',
    where: { publicId: { equals: PUBLIC_ID } },
    depth: 0,
    limit: 1,
  })

  if (result.totalDocs === 0) {
    console.log(`Carte #${PUBLIC_ID} : introuvable en base.`)
    process.exit(1)
  }

  const postcard = result.docs[0] as any
  console.log(`Carte #${PUBLIC_ID} trouvée (id=${postcard.id}, isPublic=${postcard.isPublic})`)
  console.log('mediaItems (brut):', postcard.mediaItems?.length ?? 0)
  if (postcard.mediaItems?.length) {
    const sample = postcard.mediaItems[0]
    console.log('Structure 1er mediaItem (clés):', Object.keys(sample || {}))
    console.log('  media type:', typeof sample?.media, 'value:', sample?.media)
    const withMedia = postcard.mediaItems.filter((it: any) => it.media != null)
    const mediaIds = withMedia.map((it: any) => typeof it.media === 'number' ? it.media : it.media?.id)
    console.log('  Items avec media non-null:', withMedia.length, 'IDs:', mediaIds.slice(0, 5))
  }

  if (!postcard.mediaItems?.length) {
    console.log('Aucun mediaItem → l’album ne peut pas s’afficher.')
    process.exit(0)
  }

  for (let i = 0; i < postcard.mediaItems.length; i++) {
    const item = postcard.mediaItems[i]
    const mediaId = typeof item.media === 'number' ? item.media : item.media?.id
    if (mediaId == null) {
      console.log(`  [${i}] media manquant ou non-ID`)
      continue
    }
    const mediaDoc = await payload.findByID({
      collection: 'media',
      id: mediaId,
      depth: 0,
    }) as { id: number; filename?: string | null; url?: string | null }
    const filename = mediaDoc.filename || '(vide)'
    const url = mediaDoc.url || '(non généré)'
    const builtUrl = R2_BASE
      ? `${R2_BASE.replace(/\/$/, '')}/${filename.split('/').map(encodeURIComponent).join('/')}`
      : '(R2_PUBLIC_BASE_URL manquant)'
    console.log(`  [${i}] mediaId=${mediaId} filename=${filename}`)
    console.log(`      url (Payload)=${url}`)
    console.log(`      URL construite=${builtUrl}`)
  }

  const postcardCreated = (postcard as any).createdAt
  const mediaInPostcards = await payload.find({
    collection: 'media',
    where: { filename: { contains: 'postcards' } },
    limit: 60,
    sort: '-createdAt',
  })
  console.log('')
  console.log('Media "postcards/..." (total):', mediaInPostcards.totalDocs)
  const afterCard = mediaInPostcards.docs.filter((m: any) => new Date(m.createdAt) >= new Date(postcardCreated))
  console.log('  Créés après la carte (24 fév):', afterCard.length)

  const allRecent = await payload.find({
    collection: 'media',
    limit: 60,
    sort: '-createdAt',
  })
  const onOrAfter24 = (allRecent.docs as any[]).filter((m) => new Date(m.createdAt) >= new Date('2026-02-24T00:00:00Z'))
  console.log('  Tous médias créés le 24 fév ou après:', onOrAfter24.length)
  if (onOrAfter24.length > 0) {
    console.log('  Ex. 3 premiers:', onOrAfter24.slice(0, 3).map((m: any) => ({ id: m.id, filename: m.filename, createdAt: m.createdAt })))
  }

  if (mediaInPostcards.docs.length > 0) {
    const first = mediaInPostcards.docs[0] as any
    const last = mediaInPostcards.docs[mediaInPostcards.docs.length - 1] as any
    console.log('  Plus récent:', first.id, first.filename, first.createdAt)
    console.log('  Plus ancien:', last.id, last.filename, last.createdAt)
    console.log('  Carte W0QG createdAt:', postcardCreated)
  }

  if (R2_BASE) {
    const firstItem = postcard.mediaItems[0]
    const firstMediaId = typeof firstItem.media === 'number' ? firstItem.media : firstItem.media?.id
    if (firstMediaId != null) {
      const firstMedia = await payload.findByID({
        collection: 'media',
        id: firstMediaId,
        depth: 0,
      }) as { filename?: string | null }
      if (firstMedia.filename) {
        const testUrl = `${R2_BASE.replace(/\/$/, '')}/${firstMedia.filename.split('/').map(encodeURIComponent).join('/')}`
        console.log('')
        console.log('Test GET sur première image R2:', testUrl)
        try {
          const res = await fetch(testUrl, { method: 'HEAD' })
          console.log('  Status:', res.status, res.statusText)
          if (!res.ok) {
            const text = await fetch(testUrl).then((r) => r.text())
            console.log('  Body (extrait):', text.slice(0, 200))
          }
        } catch (e: any) {
          console.log('  Erreur:', e?.message || e)
        }
      }
    }
  }

  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
