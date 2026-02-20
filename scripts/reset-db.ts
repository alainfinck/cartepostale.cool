import { pgTable, text } from 'drizzle-orm/pg-core'
import { pgSchema } from 'drizzle-orm/pg-core'
import pkg from 'pg'
import dotenv from 'dotenv'
dotenv.config()
const { Client } = pkg

async function reset() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('DATABASE_URL is not set')
    process.exit(1)
  }

  const client = new Client({
    connectionString,
  })

  try {
    console.log('Connecting to database...')
    await client.connect()

    console.log('Dropping schema public...')
    await client.query('DROP SCHEMA public CASCADE;')

    console.log('Recreating schema public...')
    await client.query('CREATE SCHEMA public;')
    await client.query('GRANT ALL ON SCHEMA public TO postgres;')
    await client.query('GRANT ALL ON SCHEMA public TO public;')

    console.log('Database reset successfully!')
  } catch (err) {
    console.error('Error resetting database:', err)
  } finally {
    await client.end()
  }
}

reset()
