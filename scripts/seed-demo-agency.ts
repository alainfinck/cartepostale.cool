/**
 * Seed script: Demo Agency "Voyages Lumière"
 *
 * Creates a fully populated demo travel agency with:
 * - Agency record with logo & branding
 * - Gallery categories: Mer & Plages, Villes d'Art, Montagnes, Hôtels & Resorts
 * - Gallery tags: europe, méditerranée, tropical, luxe, culture, famille
 * - Gallery images using local files in public/images/demo/
 * - A demo agency user (agence role)
 *
 * Run: npx tsx scripts/seed-demo-agency.ts
 */

import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '../.env') })

import { getPayload } from 'payload'
import type { PayloadRequest } from 'payload'
import config from '../src/payload.config'

type PayloadClient = Awaited<ReturnType<typeof getPayload>>

const DEMO_AGENCY_CODE = 'voyages-lumiere-demo'
const DEMO_USER_EMAIL = 'demo@voyages-lumiere.fr'
const LOCAL_IMAGES_DIR = path.resolve(__dirname, '../public/images/demo')

// Local demo images (matching the files the user uploaded)
const DEMO_IMAGES = [
  // Mer & Plages
  {
    filename: 'demo_beach_maldives_1771746866734.png',
    alt: 'Plage tropicale aux Maldives',
    title: 'Maldives – Plage paradisiaque',
    caption: "Les eaux cristallines des Maldives, parfaites pour s'évader",
    categorySlug: 'mer-plages',
    tags: ['tropical', 'luxe'],
    order: 1,
  },
  {
    filename: 'photo-1507525428034-b723cf961d3e.jpg',
    alt: 'Plage turquoise',
    title: 'Destinations Tropicales',
    caption: 'Le bleu turquoise à perte de vue',
    categorySlug: 'mer-plages',
    tags: ['tropical', 'famille'],
    order: 2,
  },
  {
    filename: 'photo-1488646953014-85cb44e25828.jpg',
    alt: 'Vue aérienne plage',
    title: "L'aventure commence ici",
    caption: 'Prêt pour le grand départ ?',
    categorySlug: 'mer-plages',
    tags: ['europe', 'famille'],
    order: 3,
  },
  // Villes d'Art & Culture
  {
    filename: 'demo_paris_eiffel_1771746884932.png',
    alt: 'Tour Eiffel Paris',
    title: 'Paris – La Ville Lumière',
    caption: "Paris, capitale du romantisme et de l'art de vivre",
    categorySlug: 'villes-art',
    tags: ['europe', 'culture'],
    order: 4,
  },
  {
    filename: 'photo-1534113414509-0eec2bfb493f.jpg',
    alt: 'Architecture classique',
    title: 'Patrimoine & Culture',
    caption: "Découvrez l'histoire des plus grandes cités",
    categorySlug: 'villes-art',
    tags: ['europe', 'culture'],
    order: 5,
  },
  {
    filename: 'demo_morocco_1771746946024.png',
    alt: 'Médina de Marrakech',
    title: 'Marrakech – La Ville Ocre',
    caption: 'Les souks colorés et la magie orientale de Marrakech',
    categorySlug: 'villes-art',
    tags: ['culture', 'famille'],
    order: 6,
  },
  // Méditerranée & Îles
  {
    filename: 'demo_santorini_1771746924198.png',
    alt: 'Santorin vue panoramique',
    title: 'Santorin – Coucher de soleil à Oia',
    caption: "Les maisons blanches et dômes bleus emblématiques de l'île volcanique",
    categorySlug: 'mediterranee',
    tags: ['europe', 'méditerranée', 'luxe'],
    order: 7,
  },
  {
    filename: 'photo-1520629411511-eb4407764282.jpg',
    alt: 'Méditerranée',
    title: 'Escales Méditerranéennes',
    caption: 'Un air de dolce vita',
    categorySlug: 'mediterranee',
    tags: ['europe', 'méditerranée', 'culture'],
    order: 8,
  },
  // Hôtels & Resorts
  {
    filename: 'photo-1520250497591-112f2f40a3f4.jpg',
    alt: 'Piscine Resort',
    title: 'Expériences Bien-être',
    caption: 'Détente absolue dans nos hôtels partenaires',
    categorySlug: 'hotels-resorts',
    tags: ['luxe', 'tropical'],
    order: 9,
  },
  {
    filename: 'demo_hotel_pool_1771746967145.png',
    alt: 'Piscine à débordement resort',
    title: 'Resort de Luxe – Piscine à débordement',
    caption: "La piscine à débordement avec vue sur l'océan, l'apogée de la détente",
    categorySlug: 'hotels-resorts',
    tags: ['luxe', 'tropical'],
    order: 10,
  },
  {
    filename: 'photo-1556761175-5973dc0f32e7.jpg',
    alt: 'Intérieur de standing',
    title: "Hôtellerie d'Exception",
    caption: 'Le confort ultime pour votre séjour',
    categorySlug: 'hotels-resorts',
    tags: ['luxe', 'culture'],
    order: 11,
  },
]

