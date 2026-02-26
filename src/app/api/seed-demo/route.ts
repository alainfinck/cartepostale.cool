import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { demoPostcards } from '@/data/demoPostcards'

// Helper to convert French date string to ISO
function parseFrenchDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString()

  const months: Record<string, string> = {
    Jan: '01',
    Janv: '01',
    Janvier: '01',
    Fév: '02',
    Févr: '02',
    Février: '02',
    Mar: '03',
    Mars: '03',
    Avr: '04',
    Avril: '04',
    Mai: '05',
    Juin: '06',
    Juil: '07',
    Juillet: '07',
    Aou: '08',
    Août: '08',
    Sep: '09',
    Sept: '09',
    Septembre: '09',
    Oct: '10',
    Octobre: '10',
    Nov: '11',
    Novembre: '11',
    Déc: '12',
    Décembre: '12',
  }

  const parts = dateStr.trim().split(' ')
  if (parts.length >= 3) {
    const day = parts[0].padStart(2, '0')
    const month = months[parts[1]] || '01'
    const year = parts[2]
    return new Date(`${year}-${month}-${day}T00:00:00.000Z`).toISOString()
  }

  return new Date().toISOString()
}

export async function GET() {
  const payload = await getPayload({ config: configPromise })

  let demoUser = await payload.find({
    collection: 'users',
    where: { email: { equals: 'demo@cartepostale.cool' } },
  })

  let userId
  if (demoUser.totalDocs === 0) {
    const newUser = await payload.create({
      collection: 'users',
      data: {
        email: 'demo@cartepostale.cool',
        password: 'demo123',
        name: 'Compte Démo',
        role: 'user',
      },
    })
    userId = newUser.id
  } else {
    userId = demoUser.docs[0].id
  }

  const added = []

  for (const pc of demoPostcards) {
    const existing = await payload.find({
      collection: 'postcards',
      where: { publicId: { equals: pc.id } },
    })

    if (existing.totalDocs === 0) {
      await payload.create({
        collection: 'postcards',
        data: {
          publicId: pc.id,
          frontImageURL: pc.frontImage,
          frontCaption: pc.frontCaption,
          location: pc.location,
          message: pc.message,
          recipientName: pc.recipientName,
          senderName: pc.senderName,
          stampStyle: pc.stampStyle || 'classic',
          date: parseFrenchDate(pc.date),
          isPremium: pc.isPremium || false,
          status: 'published',
          author: userId,
          coords: pc.coords,
        },
      })
      added.push(pc.id)
    }
  }

  return NextResponse.json({ success: true, user: userId, added })
}
