/**
 * Generates public/sw.js with a unique CACHE_NAME at build time.
 * Run before `next build` so each deployment gets a new cache version.
 *
 * Version source (first available):
 * - SOURCE_COMMIT (Coolify)
 * - GIT_COMMIT (other CI)
 * - git rev-parse --short HEAD (local)
 * - timestamp (fallback)
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const swPath = path.join(root, 'public', 'sw.js')

function getVersion() {
  if (process.env.SOURCE_COMMIT && process.env.SOURCE_COMMIT !== 'HEAD') {
    return String(process.env.SOURCE_COMMIT).slice(0, 12)
  }
  if (process.env.GIT_COMMIT) {
    return String(process.env.GIT_COMMIT).slice(0, 12)
  }
  try {
    return execSync('git rev-parse --short=12 HEAD', { encoding: 'utf-8' }).trim()
  } catch {
    // no git or not a repo
  }
  return String(Date.now())
}

const version = getVersion()
const cacheName = `cartepostale-${version}`

let content = fs.readFileSync(swPath, 'utf-8')
content = content.replace(
  /const CACHE_NAME = '[^']+'/,
  `const CACHE_NAME = '${cacheName}'`
)
fs.writeFileSync(swPath, content)

console.log('[generate-sw] CACHE_NAME set to', cacheName)
