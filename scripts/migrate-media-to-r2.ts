/**
 * Migre tous les fichiers média locaux (public/media) vers Cloudflare R2.
 * À lancer une fois après avoir configuré S3_* et R2_PUBLIC_BASE_URL dans .env.
 *
 * Usage: pnpm tsx scripts/migrate-media-to-r2.ts
 */

import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const BUCKET = process.env.S3_BUCKET
const ENDPOINT = process.env.S3_ENDPOINT
const ACCESS_KEY = process.env.S3_ACCESS_KEY_ID
const SECRET_KEY = process.env.S3_SECRET_ACCESS_KEY

if (!BUCKET || !ACCESS_KEY || !SECRET_KEY || !ENDPOINT) {
  console.error('Variables manquantes: S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_ENDPOINT')
  process.exit(1)
}

const isR2 = ENDPOINT.includes('r2.cloudflarestorage.com')
const region = process.env.S3_REGION || (isR2 ? 'auto' : 'us-east-1')

const s3 = new S3Client({
  credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
  region,
  endpoint: ENDPOINT,
  forcePathStyle: true,
})

const LOCAL_MEDIA_DIR = path.resolve(process.cwd(), 'public/media')

async function migrate() {
  const payload = await getPayload({ config })
  let uploaded = 0
  let skipped = 0
  let errors = 0
  let page = 1
  const limit = 100

  while (true) {
    const result = await payload.find({
      collection: 'media',
      limit,
      page,
      depth: 0,
    })

    for (const doc of result.docs) {
      const filename = doc.filename as string | undefined
      if (!filename) {
        skipped++
        continue
      }

      const prefix = (doc as { prefix?: string }).prefix
      const key = prefix ? `${prefix}/${filename}` : filename
      const localPath = path.join(LOCAL_MEDIA_DIR, filename)

      if (!fs.existsSync(localPath)) {
        console.log(`Skip (fichier local absent): ${filename}`)
        skipped++
        continue
      }

      try {
        const body = fs.readFileSync(localPath)
        const mimeType = (doc as { mimeType?: string }).mimeType || 'application/octet-stream'

        await s3.send(
          new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: body,
            ContentType: mimeType,
          }),
        )
        console.log(`OK: ${key}`)
        uploaded++
      } catch (err: any) {
        console.error(`Erreur ${filename}:`, err.message)
        errors++
      }
    }

    if (!result.hasNextPage) break
    page++
  }

  console.log('\n--- Résumé ---')
  console.log(`Uploadés: ${uploaded}, Ignorés: ${skipped}, Erreurs: ${errors}`)
}

migrate().catch((e) => {
  console.error(e)
  process.exit(1)
})
