'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { Postcard } from '@/payload-types'
import { getCurrentUser } from '@/lib/auth'
import { sendEmail, generateCreatorConfirmationEmail } from '@/lib/email-service'

// Simple ID generator for public URLs (shorter than UUID)
function generatePublicId(length = 4) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

const HEIC_MIME = /^image\/(heic|heif|heics|heifs)$/i

function isHeicDataUrl(url: string): boolean {
  if (!url?.startsWith('data:image')) return false
  const mime = url.match(/^data:(image\/[^;]+);/)?.[1] || ''
  return HEIC_MIME.test(mime)
}

function isHeifUploadError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err)
  return /heif|Bitstream not supported|decoder/i.test(msg)
}

export async function createPostcard(data: any): Promise<{
  success: boolean
  id?: number | string
  publicId?: string
  contributionToken?: string
  error?: string
}> {
  try {
    // Reject HEIC/HEIF upfront — Sharp/libvips often can't decode them
    if (data.frontImage && isHeicDataUrl(data.frontImage)) {
      return {
        success: false,
        error:
          'Le format HEIC (photo iPhone) n’est pas supporté. Utilisez une photo en JPEG ou PNG, ou convertissez-la dans Réglages > Appareil photo > Formats.',
      }
    }
    if (data.mediaItems && Array.isArray(data.mediaItems)) {
      for (const item of data.mediaItems) {
        if (item?.url && isHeicDataUrl(item.url)) {
          return {
            success: false,
            error:
              'Une photo de l’album est au format HEIC (iPhone), non supporté. Utilisez des photos en JPEG ou PNG.',
          }
        }
      }
    }

    const payload = await getPayload({ config })

    // Check if we already have a postcard with this publicId to update it
    let existingId: string | number | null = null
    if (data.id && data.id !== 'editor-preview') {
      // Check if it's the publicId or internal ID
      const existing = await payload.find({
        collection: 'postcards',
        where: {
          publicId: {
            equals: data.id,
          },
        },
      })
      if (existing.totalDocs > 0) {
        existingId = existing.docs[0].id
      }
    }

    // Handle images
    let frontImageId: number | undefined
    let frontImageURL: string | undefined

    if (data.frontImageKey) {
      // Check if media already exists with this filename
      const existingMedia = await payload.find({
        collection: 'media',
        where: {
          filename: {
            equals: data.frontImageKey,
          },
        },
      })

      if (existingMedia.totalDocs > 0) {
        frontImageId = existingMedia.docs[0].id as number
      } else {
        // Image already uploaded to R2 via presigned URL; create media doc with key only
        const media = await payload.create({
          collection: 'media',
          data: {
            alt: `Front Image for postcard ${data.recipientName || 'unnamed'}`,
            filename: data.frontImageKey,
            mimeType: data.frontImageMimeType || 'image/jpeg',
            filesize: data.frontImageFilesize ?? 0,
            ...(data.frontExif ? { exif: data.frontExif } : {}), // Save EXIF data
          },
        })
        frontImageId = media.id as number
      }
      // Temporarily cast to any to access dynamic properties of created/found media doc
      const mediaDoc = (
        frontImageId ? await payload.findByID({ collection: 'media', id: frontImageId }) : {}
      ) as { url?: string | null; filename?: string | null }
      frontImageURL =
        mediaDoc.url ??
        (mediaDoc.filename ? `/media/${encodeURIComponent(mediaDoc.filename)}` : undefined)
    } else if (data.frontImage) {
      if (data.frontImage.startsWith('data:image')) {
        // Base64 upload (fallback: server uploads to R2)
        const [meta, base64Data] = data.frontImage.split(',')
        const mime = meta.match(/:(.*?);/)?.[1] || 'image/png'
        const extension = mime.split('/')[1] || 'png'
        const buffer = Buffer.from(base64Data, 'base64')

        const media = await payload.create({
          collection: 'media',
          data: {
            alt: `Front Image for postcard ${data.recipientName || 'unnamed'}`,
            ...(data.frontExif ? { exif: data.frontExif } : {}), // Save EXIF data
          },
          file: {
            data: buffer,
            mimetype: mime,
            name: `postcard-front-${Date.now()}.${extension}`,
            size: buffer.length,
          },
        })
        frontImageId = media.id as number
        const mediaDoc = media as { url?: string | null; filename?: string | null }
        frontImageURL =
          mediaDoc.url ??
          (mediaDoc.filename ? `/media/${encodeURIComponent(mediaDoc.filename)}` : undefined)
      } else if (data.frontImage.startsWith('http')) {
        // External URL (template)
        frontImageURL = data.frontImage
      }
    }

    // Handle mediaItems (album)
    const processedMediaItems = []
    if (data.mediaItems && Array.isArray(data.mediaItems)) {
      for (let i = 0; i < data.mediaItems.length; i++) {
        const item = data.mediaItems[i]
        if (item.key) {
          // Check if media already exists with this filename
          const existingMedia = await payload.find({
            collection: 'media',
            where: {
              filename: {
                equals: item.key,
              },
            },
          })

          let mediaId: string | number
          if (existingMedia.totalDocs > 0) {
            mediaId = existingMedia.docs[0].id
          } else {
            // Image already uploaded to R2 via presigned URL; create media doc with key only
            const media = await payload.create({
              collection: 'media',
              data: {
                alt: `Album item for postcard`,
                filename: item.key,
                mimeType: item.mimeType || 'image/jpeg',
                filesize: item.filesize ?? 0,
                ...(item.exif ? { exif: item.exif } : {}), // Save EXIF data
              },
            })
            mediaId = media.id
          }
          processedMediaItems.push({
            media: mediaId,
            type: item.type || 'image',
            note: item.note || undefined,
          })
        } else if (item.url && item.url.startsWith('data:')) {
          const [meta, base64Data] = item.url.split(',')
          const mime = meta.match(/:(.*?);/)?.[1] || 'image/png'
          const extension = mime.split('/')[1] || 'png'
          const buffer = Buffer.from(base64Data, 'base64')

          const media = await payload.create({
            collection: 'media',
            data: {
              alt: `Album item for postcard`,
              ...(item.exif ? { exif: item.exif } : {}), // Save EXIF data
            },
            file: {
              data: buffer,
              mimetype: mime,
              name: `postcard-album-${Date.now()}-${i}.${extension}`,
              size: buffer.length,
            },
          })
          processedMediaItems.push({
            media: media.id,
            type: item.type || 'image',
            note: item.note || undefined,
          })
        } else if (item.media) {
          // Already have a media ID
          processedMediaItems.push(item)
        } else if (item.url && (item.url.startsWith('http') || item.url.startsWith('/'))) {
          // Already an URL (maybe from previous save)
          processedMediaItems.push(item)
        }
      }
    }

    // Handle background music: library URL or upload key -> public URL
    let backgroundMusicURL: string | undefined
    if (data.backgroundMusic && data.backgroundMusic.startsWith('http')) {
      backgroundMusicURL = data.backgroundMusic
    } else if (data.backgroundMusicKey) {
      const base = process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, '')
      backgroundMusicURL = base
        ? `${base}/${data.backgroundMusicKey}`
        : `/media/${encodeURIComponent(data.backgroundMusicKey)}`
    }

    // Remove processed fields from spread data to avoid validation errors (author comes from server only)
    const {
      frontImage: _,
      frontImageKey: __,
      frontImageMimeType: ___,
      frontImageFilesize: ____,
      frontExif: _____, // Remove from cleanData
      mediaItems: ______,
      id,
      author: _author,
      authorId: _authorId,
      backgroundMusicKey: _bgKey,
      backgroundMusicMimeType: _bgMime,
      backgroundMusicFilesize: _bgSize,
      ...cleanData
    } = data

    const currentUser = await getCurrentUser()
    const authorPayload = currentUser ? { author: currentUser.id } : {}

    if (existingId) {
      // Update existing postcard
      await payload.update({
        collection: 'postcards',
        id: existingId,
        data: {
          ...cleanData,
          ...(frontImageId && { frontImage: frontImageId }),
          ...(frontImageURL && { frontImageURL: frontImageURL }),
          ...(backgroundMusicURL && { backgroundMusic: backgroundMusicURL }),
          ...(data.backgroundMusicTitle && { backgroundMusicTitle: data.backgroundMusicTitle }),
          mediaItems: processedMediaItems,
          date: new Date().toISOString(),
          status: 'published',
          isPublic: true,
          ...authorPayload,
        },
      })
      const updated = await payload.findByID({
        collection: 'postcards',
        id: existingId,
        depth: 0,
      })
      const token = (updated as { contributionToken?: string }).contributionToken
      return { success: true, id: existingId, publicId: data.id, contributionToken: token }
    } else {
      // Generate a unique public ID
      let publicId = generatePublicId()
      let isUnique = false
      let retries = 0

      // Ensure uniqueness
      while (!isUnique && retries < 5) {
        const existing = await payload.find({
          collection: 'postcards',
          where: {
            publicId: {
              equals: publicId,
            },
          },
        })

        if (existing.totalDocs === 0) {
          isUnique = true
        } else {
          publicId = generatePublicId()
          retries++
        }
      }

      if (!isUnique) {
        throw new Error('Could not generate a unique ID. Please try again.')
      }

      // Create the postcard record (author set if user is logged in)
      const newPostcard = await payload.create({
        collection: 'postcards',
        data: {
          ...cleanData,
          frontImage: frontImageId,
          frontImageURL: frontImageURL,
          ...(backgroundMusicURL && { backgroundMusic: backgroundMusicURL }),
          ...(data.backgroundMusicTitle && { backgroundMusicTitle: data.backgroundMusicTitle }),
          mediaItems: processedMediaItems,
          publicId,
          date: new Date().toISOString(),
          status: 'published',
          isPublic: true,
          ...authorPayload,
        },
      })

      // Simulate sending emails/SMS (Log to console)
      if (data.recipients && Array.isArray(data.recipients)) {
        console.log(`[SIMULATION] Sending postcard ${publicId} to:`, data.recipients)
        // In a real app, you would integrate Resend/Twilio here
      }

      // Send creation confirmation email to the creator
      if (currentUser?.email) {
        ;(async () => {
          try {
            const { randomBytes } = await import('crypto')
            const { headers } = await import('next/headers')
            const headersList = await headers()
            const host = headersList.get('host') || 'localhost:3000'
            const protocol = host.includes('localhost') ? 'http' : 'https'
            const baseUrl = `${protocol}://${host}`

            // Generate a magic link token (valid 24 hours)
            const token = randomBytes(32).toString('hex')
            const expires = new Date(Date.now() + 24 * 3600 * 1000)

            await payload.update({
              collection: 'users',
              id: currentUser.id,
              data: {
                magicLinkToken: token,
                magicLinkExpires: expires.toISOString(),
              } as any,
            })

            const postcardPublicUrl = `${baseUrl}/view/${publicId}`
            const espaceClientUrl = `${baseUrl}/espace-client`
            // Magic link redirects to the editor for this specific card
            const editMagicLinkUrl = `${baseUrl}/api/magic-login?token=${token}&redirect=/editor/${publicId}`

            const html = generateCreatorConfirmationEmail({
              creatorName: currentUser.name ?? null,
              recipientName: data.recipientName ?? null,
              postcardPublicUrl,
              postcardImageUrl: frontImageURL ?? null,
              espaceClientUrl,
              editMagicLinkUrl,
            })

            await sendEmail({
              to: currentUser.email,
              subject: '✅ Votre carte postale est prête !',
              html,
            })
          } catch (err) {
            console.error('[EMAIL] Failed to send creator confirmation email:', err)
          }
        })()
      }

      const token = (newPostcard as { contributionToken?: string }).contributionToken
      return { success: true, id: newPostcard.id, publicId, contributionToken: token }
    }
  } catch (error) {
    console.error('Error creating/updating postcard:', error)
    if (isHeifUploadError(error)) {
      return {
        success: false,
        error:
          'Cette photo (format HEIC/iPhone) ne peut pas être traitée. Utilisez une photo en JPEG ou PNG.',
      }
    }
    const msg = error instanceof Error ? error.message : 'Failed to create postcard'
    return {
      success: false,
      error: msg.includes('upload')
        ? 'Erreur lors de l’envoi de l’image. Utilisez JPEG ou PNG.'
        : 'Impossible de créer la carte. Réessayez.',
    }
  }
}

export async function getContributionTokenForPostcard(publicId: string): Promise<string | null> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'postcards',
      where: { publicId: { equals: publicId } },
      depth: 0,
      limit: 1,
      overrideAccess: true,
    })
    if (result.totalDocs === 0) return null
    const doc = result.docs[0] as { contributionToken?: string }
    return doc.contributionToken ?? null
  } catch {
    return null
  }
}

export async function getPostcardByPublicId(publicId: string): Promise<Postcard | null> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'postcards',
      where: {
        and: [
          {
            publicId: {
              equals: publicId,
            },
          },
          {
            isPublic: {
              equals: true,
            },
          },
        ],
      },
      depth: 2, // Ensure we get media details
      overrideAccess: true,
    })

    if (result.totalDocs > 0) {
      return result.docs[0] as unknown as Postcard
    }
    return null
  } catch (error) {
    console.error('Error fetching postcard:', error)
    return null
  }
}
