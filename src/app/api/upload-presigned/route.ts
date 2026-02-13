/**
 * Génère une URL présignée pour upload direct navigateur → R2 (éditeur public).
 * Pas d’auth requise ; limité aux images, taille max 10 Mo, nom de fichier sécurisé.
 */

import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const BUCKET = process.env.S3_BUCKET
const ENDPOINT = process.env.S3_ENDPOINT
const ACCESS_KEY = process.env.S3_ACCESS_KEY_ID
const SECRET_KEY = process.env.S3_SECRET_ACCESS_KEY
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB
const IMAGE_MIME = /^image\/(jpeg|jpg|png|webp|gif)$/i
const SAFE_FILENAME = /^[a-zA-Z0-9._-]+$/

function getS3Client(): S3Client | null {
  if (!BUCKET || !ACCESS_KEY || !SECRET_KEY || !ENDPOINT) return null
  const isR2 = ENDPOINT.includes('r2.cloudflarestorage.com')
  return new S3Client({
    credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
    region: process.env.S3_REGION || (isR2 ? 'auto' : 'us-east-1'),
    endpoint: ENDPOINT,
    forcePathStyle: true,
  })
}

export async function POST(request: NextRequest) {
  if (!getS3Client()) {
    return NextResponse.json(
      { error: 'Upload direct R2 non configuré' },
      { status: 503 }
    )
  }

  let body: { filename?: string; mimeType?: string; filesize?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Body JSON invalide' },
      { status: 400 }
    )
  }

  const { filename, mimeType, filesize } = body
  if (!filename || typeof filename !== 'string' || !mimeType || typeof filesize !== 'number') {
    return NextResponse.json(
      { error: 'filename, mimeType et filesize requis' },
      { status: 400 }
    )
  }

  if (!SAFE_FILENAME.test(filename) || filename.length > 200) {
    return NextResponse.json(
      { error: 'Nom de fichier non autorisé' },
      { status: 400 }
    )
  }
  if (!IMAGE_MIME.test(mimeType)) {
    return NextResponse.json(
      { error: 'Type MIME non autorisé (images uniquement)' },
      { status: 400 }
    )
  }
  if (filesize <= 0 || filesize > MAX_SIZE) {
    return NextResponse.json(
      { error: `Taille invalide (max ${MAX_SIZE / 1024 / 1024} Mo)` },
      { status: 400 }
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
      { expiresIn: 600 }
    )
    return NextResponse.json({ url, key })
  } catch (err: any) {
    console.error('Presigned URL error:', err)
    return NextResponse.json(
      { error: 'Impossible de générer l’URL d’upload' },
      { status: 500 }
    )
  }
}
