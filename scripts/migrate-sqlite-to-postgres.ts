/**
 * 1. Creates Postgres tables (push schema) if needed.
 * 2. Imports data from SQLite (cartepostale-v2.db) into Postgres.
 *
 * Run with:
 *   DATABASE_URL="postgres://..." pnpm exec tsx scripts/migrate-sqlite-to-postgres.ts
 *
 * SQLite file path: ./cartepostale-v2.db (from project root)
 */

import { readFileSync } from 'fs'
import { getPayload } from 'payload'
import pg from 'pg'
import path from 'path'
import { fileURLToPath } from 'url'
// @ts-expect-error sql.js has no types
import initSqlJs from 'sql.js'

import config from '../src/payload.config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const sqlitePath = path.join(projectRoot, 'cartepostale-v2.db')

const USER_COLUMNS = [
  'id',
  'name',
  'role',
  'company',
  'cards_created',
  'plan',
  'updated_at',
  'created_at',
  'email',
  'reset_password_token',
  'reset_password_expiration',
  'salt',
  'hash',
  'login_attempts',
  'lock_until',
] as const

async function ensurePostgresTables(): Promise<void> {
  if (!process.env.DATABASE_URL?.startsWith('postgres')) {
    throw new Error('Set DATABASE_URL to your Postgres connection string.')
  }
  await getPayload({ config })
  // Connection triggers pushDevSchema in dev; tables are created
  console.log('Postgres connected; schema pushed.')
}

async function migrateUsersFromSqliteToPostgres(): Promise<void> {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl?.startsWith('postgres')) throw new Error('DATABASE_URL (Postgres) is required.')

  const SQL = await initSqlJs()
  const fileBuffer = readFileSync(sqlitePath)
  const db = new SQL.Database(fileBuffer)

  const client = new pg.Client({ connectionString: dbUrl })

  try {
    await client.connect()

    const result = db.exec(`SELECT ${USER_COLUMNS.join(', ')} FROM users`)
    const first = result[0]
    if (!first || !first.values?.length) {
      console.log('No users in SQLite; skipping users.')
      return
    }

    const columns = USER_COLUMNS.join(', ')
    const placeholders = USER_COLUMNS.map((_, i) => `$${i + 1}`).join(', ')
    const insertSql = `INSERT INTO users (${columns}) VALUES (${placeholders}) ON CONFLICT (id) DO NOTHING`

    for (const rowValues of first.values) {
      await client.query(insertSql, rowValues)
    }

    const maxIdResult = await client.query(
      'SELECT COALESCE(MAX(id), 0)::int AS max_id FROM users',
    )
    const maxId = maxIdResult.rows[0]?.max_id ?? 0
    await client.query(`SELECT setval(pg_get_serial_sequence('users', 'id'), $1)`, [maxId])

    console.log(`Users: ${first.values.length} row(s) imported.`)
  } finally {
    db.close()
    await client.end()
  }
}

async function main(): Promise<void> {
  await ensurePostgresTables()
  await migrateUsersFromSqliteToPostgres()
  console.log('Migration done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
