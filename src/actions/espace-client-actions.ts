'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import type { Postcard, PostcardTrackingLink } from '@/payload-types'
import { getCurrentUser } from '@/lib/auth'
import { sendEmail, generateTrackingLinkEmail } from '@/lib/email-service'
import { headers } from 'next/headers'

export interface PostcardFilters {
  status?: 'published' | 'draft' | 'archived'
  search?: string
  page?: number
  limit?: number
  sort?: string
}

export interface PostcardsResult {
  docs: Postcard[]
  totalDocs: number
  totalPages: number
  page: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

function generatePublicId(length = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

async function generateUniquePublicId(
  payload: Awaited<ReturnType<typeof getPayload>>,
): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const candidate = generatePublicId()
    const existing = await payload.find({
      collection: 'postcards',
      where: { publicId: { equals: candidate } },
      limit: 1,
      depth: 0,
    })
    if (existing.totalDocs === 0) return candidate
  }
  throw new Error('Impossible de générer un identifiant unique pour la copie.')
}

export async function getMyPostcards(filters?: PostcardFilters): Promise<PostcardsResult> {
  const user = await getCurrentUser()
  if (!user) {
    return {
      docs: [],
      totalDocs: 0,
      totalPages: 0,
      page: 1,
      hasNextPage: false,
      hasPrevPage: false,
    }
  }

  try {
    const payload = await getPayload({ config })

    const where: Record<string, any> = {
      author: { equals: user.id },
    }

    if (filters?.status) {
      where.status = { equals: filters.status }
    }

    if (filters?.search?.trim()) {
      const and: any[] = [
        { author: { equals: user.id } },
        {
          or: [
            { senderName: { contains: filters.search } },
            { recipientName: { contains: filters.search } },
            { location: { contains: filters.search } },
            { message: { contains: filters.search } },
          ],
        },
      ]
      if (filters?.status) {
        and.push({ status: { equals: filters.status } })
      }
      where.and = and
      delete where.author
      delete where.status
    }

    const result = await payload.find({
      collection: 'postcards',
      where,
      page: filters?.page ?? 1,
      limit: filters?.limit ?? 50,
      sort: filters?.sort ?? '-createdAt',
      depth: 2,
    })

    // Populate mediaItems.media when Payload returns IDs (so AlbumDialog can display images)
    const docs = await Promise.all(
      result.docs.map(async (doc) => {
        const postcard = doc as Postcard & {
          mediaItems?: Array<{
            media?: number | unknown
            type?: string
            note?: string
            id?: string
          }>
        }
        if (postcard.mediaItems?.length) {
          const populated = await Promise.all(
            postcard.mediaItems.map(async (item) => {
              const mediaRef = item.media
              if (typeof mediaRef === 'number') {
                try {
                  const mediaDoc = await payload.findByID({
                    collection: 'media',
                    id: mediaRef,
                    depth: 0,
                  })
                  return { ...item, media: mediaDoc }
                } catch {
                  return item
                }
              }
              return item
            }),
          )
          return { ...postcard, mediaItems: populated }
        }
        return postcard
      }),
    )

    return {
      docs: docs as Postcard[],
      totalDocs: result.totalDocs,
      totalPages: result.totalPages,
      page: result.page ?? 1,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    }
  } catch (error) {
    console.error('Error fetching my postcards:', error)
    return {
      docs: [],
      totalDocs: 0,
      totalPages: 0,
      page: 1,
      hasNextPage: false,
      hasPrevPage: false,
    }
  }
}

async function ensureOwnership(postcardId: number): Promise<{ allowed: boolean; error?: string }> {
  const user = await getCurrentUser()
  if (!user) return { allowed: false, error: 'Non connecté.' }

  const payload = await getPayload({ config })
  const doc = await payload.findByID({
    collection: 'postcards',
    id: postcardId,
    depth: 0,
  })

  const authorId = typeof doc.author === 'object' ? doc.author?.id : doc.author
  if (authorId !== user.id) {
    return { allowed: false, error: 'Cette carte ne vous appartient pas.' }
  }
  return { allowed: true }
}

