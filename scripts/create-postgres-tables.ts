/**
 * Initializes Postgres and creates all Payload tables (push schema).
 * Run with: DATABASE_URL="postgres://..." pnpm exec tsx scripts/create-postgres-tables.ts
 */
import { getPayload } from 'payload'
import config from '../src/payload.config'

async function main() {
  if (!process.env.DATABASE_URL?.startsWith('postgres')) {
    console.error('Set DATABASE_URL to your Postgres connection string.')
    process.exit(1)
  }
  const payload = await getPayload({ config })
  console.log('Postgres connected and schema pushed. Tables are ready.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
