import { getPayload } from 'payload'
import type { PayloadRequest } from 'payload'
import config from '../src/payload.config'

type PayloadClient = Awaited<ReturnType<typeof getPayload>>
type MediaFileInput = Parameters<PayloadClient['create']>[0]['file']

const seedPostcardIds = ['seed-card-001']
const seedUserEmails = ['admin@cartepostale.local', 'studio@cartepostale.local']
const seedAgencyNames = ['Lumiere Atelier']
const seedTemplateNames = ["Cote d'Azur", 'City Lights']
const seedMediaAlts = [
  'Lumiere Atelier Logo',
  "Cote d'Azur Template",
  'City Lights Template',
  'Vintage Badge Media Item',
]

const adminRequestStub: Partial<PayloadRequest> = {
  user: {
    id: 1,
    email: 'admin@cartepostale.local',
    role: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    collection: 'users',
  },
}

async function cleanup(payload: PayloadClient) {
  await Promise.all([
    payload.delete({
      collection: 'postcards',
      where: {
        publicId: {
          in: seedPostcardIds,
        },
      },
    }),
    payload.delete({
      collection: 'users',
      where: {
        email: {
          in: seedUserEmails,
        },
      },
    }),
    payload.delete({
      collection: 'agencies',
      where: {
        name: {
          in: seedAgencyNames,
        },
      },
    }),
    payload.delete({
      collection: 'templates',
      where: {
        name: {
          in: seedTemplateNames,
        },
      },
    }),
    payload.delete({
      collection: 'media',
      where: {
        alt: {
          in: seedMediaAlts,
        },
      },
    }),
  ])
}

async function createMediaAssets(payload: PayloadClient) {
  const mediaInputs = [
    {
      key: 'agencyLogo',
      alt: 'Lumiere Atelier Logo',
      filename: 'agency-logo.png',
      mimeType: 'image/png',
    },
    {
      key: 'templateBeach',
      alt: "Cote d'Azur Template",
      filename: 'cote-dazur.png',
      mimeType: 'image/png',
    },
    {
      key: 'templateCity',
      alt: 'City Lights Template',
      filename: 'city-lights.png',
      mimeType: 'image/png',
    },
    {
      key: 'brandBadge',
      alt: 'Vintage Badge Media Item',
      filename: 'badge.png',
      mimeType: 'image/png',
    },
  ]

  const created = await Promise.all(
    mediaInputs.map(async (input) => {
      const buffer = Buffer.from(`${input.alt} placeholder`, 'utf8')
      const fileData = {
        buffer,
        originalname: input.filename,
        mimetype: input.mimeType,
        size: buffer.byteLength,
      } as unknown as MediaFileInput

      return payload.create({
        collection: 'media',
        data: {
          alt: input.alt,
        },
        file: fileData,
      })
    }),
  )

  return mediaInputs.reduce<Record<string, typeof created[number]>>((acc, input, index) => {
    acc[input.key] = created[index]
    return acc
  }, {})
}

async function main() {
  const payload = await getPayload({ config })

  await cleanup(payload)

  const media = await createMediaAssets(payload)

  const agency = await payload.create({
    collection: 'agencies',
    data: {
      name: 'Lumiere Atelier',
      primaryColor: '#f7b733',
      qrCodeUrl: 'https://cartepostale.test/lumiere',
      logo: media.agencyLogo.id,
      imageBank: [
        {
          image: media.templateBeach.id,
        },
        {
          image: media.templateCity.id,
        },
      ],
    },
  })

  await Promise.all([
    payload.create({
      collection: 'templates',
      data: {
        name: "Cote d'Azur",
        category: 'beach',
        imageUrl: media.templateBeach.id,
      },
    }),
    payload.create({
      collection: 'templates',
      data: {
        name: 'City Lights',
        category: 'city',
        imageUrl: media.templateCity.id,
      },
    }),
  ])

  await Promise.all([
    payload.create({
      collection: 'postcards',
      data: {
        publicId: 'seed-card-001',
        frontImageURL:
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
      message:
        "Salut de la Cote d'Azur ! Voici un apercu du nouveau template et des possibilites de la plateforme.",
        recipients: [
          { email: 'marie@clients.example', name: 'Marie Dupont' },
          { email: 'gloria@clients.example', phone: '+33123456789', name: 'Gloria Martin' },
        ],
        recipientName: 'Marie Dupont',
        senderName: 'Adrien Durand',
        location: 'Cannes, France',
        coords: {
          lat: 43.551,
          lng: 7.013,
        },
        stampStyle: 'modern',
        stampLabel: 'Carte Postale Seeds',
        stampYear: '2026',
        date: new Date().toISOString().slice(0, 10),
        status: 'published',
        views: 182,
        shares: 12,
        mediaItems: [
          {
            media: media.brandBadge.id,
            type: 'image',
          },
        ],
        isPremium: true,
        agency: agency.id,
        brandLogo: media.brandBadge.id,
      },
    }),
  ])

  await Promise.all([
    payload.create({
      collection: 'users',
      data: {
        email: 'admin@cartepostale.local',
        password: 'Admin123!',
        name: 'Admin Seed',
        role: 'admin',
        plan: 'enterprise',
        cardsCreated: 12,
      },
      req: adminRequestStub,
    }),
    payload.create({
      collection: 'users',
      data: {
        email: 'studio@cartepostale.local',
        password: 'Client123!',
        name: 'Studio Seed',
        role: 'client',
        plan: 'pro',
        company: 'Studio Lumiere',
        cardsCreated: 58,
      },
      req: adminRequestStub,
    }),
  ])

  console.log('Database seeded with sample agencies, templates, postcards, media and users.')
}

main().catch((error) => {
  console.error('Failed to seed database:', error)
  process.exit(1)
})