export async function updateMyPostcard(
  id: number,
  data: Record<string, unknown>,
): Promise<{ success: boolean; error?: string }> {
  const { allowed, error } = await ensureOwnership(id)
  if (!allowed) return { success: false, error }

  try {
    const payload = await getPayload({ config })

    const updateData: Record<string, unknown> = { ...data }

    if (data.frontImageKey && typeof data.frontImageKey === 'string') {
      const media = await payload.create({
        collection: 'media',
        data: {
          alt: `Face avant - carte ${data.recipientName ?? 'sans nom'}`,
          filename: data.frontImageKey,
          mimeType: (data.frontImageMimeType as string) || 'image/jpeg',
          filesize: (data.frontImageFilesize as number) ?? 0,
        },
      })
      const mediaDoc = media as { url?: string | null; filename?: string | null }
      updateData.frontImage = media.id
      updateData.frontImageURL =
        mediaDoc.url ??
        (mediaDoc.filename ? `/media/${encodeURIComponent(mediaDoc.filename)}` : undefined)
      delete updateData.frontImageKey
      delete updateData.frontImageMimeType
      delete updateData.frontImageFilesize
    } else if (
      data.frontImage &&
      typeof data.frontImage === 'string' &&
      data.frontImage.startsWith('data:image')
    ) {
      const [meta, base64Data] = (data.frontImage as string).split(',')
      const mime = meta.match(/:(.*?);/)?.[1] || 'image/png'
      const extension = mime.split('/')[1] || 'png'
      const buffer = Buffer.from(base64Data, 'base64')

      const media = await payload.create({
        collection: 'media',
        data: {
          alt: `Face avant - carte ${data.recipientName ?? 'sans nom'}`,
        },
        file: {
          data: buffer,
          mimetype: mime,
          name: `postcard-front-${Date.now()}.${extension}`,
          size: buffer.length,
        },
      })

      const mediaDoc = media as { url?: string | null; filename?: string | null }
      updateData.frontImage = media.id
      updateData.frontImageURL =
        mediaDoc.url ??
        (mediaDoc.filename ? `/media/${encodeURIComponent(mediaDoc.filename)}` : undefined)
    }

    if (data.mediaItems && Array.isArray(data.mediaItems)) {
      const processedMediaItems = []
      for (const item of data.mediaItems) {
        if (item.newKey) {
          const media = await payload.create({
            collection: 'media',
            data: {
              alt: `Photo album`,
              filename: item.newKey,
              mimeType: item.mimeType || 'image/jpeg',
              filesize: item.filesize || 0,
            },
          })
          processedMediaItems.push({ media: media.id, type: item.type || 'image', note: item.note })
        } else if (item.newBase64) {
          const [meta, base64Data] = (item.newBase64 as string).split(',')
          const mime = meta.match(/:(.*?);/)?.[1] || 'image/png'
          const extension = mime.split('/')[1] || 'png'
          const buffer = Buffer.from(base64Data, 'base64')

          const media = await payload.create({
            collection: 'media',
            data: { alt: `Photo album` },
            file: {
              data: buffer,
              mimetype: mime,
              name: `postcard-album-${Date.now()}.${extension}`,
              size: buffer.length,
            },
          })
          processedMediaItems.push({ media: media.id, type: item.type || 'image', note: item.note })
        } else if (item.media) {
          processedMediaItems.push({
            media: item.media,
            type: item.type || 'image',
            note: item.note,
          })
        }
      }
      updateData.mediaItems = processedMediaItems
    }

    await payload.update({
      collection: 'postcards',
      id,
      data: updateData,
    })

    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour.'
    console.error('Error updating my postcard:', err)
    return { success: false, error: message }
  }
}

export async function updateMyPostcardStatus(
  id: number,
  status: 'published' | 'draft' | 'archived',
): Promise<{ success: boolean; error?: string }> {
  const { allowed, error } = await ensureOwnership(id)
  if (!allowed) return { success: false, error }

  try {
    const payload = await getPayload({ config })
    await payload.update({
      collection: 'postcards',
      id,
      data: { status },
    })
    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur lors du changement de statut.'
    console.error('Error updating my postcard status:', err)
    return { success: false, error: message }
  }
}

