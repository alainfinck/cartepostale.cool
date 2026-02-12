/**
 * Génère salt et hash au format Payload (PBKDF2) et insère l'utilisateur en SQLite.
 * Run: node scripts/create-user-direct.mjs
 */
import crypto from 'crypto'
import { execSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const EMAIL = 'alain@wallprint.fr'
const PASSWORD = 'caldera'
const NAME = 'Alain'

function randomBytes() {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(32, (err, buf) => (err ? reject(err) : resolve(buf)))
  })
}

function pbkdf2(password, salt) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 25000, 512, 'sha256', (err, hashRaw) =>
      err ? reject(err) : resolve(hashRaw)
    )
  })
}

async function generateSaltHash(password) {
  const saltBuffer = await randomBytes()
  const salt = saltBuffer.toString('hex')
  // Payload utilise le salt comme chaîne UTF-8, pas comme buffer hex décodé
  const hashRaw = await pbkdf2(password, salt)
  const hash = hashRaw.toString('hex')
  return { salt, hash }
}

async function main() {
  const dbPath = path.join(__dirname, '..', 'cartepostale-v2.db')
  if (!fs.existsSync(dbPath)) {
    console.error('DB not found:', dbPath)
    process.exit(1)
  }

  const existing = execSync(`sqlite3 "${dbPath}" "SELECT id FROM users WHERE email = '${EMAIL}';"`, {
    encoding: 'utf8',
  }).trim()
  if (existing) {
    console.log('Utilisateur', EMAIL, 'existe déjà. Connectez-vous sur http://localhost:3000/connexion')
    process.exit(0)
    return
  }

  const { salt, hash } = await generateSaltHash(PASSWORD)
  const now = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
  const nameVal = NAME ? `'${NAME.replace(/'/g, "''")}'` : 'NULL'
  const sql = `INSERT INTO users (email, name, role, company, cards_created, plan, salt, hash, updated_at, created_at) VALUES ('${EMAIL}', ${nameVal}, 'user', NULL, 0, 'free', '${salt}', '${hash}', '${now}', '${now}');`
  execSync(`sqlite3 "${dbPath}" "${sql}"`)

  console.log('Compte créé :', EMAIL)
  console.log('Connectez-vous sur http://localhost:3000/connexion puis accédez au tableau de bord : http://localhost:3000/espace-client')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
