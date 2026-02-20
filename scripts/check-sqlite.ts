import initSqlJs from 'sql.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function checkSqlite() {
  const SQL = await initSqlJs()
  const sqlitePath = path.resolve(__dirname, '../cartepostale-v2.db')

  if (!fs.existsSync(sqlitePath)) {
    console.error('SQLite file not found at:', sqlitePath)
    return
  }

  const fileBuffer = fs.readFileSync(sqlitePath)
  const db = new SQL.Database(fileBuffer)

  try {
    const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table'")
    console.log('Tables in SQLite:', tables[0]?.values.flat())

    const posts = db.exec('SELECT count(*) FROM posts')
    console.log('Posts in SQLite:', posts[0]?.values[0][0])

    if (posts[0]?.values[0][0] > 0) {
      const postTitles = db.exec('SELECT title FROM posts LIMIT 5')
      console.log('Sample post titles:', postTitles[0]?.values.flat())
    }
  } catch (e) {
    console.error('Error reading SQLite:', e)
  } finally {
    db.close()
  }
}

checkSqlite()
