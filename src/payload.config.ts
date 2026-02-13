import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Agencies } from './collections/Agencies'
import { Postcards } from './collections/Postcards'
import { Templates } from './collections/Templates'
import { Reactions } from './collections/Reactions'
import { Comments } from './collections/Comments'
import { PostcardViewEvents } from './collections/PostcardViewEvents'
import { GalleryCategory } from './collections/GalleryCategory'
import { GalleryTag } from './collections/GalleryTag'
import { Gallery } from './collections/Gallery'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
// Local fallback ensures dev builds still run when DATABASE_URL is not set.
const databaseUrl =
  process.env.DATABASE_URL || 'postgres://localhost:5432/postgres'

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Agencies, Postcards, Templates, Reactions, Comments, PostcardViewEvents, GalleryCategory, GalleryTag, Gallery],
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
  plugins: [],
})
