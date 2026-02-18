/**
 * Génère une URL présignée pour upload direct navigateur → R2 (éditeur public).
 * Pas d’auth requise ; limité aux images, taille max 10 Mo, nom de fichier sécurisé.
 */

import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const BUCKET = process.env.S3_BUCKET
const ENDPOINT = process.env.S3_ENDPOINT
const MAX_SIZE = 100 * 1024 * 1024 // 100 MB
const ALLOWED_MIME = /^image\/(jpeg|jpg|png|webp|gif)|video\/(mp4|quicktime|webm)$/i
const SAFE_FILENAME = /^[a-zA-Z0-9._-]+$/

/** Normalize and validate R2/S3 Access Key ID. Sigv4 credential must be "accessKeyId/date/region/service/aws4_request"; if the ID contains "=" or "/", R2 returns "Credential should have at least 5 slash-separated parts, not 1". */
function getAccessKeyId(): string | null {
  let raw = process.env.S3_ACCESS_KEY_ID?.trim()
  if (!raw) return null

  // If the user pasted "S3_ACCESS_KEY_ID=value" or "S3_ACCESS_KEY_ID = value"
  if (raw.startsWith('S3_ACCESS_KEY_ID')) {
    const parts = raw.split('=')
    if (parts.length >= 2) {
      raw = parts.slice(1).join('=').trim()
    }
  }

  // Final check: if it still contains '=' or '/', it's likely still wrong but we'll try to use it
  // unless it clearly looks like a double-paste.
  return raw
}

const cleanEnv = (v?: string) =>
  v
    ?.trim()
    .replace(/^['"]|['"]$/g, '')
    .split('=')
    .pop()
    ?.trim() || ''

function getS3Client(): S3Client | null {
  const ACCESS_KEY = getAccessKeyId()
  const SECRET_KEY = cleanEnv(process.env.S3_SECRET_ACCESS_KEY)
  if (!BUCKET || !ACCESS_KEY || !SECRET_KEY || !ENDPOINT) return null
  const isR2 = ENDPOINT.includes('r2.cloudflarestorage.com')
  return new S3Client({
    credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
    region: process.env.S3_REGION || 'us-east-1',
    endpoint: ENDPOINT,
    forcePathStyle: true,
  })
}

export async function POST(request: NextRequest) {
  const accessKey = getAccessKeyId()
  if (process.env.S3_ACCESS_KEY_ID?.trim() && !accessKey) {
    return NextResponse.json(
      {
        error:
          "S3_ACCESS_KEY_ID invalide : ne doit contenir que l'Access Key ID (sans '=' ni '/'). Vérifiez la variable d'environnement (ex. dans Coolify).",
      },
      { status: 503 },
    )
  }
  if (!getS3Client()) {
    return NextResponse.json({ error: 'Upload direct R2 non configuré' }, { status: 503 })
  }

  let body: { filename?: string; mimeType?: string; filesize?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 })
  }

  const { filename, mimeType, filesize } = body
  if (!filename || typeof filename !== 'string' || !mimeType || typeof filesize !== 'number') {
    return NextResponse.json({ error: 'filename, mimeType et filesize requis' }, { status: 400 })
  }

  if (!SAFE_FILENAME.test(filename) || filename.length > 200) {
    return NextResponse.json({ error: 'Nom de fichier non autorisé' }, { status: 400 })
  }
  if (!ALLOWED_MIME.test(mimeType)) {
    return NextResponse.json(
      { error: 'Type MIME non autorisé (images et vidéos uniquement)' },
      { status: 400 },
    )
  }
  if (filesize <= 0 || filesize > MAX_SIZE) {
    return NextResponse.json(
      { error: `Taille invalide (max ${MAX_SIZE / 1024 / 1024} Mo)` },
      { status: 400 },
    )
  }

  const s3 = getS3Client()!
  const key = filename

  try {
    const url = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: BUCKET!,
        Key: key,
        ContentType: mimeType,
        ContentLength: filesize,
      }),
      { expiresIn: 600 },
    )
    return NextResponse.json({ url, key })
  } catch (err: any) {
    console.error('Presigned URL error:', err)
    return NextResponse.json({ error: 'Impossible de générer l’URL d’upload' }, { status: 500 })
  }
}
