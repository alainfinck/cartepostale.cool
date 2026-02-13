#!/usr/bin/env node
/**
 * Télécharge toutes les images Unsplash utilisées en démo dans public/images/demo/
 * pour éviter les 404 et ne plus dépendre des URLs Unsplash.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, '..', 'public', 'images', 'demo')

const UNSPLASH_PHOTO_IDS = [
  '1507525428034-b723cf961d3e',
  '1476514525535-07fb3b4ae5f1',
  '1502602898657-3e91760cbb34',
  '1540959733332-eab4deabeeaf',
  '1531366936337-7c912a4589a7',
  '1534113414509-0eec2bfb493f',
  '1448375240586-882707db888b',
  '1509316785289-025f5b846b35',
  '1520250497591-112f2f40a3f4',
  '1520629411511-eb4407764282',
  '1493976040374-85c8e12f0c0e',
  '1528164344705-47542687000d',
  '1503614472-8c93d56e92ce',
  '1439396087961-99bc12bd8959',
  '1530103043960-ef38714abb15',
  '1516426122078-c23e76319801',
  '1549366021-9f761d450615',
  '1596394516093-501ba68a0ba6',
  '1486074218988-66a98816c117',
  '1527529482837-4698179dc6ce',
  '1501785888041-af3ef285b470',
  '1474044159687-1ee9f3a51722',
  '1527333656061-ca7adf608ae1',
  '1506929562872-bb421503ef21',
  '1552465011-b4e21bf6e79a',
  '1483347756197-71ef80e95f73',
  '1488646953014-85cb44e25828',
  '1486406146926-c627a92ad1ab',
  '1556761175-5973dc0f32e7',
  '1499856871958-5b9627545d1a',
]

async function downloadOne(id) {
  const slug = `photo-${id}`
  const url = `https://images.unsplash.com/${slug}?auto=format&fit=crop&w=1200&q=85`
  const outPath = path.join(OUT_DIR, `${slug}.jpg`)
  if (fs.existsSync(outPath)) {
    console.log(`Skip (exists): ${slug}.jpg`)
    return
  }
  try {
    const res = await fetch(url, { redirect: 'follow' })
    if (!res.ok) throw new Error(`HTTP ${res.ok}`)
    const buf = Buffer.from(await res.arrayBuffer())
    fs.writeFileSync(outPath, buf)
    console.log(`OK: ${slug}.jpg`)
  } catch (err) {
    console.error(`FAIL: ${slug} - ${err.message}`)
  }
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })
  for (const id of UNSPLASH_PHOTO_IDS) {
    await downloadOne(id)
    await new Promise((r) => setTimeout(r, 200))
  }
  console.log('Done.')
}

main()
