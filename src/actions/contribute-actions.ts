'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { Postcard } from '@/payload-types'
import { revalidateTag, revalidatePath } from 'next/cache'

export async function uploadContribution(
  publicId: string,
  token: string,
  mediaData: { key?: string; mimeType?: string; filesize?: number; exif?: any },
) {
  try {
    const payload = await getPayload({ config })

    // 1. Verify postcard and token
    const result = await payload.find({
      collection: 'postcards',
      where: {
        publicId: { equals: publicId },
      },
      overrideAccess: true,
      depth: 0,
    })

    if (result.totalDocs === 0) {
      return { success: false, error: 'Carte postale introuvable' }
    }

    // Cast to any because contributionToken might not be in the generated types yet if they haven't been regenerated
    const postcard = result.docs[0] as any

    if (postcard.contributionToken !== token) {
      return { success: false, error: 'Lien de contribution invalide' }
    }

    if (postcard.isContributionEnabled === false) {
      return { success: false, error: 'Les contributions sont désactivées pour cette carte' }
    }

    // 2. Create Media
    if (!mediaData.key) {
      return { success: false, error: 'Aucune donnée média reçue' }
    }

    // Check if media already exists (duplicate upload)
    const existingMedia = await payload.find({
      collection: 'media',
      where: {
        filename: { equals: mediaData.key },
      },
      overrideAccess: true,
    })

    let mediaId: number | string

    if (existingMedia.totalDocs > 0) {
      mediaId = existingMedia.docs[0].id
    } else {
      // Reverse geocode GPS coordinates if available
      let locationName: string | undefined
      const gps = mediaData.exif?.gps
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
          alt: `Contribution to postcard ${publicId}`,
          filename: mediaData.key,
          mimeType: mediaData.mimeType,
          filesize: mediaData.filesize,
          exif: mediaData.exif,
          location: locationName,
        },
        overrideAccess: true,
      })
      mediaId = media.id
    }

    // 3. Update Postcard
    const currentMedia = postcard.mediaItems || []

    await payload.update({
      collection: 'postcards',
      id: postcard.id,
      data: {
        mediaItems: [
          ...currentMedia.map((m: any) => ({
            media: typeof m.media === 'object' ? m.media.id : m.media,
            type: m.type,
            note: m.note,
          })),
          {
            media: mediaId,
            type: 'image', // Contributions are images for now
          },
        ],
      },
      overrideAccess: true,
    })
    revalidateTag(`postcard-${publicId}`)
    revalidatePath(`/carte/${publicId}`)

    return { success: true }
  } catch (error) {
    console.error('Error in uploadContribution:', error)
    return { success: false, error: "Une erreur est survenue lors de l'ajout de la photo" }
  }
}