export async function deleteMyPostcard(id: number): Promise<{ success: boolean; error?: string }> {
  const { allowed, error } = await ensureOwnership(id)
  if (!allowed) return { success: false, error }

  try {
    const payload = await getPayload({ config })
    await payload.delete({
      collection: 'postcards',
      id,
    })
    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur lors de la suppression.'
    console.error('Error deleting my postcard:', err)
    return { success: false, error: message }
  }
}

export async function setMyPostcardPublicVisibility(
  id: number,
  isPublic: boolean,
): Promise<{ success: boolean; error?: string }> {
  const { allowed, error } = await ensureOwnership(id)
  if (!allowed) return { success: false, error }

  try {
    const payload = await getPayload({ config })
    await payload.update({
      collection: 'postcards',
      id,
      data: { isPublic },
    })
    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur lors du changement de visibilite.'
    console.error('Error updating postcard public visibility:', err)
    return { success: false, error: message }
  }
}

export async function duplicateMyPostcard(
  id: number,
): Promise<{ success: boolean; postcard?: Postcard; error?: string }> {
  const { allowed, error } = await ensureOwnership(id)
  if (!allowed) return { success: false, error }

  const user = await getCurrentUser()
  if (!user) return { success: false, error: 'Non connecté.' }

  try {
    const payload = await getPayload({ config })
    const source = await payload.findByID({
      collection: 'postcards',
      id,
      depth: 0,
    })

    const publicId = await generateUniquePublicId(payload)
    const sourceFrontImage =
      typeof source.frontImage === 'object' && source.frontImage
        ? source.frontImage.id
        : source.frontImage
    const sourceAgency =
      typeof source.agency === 'object' && source.agency ? source.agency.id : source.agency
    const sourceBrandLogo =
      typeof source.brandLogo === 'object' && source.brandLogo
        ? source.brandLogo.id
        : source.brandLogo

    const duplicated = await payload.create({
      collection: 'postcards',
      data: {
        publicId,
        frontImage: sourceFrontImage ?? undefined,
        frontImageURL: source.frontImageURL ?? undefined,
        frontCaption: source.frontCaption ?? undefined,
        frontEmoji: source.frontEmoji ?? undefined,
        frontCaptionPosition:
          source.frontCaptionPosition?.x != null && source.frontCaptionPosition?.y != null
            ? { x: source.frontCaptionPosition.x, y: source.frontCaptionPosition.y }
            : undefined,
        message: source.message ?? '',
        recipients: (source.recipients ?? []).map((recipient) => ({
          email: recipient?.email ?? undefined,
          phone: recipient?.phone ?? undefined,
          name: recipient?.name ?? undefined,
        })),
        recipientName: source.recipientName ?? undefined,
        senderName: source.senderName ?? undefined,
        senderEmail: source.senderEmail ?? undefined,
        location: source.location ?? undefined,
        coords:
          source.coords?.lat != null || source.coords?.lng != null
            ? {
                lat: source.coords?.lat ?? undefined,
                lng: source.coords?.lng ?? undefined,
              }
            : undefined,
        stampStyle: source.stampStyle ?? 'classic',
        stampLabel: source.stampLabel ?? undefined,
        stampYear: source.stampYear ?? undefined,
        postmarkText: source.postmarkText ?? undefined,
        date: new Date().toISOString(),
        status: 'draft',
        views: 0,
        shares: 0,
        mediaItems: (source.mediaItems ?? [])
          .map((item) => {
            const mediaId =
              typeof item?.media === 'object' && item?.media ? item.media.id : item?.media
            if (!mediaId) return null
            return {
              media: mediaId,
              type: (item?.type === 'video' ? 'video' : 'image') as 'image' | 'video',
              note: item?.note || undefined,
            }
          })
          .filter(Boolean) as NonNullable<typeof source.mediaItems>,
        isPremium: Boolean(source.isPremium),
        agency: sourceAgency ?? undefined,
        brandLogo: sourceBrandLogo ?? undefined,
        author: user.id,
        stickers: source.stickers ?? undefined,
        allowComments: source.allowComments ?? true,
        isPublic: source.isPublic ?? true,
      },
    })

    return { success: true, postcard: duplicated as Postcard }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur lors de la duplication.'
    console.error('Error duplicating my postcard:', err)
    return { success: false, error: message }
  }
}

