'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { randomBytes } from 'crypto'
import { headers } from 'next/headers'
import { getCurrentUser } from '@/lib/auth'
import { sendEmail, generateTrackingLinkEmail } from '@/lib/email-service'

export interface EditorRecipient {
  firstName: string
  lastName: string
  email: string
}

async function getBaseUrl(): Promise<string> {
  try {
    const headersList = await headers()
    const host = headersList.get('host') || 'localhost:3000'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    return `${protocol}://${host}`
  } catch {
    return process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'
  }
}

/**
 * From the editor: send the postcard to recipients by email.
 * Each recipient gets a unique tracking link (/v/[token]).
 * Requires either being logged in or providing senderEmail (used to find/create user and link postcard).
 */
export async function sendPostcardToRecipientsFromEditor(
  publicId: string,
  recipients: EditorRecipient[],
  senderEmail?: string | null
): Promise<{ success: boolean; sentCount?: number; error?: string }> {
  try {
    const payload = await getPayload({ config })

    // 1. Resolve author: logged-in user or find/create by senderEmail
    let userId: number
    const currentUser = await getCurrentUser()
    if (currentUser?.id) {
      userId = currentUser.id
    } else {
      const email = (senderEmail || '').trim().toLowerCase()
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { success: false, error: 'Indiquez votre e-mail expéditeur ou connectez-vous.' }
      }
      const existing = await payload.find({
        collection: 'users',
        where: { email: { equals: email } },
      })
      if (existing.totalDocs > 0) {
        userId = existing.docs[0].id
      } else {
        const newUser = await payload.create({
          collection: 'users',
          data: {
            email,
            password: randomBytes(16).toString('hex'),
            role: 'client',
          },
        })
        userId = newUser.id
      }
    }

    // 2. Find postcard by publicId
    const postcardQuery = await payload.find({
      collection: 'postcards',
      where: { publicId: { equals: publicId } },
      depth: 1,
    })
    if (postcardQuery.totalDocs === 0) {
      return { success: false, error: 'Carte introuvable.' }
    }
    const postcard = postcardQuery.docs[0]
    const postcardId = postcard.id

    // 3. Link postcard to user (so it appears in their space)
    await payload.update({
      collection: 'postcards',
      id: postcardId,
      data: { author: userId } as any,
    })

    // 4. Filter valid recipients
    const valid = recipients.filter(
      (r) =>
        (r.email || '').trim() &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((r.email || '').trim())
    )
    if (valid.length === 0) {
      return { success: false, error: 'Ajoutez au moins un destinataire avec une adresse e-mail valide.' }
    }

    const baseUrl = await getBaseUrl()
    const senderName =
      (postcard as { senderName?: string | null }).senderName ?? undefined
    let sentCount = 0

    for (const r of valid) {
      const email = r.email.trim().toLowerCase()
      const firstName = (r.firstName || '').trim() || undefined
      const lastName = (r.lastName || '').trim() || undefined

      const tracking = await payload.create({
        collection: 'postcard-tracking-links',
        data: {
          postcard: postcardId,
          recipientFirstName: firstName,
          recipientLastName: lastName,
          author: userId,
        },
        overrideAccess: true,
      } as Parameters<typeof payload.create>[0])

      const trackingUrl = `${baseUrl}/v/${(tracking as { token: string }).token}`
      const html = generateTrackingLinkEmail(
        trackingUrl,
        firstName || undefined,
        senderName
      )
      const ok = await sendEmail({
        to: email,
        subject: 'Une carte postale pour vous',
        html,
      })
      if (ok) {
        sentCount++
        await payload.update({
          collection: 'postcard-tracking-links',
          id: tracking.id,
          data: {
            sentVia: 'email',
            sentAt: new Date().toISOString(),
          },
          overrideAccess: true,
        })
      }
    }

    return { success: true, sentCount }
  } catch (err) {
    console.error('sendPostcardToRecipientsFromEditor:', err)
    const msg = err instanceof Error ? err.message : 'Erreur lors de l\'envoi.'
    return { success: false, error: msg }
  }
}
