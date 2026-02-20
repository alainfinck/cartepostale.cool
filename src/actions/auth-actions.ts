'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { generateMagicLinkEmail, sendEmail } from '@/lib/email-service'
import { randomBytes } from 'crypto'
import { headers } from 'next/headers'

export async function linkPostcardToUser(postcardId: string, email: string) {
  try {
    const payload = await getPayload({ config })
    const lowerEmail = email.toLowerCase()

    // 1. Find or Create User
    let user
    const existingUsers = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: lowerEmail,
        },
      },
    })

    if (existingUsers.totalDocs > 0) {
      user = existingUsers.docs[0]
    } else {
      // Create new user
      // Generate a random password just to satisfy requirement if any (though we made it optional/handled by auth)
      // But Payload usually requires password.
      // We will set a random high-entropy password for now, as they will use magic link.
      const randomPassword = randomBytes(16).toString('hex')

      user = await payload.create({
        collection: 'users',
        data: {
          email: lowerEmail,
          password: randomPassword,
          role: 'client', // Default role
        } as any,
      })
    }

    // 2. Link Postcard to User
    // Need to find postcard by publicId first to get its internal ID if postcardId passed is publicId
    // Assuming postcardId passed here is the publicId (string) from the URL
    const postcardQuery = await payload.find({
      collection: 'postcards',
      where: {
        publicId: {
          equals: postcardId,
        },
      },
      depth: 2,
    })

    if (postcardQuery.totalDocs === 0) {
      return { success: false, error: 'Postcard not found' }
    }

    const postcard = postcardQuery.docs[0]

    await payload.update({
      collection: 'postcards',
      id: postcard.id,
      data: {
        author: user.id,
      } as any,
    })

    // 3. Generate Magic Link
    const token = randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 3600 * 1000) // 1 hour

    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        magicLinkToken: token,
        magicLinkExpires: expires.toISOString(),
      } as any,
    })

    // 4. Send Email
    const headersList = await headers()
    const host = headersList.get('host') || 'localhost:3000'
    const protocol = host.includes('localhost') ? 'http' : 'https'

    const magicLink = `${protocol}://${host}/api/magic-login?token=${token}`
    const postcardUrl = `${protocol}://${host}/view/${postcardId}`

    // Resolve generic type for frontImage which can be number | Media | null
    let postcardImageUrl = (postcard as any).frontImageURL
    if (
      !postcardImageUrl &&
      (postcard as any).frontImage &&
      typeof (postcard as any).frontImage === 'object'
    ) {
      postcardImageUrl = (postcard as any).frontImage.url
    }

    const emailHtml = generateMagicLinkEmail(magicLink, postcardUrl, postcardId, postcardImageUrl)

    await sendEmail({
      to: lowerEmail,
      subject: 'Votre carte postale est prête !',
      html: emailHtml,
    })

    return { success: true }
  } catch (error) {
    console.error('Error in linkPostcardToUser:', error)
    return { success: false, error: 'Failed to process request' }
  }
}
