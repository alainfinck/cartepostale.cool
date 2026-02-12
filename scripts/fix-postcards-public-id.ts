/**
 * One-time fix: add public_id column to postcards table so Payload push migration can succeed.
 * Run: pnpm exec tsx scripts/fix-postcards-public-id.ts
 */
import { createClient } from '@libsql/client'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const dbUrl = process.env.DATABASE_URL || 'file:./cartepostale-v2.db'
const dbPath = dbUrl.replace(/^file:/i, '')
const absoluteUrl =
  path.isAbsolute(dbPath) ? dbUrl : `file:${path.join(projectRoot, dbPath)}`

const client = createClient({ url: absoluteUrl })

async function main() {
  console.log('Checking postcards table...')

  const tableInfo = await client.execute({
    sql: 'PRAGMA table_info(postcards)',
    args: [],
  })

  const hasPublicId = tableInfo.rows.some(
    (r) => (r as { name: string }).name === 'public_id',
  )

  if (!hasPublicId) {
    console.log('Adding public_id column to postcards...')
    await client.execute({
      sql: 'ALTER TABLE postcards ADD COLUMN public_id TEXT',
      args: [],
    })
    console.log('Backfilling public_id for existing rows...')
    await client.execute({
      sql: "UPDATE postcards SET public_id = 'legacy-' || id WHERE public_id IS NULL",
      args: [],
    })
    console.log('Done: public_id added and backfilled.')
  } else {
    console.log('Column public_id already exists.')
  }

  console.log('Dropping __new_postcards if present (failed migration leftover)...')
  await client.execute({
    sql: 'DROP TABLE IF EXISTS __new_postcards',
    args: [],
  })
  console.log('Done. You can restart the app; Payload push should succeed.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
