/**
 * Seed script: Demo Agency "Voyages Lumière"
 *
 * Creates a fully populated demo travel agency with:
 * - Agency record with logo & branding
 * - Gallery categories: Mer & Plages, Villes d'Art, Montagnes, Hôtels & Resorts
 * - Gallery tags: europe, méditerranée, tropical, luxe, culture, famille
 * - Gallery images using public Unsplash/demo images
 * - A demo agency user (agence role)
 *
 * Run: npx tsx scripts/seed-demo-agency.ts
 */

import dotenv from 'dotenv'
import path from 'path'
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

// Public demo image URLs (from Cloudflare R2 public bucket or Unsplash demo)
const DEMO_IMAGES = [
  // Mer & Plages
  {
    url: 'https://img.cartepostale.cool/demo/photo-1507525428034-b723cf961d3e.jpg',
    alt: 'Plage tropicale aux Maldives',
    title: 'Maldives – Plage paradisiaque',
    caption: "Les eaux cristallines des Maldives, parfaites pour s'évader",
    categorySlug: 'mer-plages',
    tags: ['tropical', 'luxe'],
    order: 1,
  },
  {
    url: 'https://img.cartepostale.cool/demo/photo-1544644181-1484b3fdfc62.jpg',
    alt: 'Plage de sable blanc en Thaïlande',
    title: 'Thaïlande – Ko Phi Phi',
    caption: "Falaises calcaires et mer turquoise au coeur de l'Asie du Sud-Est",
    categorySlug: 'mer-plages',
    tags: ['tropical', 'famille'],
    order: 2,
  },
  {
    url: 'https://img.cartepostale.cool/demo/photo-1519046904884-53103b34b206.jpg',
    alt: 'Coucher de soleil sur la plage',
    title: 'Îles Canaries – Fuerteventura',
    caption: "Les plages sauvages des Canaries baignées par l'Atlantique",
    categorySlug: 'mer-plages',
    tags: ['europe', 'famille'],
    order: 3,
  },
  // Villes d'Art & Culture
  {
    url: 'https://img.cartepostale.cool/demo/photo-1499856374031-44e31b8f5d63.jpg',
    alt: 'Tour Eiffel Paris',
    title: 'Paris – La Ville Lumière',
    caption: 'Paris, capitale du romantisme et de la haute couture',
    categorySlug: 'villes-art',
    tags: ['europe', 'culture'],
    order: 4,
  },
  {
    url: 'https://img.cartepostale.cool/demo/photo-1467269204594-9661b134dd2b.jpg',
    alt: 'Vieille ville de Prague',
    title: 'Prague – La Ville aux Cent Clochers',
    caption: 'La magie médiévale de la capitale tchèque',
    categorySlug: 'villes-art',
    tags: ['europe', 'culture'],
    order: 5,
  },
  {
    url: 'https://img.cartepostale.cool/demo/photo-1526392060635-9d6019884377.jpg',
    alt: 'Médina de Marrakech',
    title: 'Marrakech – La Ville Ocre',
    caption: 'Les souks colorés et la magie orientale de Marrakech',
    categorySlug: 'villes-art',
    tags: ['culture', 'famille'],
    order: 6,
  },
  // Méditerranée & Îles
  {
    url: 'https://img.cartepostale.cool/demo/photo-1570077188670-e3a8d69ac5ff.jpg',
    alt: 'Santorin vue panoramique',
    title: 'Santorin – Coucher de soleil à Oia',
    caption: "Les maisons blanches et dômes bleus emblématiques de l'île volcanique",
    categorySlug: 'mediterranee',
    tags: ['europe', 'méditerranée', 'luxe'],
    order: 7,
  },
  {
    url: 'https://img.cartepostale.cool/demo/photo-1541628951107-a9af5346a3e4.jpg',
    alt: 'Côte Amalfitaine Italie',
    title: 'Côte Amalfitaine – Positano',
    caption: 'Les villages colorés suspendus au-dessus de la Méditerranée',
    categorySlug: 'mediterranee',
    tags: ['europe', 'méditerranée', 'culture'],
    order: 8,
  },
  // Hôtels & Resorts
  {
    url: 'https://img.cartepostale.cool/demo/photo-1582719478250-c89cae4dc85b.jpg',
    alt: 'Chambre overwater bungalow',
    title: 'Overwater Bungalow – Bora Bora',
    caption: "Séjour d'exception dans un bungalow sur pilotis au-dessus du lagon",
    categorySlug: 'hotels-resorts',
    tags: ['luxe', 'tropical'],
    order: 9,
  },
  {
    url: 'https://img.cartepostale.cool/demo/photo-1551882547-ff40c63fe2fa.jpg',
    alt: 'Piscine à débordement resort',
    title: 'Resort de Luxe – Piscine à débordement',
    caption: "La piscine à débordement avec vue sur l'océan, l'apogée de la détente",
    categorySlug: 'hotels-resorts',
    tags: ['luxe', 'tropical'],
    order: 10,
  },
  {
    url: 'https://img.cartepostale.cool/demo/photo-1571003123894-1f0594d2b5d9.jpg',
    alt: 'Suite Riad Maroc',
    title: 'Riad de Luxe – Marrakech',
    caption: "L'authenticité marocaine dans un riad entièrement rénové",
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
  },
}