// --- Tracking links (liens de suivi par destinataire) ---

export interface CreateTrackingLinkData {
  recipientFirstName?: string
  recipientLastName?: string
  description?: string
}

export async function createTrackingLink(
  postcardId: number,
  data: CreateTrackingLinkData,
): Promise<{ success: boolean; tracking?: PostcardTrackingLink; error?: string }> {
  const { allowed, error } = await ensureOwnership(postcardId)
  if (!allowed) return { success: false, error }

  const user = await getCurrentUser()
  if (!user) return { success: false, error: 'Non connecté.' }

  try {
    const payload = await getPayload({ config })
    const tracking = await payload.create({
      collection: 'postcard-tracking-links',
      data: {
        postcard: postcardId,
        recipientFirstName: data.recipientFirstName?.trim() || undefined,
        recipientLastName: data.recipientLastName?.trim() || undefined,
        description: data.description?.trim() || undefined,
        author: user.id,
      },
      overrideAccess: true,
    } as Parameters<typeof payload.create>[0])
    return { success: true, tracking: tracking as PostcardTrackingLink }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur lors de la création du lien.'
    console.error('Error creating tracking link:', err)
    return { success: false, error: message }
  }
}

export async function getTrackingLinksForPostcard(
  postcardId: number,
): Promise<{ success: boolean; links?: PostcardTrackingLink[]; error?: string }> {
  const { allowed, error } = await ensureOwnership(postcardId)
  if (!allowed) return { success: false, error }

  const user = await getCurrentUser()
  if (!user) return { success: false, error: 'Non connecté.' }

  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'postcard-tracking-links',
      where: {
        postcard: { equals: postcardId },
        author: { equals: user.id },
      },
      sort: '-createdAt',
      depth: 0,
      overrideAccess: true,
    })
    return { success: true, links: result.docs as PostcardTrackingLink[] }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur lors du chargement des liens.'
    console.error('Error fetching tracking links:', err)
    return { success: false, error: message }
  }
}

async function getBaseUrl(): Promise<string> {
  try {
    const headersList = await headers()
    const host = headersList.get('host') || 'localhost:3000'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    return `${protocol}://${host}`
  } catch {
    return process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'
  }
}

export async function sendTrackingLinkByEmail(
  trackingId: number,
  recipientEmail: string,
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: 'Non connecté.' }

  const payload = await getPayload({ config })
  const tracking = await payload.findByID({
    collection: 'postcard-tracking-links',
    id: trackingId,
    depth: 1,
    overrideAccess: true,
  })

  const authorId = typeof tracking.author === 'object' ? tracking.author?.id : tracking.author
  if (authorId !== user.id) {
    return { success: false, error: 'Ce lien de tracking ne vous appartient pas.' }
  }

  const postcard = typeof tracking.postcard === 'object' ? tracking.postcard : null
  const senderName =
    postcard && typeof postcard === 'object' && 'senderName' in postcard
      ? (postcard as { senderName?: string }).senderName
      : undefined

  const baseUrl = await getBaseUrl()
  const trackingUrl = `${baseUrl}/v/${tracking.token}`
  const html = generateTrackingLinkEmail(trackingUrl, tracking.recipientFirstName, senderName)

  const ok = await sendEmail({
    to: recipientEmail.trim().toLowerCase(),
    subject: 'Une carte postale pour vous',
    html,
  })
  if (!ok) return { success: false, error: "Échec de l'envoi de l'email." }

  await payload.update({
    collection: 'postcard-tracking-links',
    id: trackingId,
    data: {
      sentVia: 'email',
      sentAt: new Date().toISOString(),
    },
    overrideAccess: true,
  })

  return { success: true }
}

export interface EspaceClientStats {
  totalPostcards: number
  publishedPostcards: number
  draftPostcards: number
  archivedPostcards: number
  totalViews: number
  totalShares: number
  totalUsers: number
  totalAgencies: number
  premiumPostcards: number
}

