'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { getCurrentUser } from '@/lib/auth'

export interface UserMediaItem {
  id: number
  url: string
  alt: string
  addedAt: string // ISO string date
}

export async function getUserGalleryMedia(): Promise<UserMediaItem[]> {
  const user = await getCurrentUser()
  if (!user) return []

  try {
    const payload = await getPayload({ config })

    // Find all postcards authored by this user
    const result = await payload.find({
      collection: 'postcards',
      where: {
        author: { equals: user.id },
      },
      depth: 1, // Need media nested
      limit: 1000,
      overrideAccess: true, // User is asking for their own postcards
    })

    const postcards = result.docs
    const mediaMap = new Map<number, UserMediaItem>()

    for (const pc of postcards) {
      const pcDate = pc.createdAt || pc.updatedAt || new Date().toISOString()

      // Front image
      if (
        pc.frontImage &&
        typeof pc.frontImage === 'object' &&
        ('url' in pc.frontImage || 'filename' in pc.frontImage)
      ) {
        const m = pc.frontImage as any
        const id = m.id
        if (id && !mediaMap.has(id)) {
          mediaMap.set(id, {
            id,
            url: m.url || `/media/${encodeURIComponent(m.filename)}`,
            alt: m.alt || `Face avant - ${(pc.recipientName || 'sans nom').toString()}`,
            addedAt: pcDate,
          })
        }
      }

      // Inside gallery items
      if (pc.mediaItems && Array.isArray(pc.mediaItems)) {
        for (const item of pc.mediaItems) {
          if (item.type === 'image' && item.media && typeof item.media === 'object') {
            const m = item.media as any
            const id = m.id
            if (id && !mediaMap.has(id)) {
              mediaMap.set(id, {
                id,
                url: m.url || `/media/${encodeURIComponent(m.filename)}`,
                alt: m.alt || `Photo dos - ${(pc.recipientName || '').toString()}`,
                addedAt: pcDate,
              })
            }
          }
        }
      }
    }

    // Convert map to array and sort by newest first
    return Array.from(mediaMap.values()).sort((a, b) => {
      return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
    })
  } catch (error) {
    console.error('Error fetching user gallery media:', error)
    return []
  }
}
