import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { s3Storage } from '@payloadcms/storage-s3'

import { authjsPlugin } from 'payload-authjs'
import { authConfig } from './auth.config'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Agencies } from './collections/Agencies'
import { Postcards } from './collections/Postcards'
import { Templates } from './collections/Templates'
import { Reactions } from './collections/Reactions'
import { Comments } from './collections/Comments'
import { PostcardViewEvents } from './collections/PostcardViewEvents'
import { PostcardTrackingLinks } from './collections/PostcardTrackingLinks'
import { GalleryCategory } from './collections/GalleryCategory'
import { GalleryTag } from './collections/GalleryTag'
import { Gallery } from './collections/Gallery'
import { Stickers } from './collections/Stickers'
import { Posts } from './collections/Posts'
import { EmailTemplates } from './collections/EmailTemplates'
import { Feedback } from './collections/Feedback'
import { EditorPreviews } from './collections/EditorPreviews'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
// Local fallback ensures dev builds still run when DATABASE_URL is not set.
const databaseUrl = process.env.DATABASE_URL || 'postgres://localhost:5432/postgres'

// S3-compatible storage (AWS S3, Cloudflare R2, Minio, etc.) for production.
// When S3_BUCKET is set, uploads go to the bucket instead of local disk (avoids losing files on Coolify/Docker restarts).
const cleanEnvVar = (val?: string) => {
  if (!val) return ''
  const trimmed = val.trim()
  if (trimmed.includes('=')) {
    const parts = trimmed.split('=')
    return parts[parts.length - 1].trim().replace(/^['"]|['"]$/g, '')
  }
  return trimmed.replace(/^['"]|['"]$/g, '')
}

const S3_ACCESS_KEY_ID = cleanEnvVar(process.env.S3_ACCESS_KEY_ID)
const S3_SECRET_ACCESS_KEY = cleanEnvVar(process.env.S3_SECRET_ACCESS_KEY)

const useS3 =
  Boolean(process.env.S3_BUCKET) && Boolean(S3_ACCESS_KEY_ID) && Boolean(S3_SECRET_ACCESS_KEY)

const isR2 = process.env.S3_ENDPOINT?.includes('r2.cloudflarestorage.com')
const defaultRegion = 'us-east-1'

const plugins = [
  authjsPlugin({
    authjsConfig: authConfig,
    enableLocalStrategy: true,
  }),
  ...(useS3
    ? [
        s3Storage({
          clientUploads: true, // Upload direct vers R2 via presigned URL (navigateur → R2, sans passer par le serveur)
          collections: {
            media: {
              disablePayloadAccessControl: true, // Media is public (read: () => true), use direct bucket URLs
              // R2: S3 API endpoint is not publicly readable; use R2_PUBLIC_BASE_URL (R2.dev subdomain or custom domain)
              ...(process.env.R2_PUBLIC_BASE_URL && {
                generateFileURL: ({ filename, prefix }) => {
                  const base = process.env.R2_PUBLIC_BASE_URL!.replace(/\/$/, '')
                  // Encode each path segment individually to preserve '/' as path separators
                  // (the filename can be a full R2 key like "postcards/album-photo.jpg")
                  const encodedFilename = filename
                    .split('/')
                    .map(encodeURIComponent)
                    .join('/')
                  const path = [prefix, encodedFilename].filter(Boolean).join('/')
                  return `${base}/${path}`
                },
              }),
            },
          },
          bucket: process.env.S3_BUCKET!,
          config: {
            credentials: {
              accessKeyId: S3_ACCESS_KEY_ID,
              secretAccessKey: S3_SECRET_ACCESS_KEY,
            },
            region: process.env.S3_REGION || defaultRegion,
            ...(process.env.S3_ENDPOINT && {
              endpoint: process.env.S3_ENDPOINT,
              forcePathStyle: true,
            }),
          },
        }),
      ]
    : []),
]

import { Leads } from './collections/Leads'
import { Settings } from './globals/Settings'

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    Agencies,
    Postcards,
    Templates,
    Reactions,
    Comments,
    PostcardViewEvents,
    PostcardTrackingLinks,
    GalleryCategory,
    GalleryTag,
    Gallery,
    Stickers,
    Leads,
    Posts,
    EmailTemplates,
    Feedback,
    EditorPreviews,
  ],
  globals: [Settings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: databaseUrl,
    },
  }),
  sharp,
  plugins,
})