async function fetchImageAsBuffer(url: string): Promise<Buffer> {
  console.log(`  Fetching: ${url}`)
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
  })
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  const ab = await res.arrayBuffer()
  return Buffer.from(ab)
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

  if (existingAgency.docs.length > 0) {
    const agencyId = existingAgency.docs[0].id

    // Delete gallery items for this agency
    await payload.delete({
      collection: 'gallery',
      where: { agency: { equals: agencyId } },
    })
    console.log('  ✓ Deleted gallery items')

    // Delete gallery categories for this agency
    await payload.delete({
      collection: 'gallery-categories',
      where: { agency: { equals: agencyId } },
    })
    console.log('  ✓ Deleted gallery categories')

    // Delete gallery tags for this agency
    await payload.delete({
      collection: 'gallery-tags',
      where: { agency: { equals: agencyId } },
    })
    console.log('  ✓ Deleted gallery tags')

    // Delete the agency
    await payload.delete({
      collection: 'agencies',
      id: agencyId,
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
  console.log('🚀 Starting demo agency seed: Voyages Lumière\n')
  const payload = await getPayload({ config })

  await cleanup(payload)

  // ── 1. Create Agency Logo (via URL as external URL stored in media) ──
  console.log('\n📸 Creating agency logo media...')
  let logoMedia: { id: number } | null = null
  try {
    const logoBuffer = await fetchImageAsBuffer(
      'https://img.cartepostale.cool/demo/photo-1486406146926-c627a92ad1ab.jpg',
    )
    const logoDoc = await payload.create({
      collection: 'media',
      data: { alt: 'Logo Voyages Lumière' },
      file: {
        data: logoBuffer,
        mimetype: 'image/jpeg',
        name: 'voyages-lumiere-logo.jpg',
        size: logoBuffer.length,
      },
    })
    logoMedia = { id: (logoDoc as any).id }
    console.log('  ✓ Logo created')
  } catch (e) {
    console.warn('  ⚠ Could not fetch logo image, continuing without logo:', (e as Error).message)
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
      ...(logoMedia ? { logo: logoMedia.id } : {}),
      imageBank: [],
      qrCodeUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://cartepostale.cool'}/agences/demo`,
    },
  })
  console.log(`  ✓ Agency created (ID: ${agency.id})`)

  // ── 3. Create Gallery Categories ──
  console.log('\n📂 Creating gallery categories...')
  const categoryMap: Record<string, number> = {}
  for (const cat of CATEGORIES) {
    const doc = await payload.create({
      collection: 'gallery-categories',
      data: {
        name: cat.name,
        description: cat.description,
        agency: agency.id,
      } as any,
    })
    categoryMap[cat.slug] = (doc as any).id
    console.log(`  ✓ Category: ${cat.name}`)
  }

  // ── 4. Create Gallery Tags ──
  console.log('\n🏷️  Creating gallery tags...')
  const tagMap: Record<string, number> = {}
  for (const tag of TAGS) {
    const doc = await payload.create({
      collection: 'gallery-tags',
      data: {
        name: tag.name,
        agency: agency.id,
      } as any,
    })
    tagMap[tag.slug] = (doc as any).id
    console.log(`  ✓ Tag: ${tag.name}`)
  }

  // ── 5. Create Gallery Images ──
  console.log('\n🖼️  Creating gallery images (fetching from R2)...')
  let successCount = 0
  let errorCount = 0

  for (const img of DEMO_IMAGES) {
    try {
      // Create media record
      let mediaId: number | null = null
      try {
        const buffer = await fetchImageAsBuffer(img.url)
        const ext = img.url.split('.').pop()?.toLowerCase() || 'jpg'
        const mime = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`
        const mediaDoc = await payload.create({
          collection: 'media',
          data: { alt: img.alt },
          file: {
            data: buffer,
            mimetype: mime,
            name: `demo-gallery-${Date.now()}-${img.order}.${ext}`,
            size: buffer.length,
          },
        })
        mediaId = (mediaDoc as any).id
      } catch (fetchErr) {
        console.warn(`  ⚠ Cannot fetch image for "${img.title}", creating placeholder media`)
        // Create placeholder media record with a minimal buffer
        const placeholder = Buffer.from('placeholder', 'utf8')
        const mediaDoc = await payload.create({
          collection: 'media',
          data: { alt: img.alt },
          file: {
            data: placeholder,
            mimetype: 'image/jpeg',
            name: `demo-gallery-placeholder-${img.order}.jpg`,
            size: placeholder.length,
          },
        })
        mediaId = (mediaDoc as any).id
      }

      // Resolve category and tag IDs
      const catId = categoryMap[img.categorySlug]
      const tagIds = img.tags.map((t) => tagMap[t]).filter(Boolean)

      // Create gallery item
      await payload.create({
        collection: 'gallery',
        data: {
          title: img.title,
          image: mediaId as number,
          caption: img.caption,
          category: catId || undefined,
          tags: tagIds,
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
    const demoUser = await payload.create({
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
      req: adminRequestStub,
    })
    console.log(`  ✓ Demo user created: ${DEMO_USER_EMAIL} (agency ID: ${agency.id})`)
  } catch (e) {
    console.warn('  ⚠ Could not create demo user (may already exist):', (e as Error).message)
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
}

main().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