/** Carte minimale pour le sélecteur des stats (id, label, vues). */
export interface PostcardOption {
  id: number
  publicId: string
  senderName: string | null
  recipientName: string | null
  views: number
  status: string
}

export async function getMyPostcardsForStatsSelector(): Promise<PostcardOption[]> {
  const user = await getCurrentUser()
  if (!user) return []

  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'postcards',
      where: { author: { equals: user.id } },
      limit: 500,
      depth: 0,
      sort: '-createdAt',
    })
    return result.docs.map((doc) => ({
      id: doc.id,
      publicId: (doc as { publicId?: string }).publicId ?? String(doc.id),
      senderName: (doc as { senderName?: string | null }).senderName ?? null,
      recipientName: (doc as { recipientName?: string | null }).recipientName ?? null,
      views: (doc as { views?: number }).views ?? 0,
      status: (doc as { status?: string }).status ?? 'draft',
    }))
  } catch (error) {
    console.error('Error fetching postcards for selector:', error)
    return []
  }
}

export async function getEspaceClientStats(): Promise<EspaceClientStats> {
  const user = await getCurrentUser()
  if (!user) {
    return {
      totalPostcards: 0,
      publishedPostcards: 0,
      draftPostcards: 0,
      archivedPostcards: 0,
      totalViews: 0,
      totalShares: 0,
      totalUsers: 1,
      totalAgencies: 1,
      premiumPostcards: 0,
    }
  }

  try {
    const payload = await getPayload({ config })
    const postcards = await payload.find({
      collection: 'postcards',
      where: { author: { equals: user.id } },
      limit: 0,
      depth: 0,
    })

    const [publishedRes, draftRes, archivedRes, premiumRes] = await Promise.all([
      payload.find({
        collection: 'postcards',
        where: { author: { equals: user.id }, status: { equals: 'published' } },
        limit: 0,
        depth: 0,
      }),
      payload.find({
        collection: 'postcards',
        where: { author: { equals: user.id }, status: { equals: 'draft' } },
        limit: 0,
        depth: 0,
      }),
      payload.find({
        collection: 'postcards',
        where: { author: { equals: user.id }, status: { equals: 'archived' } },
        limit: 0,
        depth: 0,
      }),
      payload.find({
        collection: 'postcards',
        where: { author: { equals: user.id }, isPremium: { equals: true } },
        limit: 0,
        depth: 0,
      }),
    ])

    const allCards = await payload.find({
      collection: 'postcards',
      where: { author: { equals: user.id } },
      limit: 1000,
      depth: 0,
    })
    const totalViews = allCards.docs.reduce((sum, card) => sum + (card.views || 0), 0)
    const totalShares = allCards.docs.reduce((sum, card) => sum + (card.shares || 0), 0)

    return {
      totalPostcards: postcards.totalDocs,
      publishedPostcards: publishedRes.totalDocs,
      draftPostcards: draftRes.totalDocs,
      archivedPostcards: archivedRes.totalDocs,
      premiumPostcards: premiumRes.totalDocs,
      totalViews,
      totalShares,
      totalUsers: 1, // Placeholder since espace-client doesn't need these
      totalAgencies: 1,
    }
  } catch (error) {
    console.error('Error fetching espace client stats:', error)
    return {
      totalPostcards: 0,
      publishedPostcards: 0,
      draftPostcards: 0,
      archivedPostcards: 0,
      totalViews: 0,
      totalShares: 0,
      totalUsers: 1,
      totalAgencies: 1,
      premiumPostcards: 0,
    }
  }
}

export async function updateUserProfile(data: {
  name?: string
  company?: string
  socials?: {
    instagram?: string
    tiktok?: string
    facebook?: string
    linkedin?: string
    twitter?: string
    youtube?: string
    website?: string
  }
}): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: 'Non connecté.' }

  try {
    const payload = await getPayload({ config })
    await payload.update({
      collection: 'users',
      id: user.id,
      data,
    })
    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du profil.'
    console.error('Error updating user profile:', err)
    return { success: false, error: message }
  }
}
