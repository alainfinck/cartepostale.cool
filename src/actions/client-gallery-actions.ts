'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { getCurrentUser } from '@/lib/auth'

export interface UserMediaItem {
  id: number
  url: string
  alt: string
  addedAt: string // ISO string date
  filesize?: number
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
            filesize: m.filesize ?? undefined,
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
                filesize: m.filesize ?? undefined,
              })
            }
          }
        }
      }
    }

    // Fetch directly uploaded media
    const directMediaResult = await payload.find({
      collection: 'media',
      where: {
        author: { equals: user.id },
      },
      limit: 1000,
      overrideAccess: true,
    })

    for (const m of directMediaResult.docs) {
      const id = m.id
      if (id && !mediaMap.has(id)) {
        mediaMap.set(id, {
          id,
          url: m.url || `/media/${encodeURIComponent(m.filename || '')}`,
          alt: m.alt || 'Image téléchargée',
          addedAt: m.createdAt || new Date().toISOString(),
          filesize: m.filesize ?? undefined,
        })
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

/**
 * Creates a Media document linked to the current user (e.g. after direct R2 upload).
 */
export async function addUserGalleryImage(
  key: string,
  mimeType: string,
  filesize: number,
  alt: string,
  exif?: any,
): Promise<{ success: boolean; id?: number; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const payload = await getPayload({ config })

    // Check for duplicate key
    const existingMedia = await payload.find({
      collection: 'media',
      where: { filename: { equals: key } },
    })

    if (existingMedia.totalDocs > 0) {
      return { success: true, id: existingMedia.docs[0].id as number }
    }

    // Reverse geocode GPS coordinates if available
    let locationName: string | undefined
    const gps = exif?.gps
    if (gps?.latitude && gps?.longitude) {
      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${gps.latitude}&lon=${gps.longitude}&zoom=10`,
          { headers: { 'User-Agent': 'CartePostaleCool/1.0' } },
        )
        const geoData = await geoRes.json()
        if (geoData.address) {
          const { city, town, village, county, country } = geoData.address
          const parts = [city || town || village || county, country].filter(Boolean)
          if (parts.length) locationName = parts.join(', ')
        }
      } catch (err) {
        console.error('Reverse geocoding failed:', err)
      }
    }

    const media = await payload.create({
      collection: 'media',
      data: {
        alt: alt || 'Image téléchargée',
        filename: key,
        mimeType: mimeType || 'image/jpeg',
        filesize: filesize || 0,
        author: user.id,
        ...(exif ? { exif } : {}),
        ...(locationName ? { location: locationName } : {}),
      },
    })

    return { success: true, id: media.id as number }
  } catch (err: any) {
    console.error('Error adding user gallery image:', err)
    return { success: false, error: err.message || 'Erreur lors de la sauvegarde' }
  }
}

export async function deleteUserGalleryImage(
  imageId: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const payload = await getPayload({ config })

    // Find the media item to verify ownership
    const media = await payload.findByID({
      collection: 'media',
      id: imageId,
    })

    if (!media) {
      return { success: false, error: 'Média introuvable' }
    }

    // Check if the user is the author
    const authorId = typeof media.author === 'object' ? media.author?.id : media.author

    if (authorId !== user.id) {
      return { success: false, error: 'Vous n’êtes pas autorisé à supprimer ce média' }
    }

    // Delete from Payload (and R2 via s3Storage plugin)
    await payload.delete({
      collection: 'media',
      id: imageId,
      overrideAccess: true,
    })

    return { success: true }
  } catch (err: any) {
    console.error('Error deleting user gallery image:', err)
    return { success: false, error: err.message || 'Erreur lors de la suppression' }
  }
}

export async function deleteUserGalleryMediaItems(
  imageIds: number[],
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const payload = await getPayload({ config })

    // Verify ownership for all items
    const mediaItems = await payload.find({
      collection: 'media',
      where: {
        id: { in: imageIds },
      },
      limit: imageIds.length,
    })

    const unauthorized = mediaItems.docs.some((m: any) => {
      const authorId = typeof m.author === 'object' ? m.author?.id : m.author
      return authorId !== user.id
    })

    const foundIds = mediaItems.docs.map((m) => m.id as number)
    if (unauthorized || foundIds.length !== imageIds.length) {
      return {
        success: false,
        error: 'Vous n’êtes pas autorisé à supprimer certains de ces médias',
      }
    }

    // Delete from Payload
    await Promise.all(
      imageIds.map((id) =>
        payload.delete({
          collection: 'media',
          id,
          overrideAccess: true,
        }),
      ),
    )

    return { success: true }
  } catch (err: any) {
    console.error('Error deleting user gallery images:', err)
    return { success: false, error: err.message || 'Erreur lors de la suppression groupée' }
  }
}