const CATEGORIES = [
  {
    name: 'Mer & Plages',
    slug: 'mer-plages',
    description: 'Destinations balnéaires, plages et îles',
  },
  {
    name: "Villes d'Art & Culture",
    slug: 'villes-art',
    description: 'Capitales européennes et cités historiques',
  },
  {
    name: 'Méditerranée & Îles',
    slug: 'mediterranee',
    description: 'Grèce, Italie, Espagne et pourtour méditerranéen',
  },
  {
    name: 'Hôtels & Resorts',
    slug: 'hotels-resorts',
    description: "Nos établissements partenaires d'exception",
  },
]

const TAGS = [
  { name: 'Europe', slug: 'europe' },
  { name: 'Méditerranée', slug: 'méditerranée' },
  { name: 'Tropical', slug: 'tropical' },
  { name: 'Luxe', slug: 'luxe' },
  { name: 'Culture', slug: 'culture' },
  { name: 'Famille', slug: 'famille' },
]

const adminRequestStub: Partial<PayloadRequest> = {
  user: {
    id: '1',
    email: 'admin@cartepostale.local',
    role: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    collection: 'users',
  } as any,
}

function getLocalFileAsBuffer(filename: string): Buffer {
  const filePath = path.join(LOCAL_IMAGES_DIR, filename)
  if (!fs.existsSync(filePath)) {
    throw new Error(`Local file not found: ${filePath}`)
  }
  return fs.readFileSync(filePath)
}

async function cleanup(payload: PayloadClient) {
  console.log('🧹 Cleaning up existing demo agency data...')

  // Find existing demo agency
  const existingAgency = await payload.find({
    collection: 'agencies',
    where: { code: { equals: DEMO_AGENCY_CODE } },
    limit: 1,
    depth: 0,
  })

  const agencyDocs = existingAgency.docs
  if (agencyDocs.length > 0) {
    const agencyIdValue = agencyDocs[0].id

    // Delete gallery items for this agency
    await payload.delete({
      collection: 'gallery',
      where: { agency: { equals: agencyIdValue } },
    })
    console.log('  ✓ Deleted gallery items')

    // Delete gallery categories for this agency
    await payload.delete({
      collection: 'gallery-categories',
      where: { agency: { equals: agencyIdValue } },
    })
    console.log('  ✓ Deleted gallery categories')

    // Delete gallery tags for this agency
    await payload.delete({
      collection: 'gallery-tags',
      where: { agency: { equals: agencyIdValue } },
    })
    console.log('  ✓ Deleted gallery tags')

    // Delete the agency
    await payload.delete({
      collection: 'agencies',
      id: agencyIdValue,
    })
    console.log('  ✓ Deleted agency')
  }

  // Delete demo user
  await payload.delete({
    collection: 'users',
    where: { email: { equals: DEMO_USER_EMAIL } },
  })
  console.log('  ✓ Deleted demo user')
}

