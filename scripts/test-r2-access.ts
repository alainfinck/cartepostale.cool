/**
 * Teste l'accès R2 : envoi d'un objet test puis lecture.
 * Usage: pnpm run test-r2-access
 */

import 'dotenv/config'
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

const BUCKET = process.env.S3_BUCKET
const ENDPOINT = process.env.S3_ENDPOINT
const ACCESS_KEY = process.env.S3_ACCESS_KEY_ID?.trim()
const SECRET_KEY = process.env.S3_SECRET_ACCESS_KEY?.trim()

const TEST_KEY = 'r2-test/check.txt'
const TEST_BODY = 'ok-' + Date.now()

async function main() {
  if (!BUCKET || !ACCESS_KEY || !SECRET_KEY || !ENDPOINT) {
    console.error('❌ Variables manquantes: S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_ENDPOINT')
    process.exit(1)
  }

  if (ACCESS_KEY.includes('=') || ACCESS_KEY.includes('/')) {
    console.error('❌ S3_ACCESS_KEY_ID invalide (contient "=" ou "/"). Utilisez uniquement la valeur de l’Access Key.')
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

  console.log('Test R2:', ENDPOINT)
  console.log('Bucket:', BUCKET)
  console.log('')

  try {
    // 1. Écriture
    console.log('1. Envoi (PutObject)...')
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: TEST_KEY,
        Body: TEST_BODY,
        ContentType: 'text/plain',
      }),
    )
    console.log('   ✓ Objet envoyé:', TEST_KEY)

    // 2. Lecture
    console.log('2. Lecture (GetObject)...')
    const getRes = await s3.send(
      new GetObjectCommand({
        Bucket: BUCKET,
        Key: TEST_KEY,
      }),
    )
    const body = await getRes.Body?.transformToByteArray()
    const text = body ? new TextDecoder().decode(body) : ''
    if (text !== TEST_BODY) {
      throw new Error(`Contenu lu "${text}" !== attendu "${TEST_BODY}"`)
    }
    console.log('   ✓ Contenu lu:', text)

    // 3. Nettoyage
    console.log('3. Suppression (DeleteObject)...')
    await s3.send(
      new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: TEST_KEY,
      }),
    )
    console.log('   ✓ Objet supprimé')

    console.log('')
    console.log('✅ Accès R2 OK : envoi, lecture et suppression réussis.')
  } catch (err: any) {
    console.error('')
    console.error('❌ Erreur R2:', err.message || err)
    if (err.name) console.error('   name:', err.name)
    if (err.$metadata?.httpStatusCode) console.error('   httpStatusCode:', err.$metadata.httpStatusCode)
    process.exit(1)
  }
}

main()
