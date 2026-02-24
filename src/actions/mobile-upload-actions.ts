'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { getCurrentUser } from '@/lib/auth'

/**
 * Generates a very short random code (5 chars) and stores it in the database.
 * No O/0 or I/1 to avoid confusion.
 */
function generateShortCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Generates a temporary short code for mobile uploads and stores it in Payload.
 * If a valid one already exists, returns it instead of generating a new one.
 */
export async function generateMobileUploadToken(): Promise<{
  success: boolean
  token?: string
  error?: string
}> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const payload = await getPayload({ config })

    // Check if user already has a valid code
    const fullUser = await payload.findByID({
      collection: 'users',
      id: user.id,
      select: {
        mobileUploadCode: true,
        mobileUploadCodeExpires: true,
      },
    })

    const now = new Date()
    if (
      fullUser.mobileUploadCode &&
      fullUser.mobileUploadCodeExpires &&
      new Date(fullUser.mobileUploadCodeExpires) > now
    ) {
      return { success: true, token: fullUser.mobileUploadCode }
    }

    const code = generateShortCode()
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    // Store code in user document
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        mobileUploadCode: code,
        mobileUploadCodeExpires: expires,
      },
    })

    return { success: true, token: code }
  } catch (error: any) {
    console.error('Error generating mobile upload token:', error)
    return { success: false, error: 'Erreur lors de la génération du code' }
  }
}

/**
 * Validates if a token is still valid.
 */
export async function validateMobileToken(token: string): Promise<{ success: boolean }> {
  try {
    const payload = await getPayload({ config })
    const userRes = await payload.find({
      collection: 'users',
      where: {
        and: [
          { mobileUploadCode: { equals: token } },
          { mobileUploadCodeExpires: { greater_than: new Date().toISOString() } },
        ],
      },
      limit: 1,
    })

    return { success: userRes.totalDocs > 0 }
  } catch (error) {
    return { success: false }
  }
}

/**
 * Verifies the mobile upload short code and adds the uploaded media.
 */
export async function verifyAndAddMobileGalleryImage(
  token: string,
  key: string,
  mimeType: string,
  filesize: number,
  alt: string,
  exif?: any,
): Promise<{ success: boolean; id?: number; error?: string }> {
  try {
    const payload = await getPayload({ config })

    // Find user by code and check expiration
    const userRes = await payload.find({
      collection: 'users',
      where: {
        and: [
          { mobileUploadCode: { equals: token } },
          { mobileUploadCodeExpires: { greater_than: new Date().toISOString() } },
        ],
      },
      limit: 1,
    })

    if (userRes.totalDocs === 0) {
      return { success: false, error: 'Code invalide ou expiré. Scannez à nouveau le QR code.' }
    }

    const userId = userRes.docs[0].id

    // Check for duplicate key in media
    const existingMedia = await payload.find({
      collection: 'media',
      where: { filename: { equals: key } },
    })

    if (existingMedia.totalDocs > 0) {
      return { success: true, id: existingMedia.docs[0].id as number }
    }

    // Create media linked to the user
    const media = await payload.create({
      collection: 'media',
      data: {
        alt: alt || 'Image téléchargée depuis mobile',
        filename: key,
        mimeType: mimeType || 'image/jpeg',
        filesize: filesize || 0,
        author: userId as any,
        ...(exif ? { exif } : {}),
      },
    })

    return { success: true, id: media.id as number }
  } catch (error: any) {
    console.error('Error verifying and adding mobile gallery image:', error)
    return { success: false, error: error.message || 'Erreur lors de la sauvegarde' }
  }
}
