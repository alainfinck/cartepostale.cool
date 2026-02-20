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
    if (tables.length > 0) {
      console.log('Tables in SQLite:', tables[0].values.flat())
    }

    const posts = db.exec('SELECT count(*) FROM posts')
    if (posts.length > 0 && posts[0].values.length > 0) {
      const count = posts[0].values[0][0] as number
      console.log('Posts in SQLite:', count)

      if (count > 0) {
        const postTitles = db.exec('SELECT title FROM posts LIMIT 5')
        if (postTitles.length > 0) {
          console.log('Sample post titles:', postTitles[0].values.flat())
        }
      }
    }
  } catch (e) {
    console.error('Error reading SQLite:', e)
  } finally {
    db.close()
  }
}

checkSqlite()