async function main() {
  console.log('🚀 Starting demo agency seed: Voyages Lumière (Local Assets)\n')
  const payload = await getPayload({ config })

  await cleanup(payload)

  // ── 1. Create Agency Logo (using local demo logo) ──
  console.log('\n📸 Creating agency logo media...')
  let logoMediaId: string | number | null = null
  try {
    const logoFilename = 'demo_agency_logo_1771746901678.png'
    const logoBuffer = getLocalFileAsBuffer(logoFilename)
    const logoDoc = await payload.create({
      collection: 'media',
      data: { alt: 'Logo Voyages Lumière' },
      file: {
        data: logoBuffer,
        mimetype: 'image/png',
        name: `voyages-lumiere-logo-${Date.now()}.png`,
        size: logoBuffer.length,
      },
    })
    logoMediaId = logoDoc.id
    console.log('  ✓ Logo created')
  } catch (e) {
    console.warn('  ⚠ Could not find local logo, trying default one:', (e as Error).message)
    try {
      const altLogo = 'photo-1486406146926-c627a92ad1ab.jpg'
      const logoBuffer = getLocalFileAsBuffer(altLogo)
      const logoDoc = await payload.create({
        collection: 'media',
        data: { alt: 'Logo Voyages Lumière' },
        file: {
          data: logoBuffer,
          mimetype: 'image/jpeg',
          name: `voyages-lumiere-logo-${Date.now()}.jpg`,
          size: logoBuffer.length,
        },
      })
      logoMediaId = logoDoc.id
      console.log('  ✓ Logo created (via fallback)')
    } catch (fallbackErr) {
      console.warn('  ⚠ No logo found at all, continuing without logo')
    }
  }

  // ── 2. Create Agency ──
  console.log('\n🏢 Creating demo agency: Voyages Lumière...')
  const agency = await payload.create({
    collection: 'agencies',
    data: {
      name: 'Voyages Lumière',
      code: DEMO_AGENCY_CODE,
      address: '12 rue de la Paix',
      city: 'Paris',
      region: 'Île-de-France',
      country: 'France',
      phone: '+33 1 23 45 67 89',
      email: 'contact@voyages-lumiere.fr',
      website: 'https://voyages-lumiere.fr',
      primaryColor: '#0d9488', // teal-600
      logo: logoMediaId || undefined,
      imageBank: [],
      qrCodeUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://cartepostale.cool'}/agences/demo`,
    },
  })
  console.log(`  ✓ Agency created (ID: ${agency.id})`)

  // ── 3. Create Gallery Categories ──
  console.log('\n📂 Creating gallery categories...')
  const categoryMap: Record<string, string | number> = {}
  for (const cat of CATEGORIES) {
    const doc = await payload.create({
      collection: 'gallery-categories',
      data: {
        name: cat.name,
        description: cat.description,
        agency: agency.id,
      } as any,
    })
    categoryMap[cat.slug] = doc.id
    console.log(`  ✓ Category: ${cat.name}`)
  }

  // ── 4. Create Gallery Tags ──
  console.log('\n🏷️  Creating gallery tags...')
  const tagMap: Record<string, string | number> = {}
  for (const tag of TAGS) {
    const doc = await payload.create({
      collection: 'gallery-tags',
      data: {
        name: tag.name,
        agency: agency.id,
      } as any,
    })
    tagMap[tag.slug] = doc.id
    console.log(`  ✓ Tag: ${tag.name}`)
  }

  // ── 5. Create Gallery Images ──
  console.log('\n🖼️  Creating gallery images (using local assets)...')
  let successCount = 0
  let errorCount = 0

  for (const img of DEMO_IMAGES) {
    try {
      // Create media record
      let mediaId: string | number | null = null
      try {
        const buffer = getLocalFileAsBuffer(img.filename)
        const ext = img.filename.split('.').pop()?.toLowerCase() || 'jpg'
        const mime = ext === 'png' ? 'image/png' : 'image/jpeg'
        const mediaDoc = await payload.create({
          collection: 'media',
          data: { alt: img.alt },
          file: {
            data: buffer,
            mimetype: mime,
            name: `demo-gallery-${img.order}-${Date.now()}.${ext}`,
            size: buffer.length,
          },
        })
        mediaId = mediaDoc.id
      } catch (fileErr) {
        console.warn(`  ⚠ Cannot find local image for "${img.title}":`, (fileErr as Error).message)
        continue
      }

      // Resolve category and tag IDs
      const catId = categoryMap[img.categorySlug]
      const tagIds = img.tags.map((t) => tagMap[t]).filter(Boolean)

      // Create gallery item
      await payload.create({
        collection: 'gallery',
        data: {
          title: img.title,
          image: mediaId as any,
          caption: img.caption,
          category: catId as any,
          tags: tagIds as any,
          agency: agency.id,
          order: img.order,
          views: Math.floor(Math.random() * 150) + 20,
          usages: Math.floor(Math.random() * 30) + 2,
        },
      })

      console.log(`  ✓ [${img.order}/11] ${img.title}`)
      successCount++
    } catch (e) {
      console.error(`  ✗ Error creating gallery item "${img.title}":`, (e as Error).message)
      errorCount++
    }
  }

  // ── 6. Create Demo Agency User ──
  console.log('\n👤 Creating demo agency user...')
  try {
    await payload.create({
      collection: 'users',
      data: {
        email: DEMO_USER_EMAIL,
        password: 'Demo2026!',
        name: 'Sophie Martin (Démo)',
        role: 'agence',
        agency: agency.id,
        plan: 'pro',
        cardsCreated: 0,
      } as any,
      req: adminRequestStub as any,
    })
    console.log(`  ✓ Demo user created: ${DEMO_USER_EMAIL}`)
  } catch (e) {
    console.warn('  ⚠ Could not create demo user:', (e as Error).message)
  }

  // ── Summary ──
  console.log('\n' + '═'.repeat(60))
  console.log('✅ Demo agency seeded successfully!')
  console.log('═'.repeat(60))
  console.log(`📌 Agency: Voyages Lumière (ID: ${agency.id}, code: ${DEMO_AGENCY_CODE})`)
  console.log(`📂 Categories: ${Object.keys(categoryMap).length}`)
  console.log(`🏷️  Tags: ${Object.keys(tagMap).length}`)
  console.log(`🖼️  Gallery items: ${successCount} created, ${errorCount} errors`)
  console.log(`👤 Demo user: ${DEMO_USER_EMAIL} (password: Demo2026!)`)
  console.log('\n🔗 Demo page: /agences/demo')
  console.log('🔗 Agency login: /espace-agence/login')
  console.log('═'.repeat(60))

  process.exit(0)
}

main().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
