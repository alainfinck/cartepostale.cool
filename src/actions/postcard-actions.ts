'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { Postcard } from '@/payload-types'

// Simple ID generator for public URLs (shorter than UUID)
function generatePublicId(length = 10) {
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

export async function createPostcard(data: any): Promise<{ success: boolean; publicId?: string; error?: string }> {
    try {
        // Reject HEIC/HEIF upfront — Sharp/libvips often can't decode them
        if (data.frontImage && isHeicDataUrl(data.frontImage)) {
            return {
                success: false,
                error: 'Le format HEIC (photo iPhone) n’est pas supporté. Utilisez une photo en JPEG ou PNG, ou convertissez-la dans Réglages > Appareil photo > Formats.',
            }
        }
        if (data.mediaItems && Array.isArray(data.mediaItems)) {
            for (const item of data.mediaItems) {
                if (item?.url && isHeicDataUrl(item.url)) {
                    return {
                        success: false,
                        error: 'Une photo de l’album est au format HEIC (iPhone), non supporté. Utilisez des photos en JPEG ou PNG.',
                    }
                }
            }
        }

        const payload = await getPayload({ config })

        // Handle images
        let frontImageId: number | undefined;
        let frontImageURL: string | undefined;

        if (data.frontImage) {
            if (data.frontImage.startsWith('data:image')) {
                // Base64 upload
                const [meta, base64Data] = data.frontImage.split(',');
                const mime = meta.match(/:(.*?);/)?.[1] || 'image/png';
                const extension = mime.split('/')[1] || 'png';
                const buffer = Buffer.from(base64Data, 'base64');
                
                const media = await payload.create({
                    collection: 'media',
                    data: {
                        alt: `Front Image for postcard ${data.recipientName || 'unnamed'}`,
                    },
                    file: {
                        data: buffer,
                        mimetype: mime,
                        name: `postcard-front-${Date.now()}.${extension}`,
                        size: buffer.length,
                    },
                })
                frontImageId = media.id as number;
            } else if (data.frontImage.startsWith('http')) {
                // External URL (template)
                frontImageURL = data.frontImage;
            }
        }

        // Handle mediaItems (album)
        const processedMediaItems = [];
        if (data.mediaItems && Array.isArray(data.mediaItems)) {
            for (const item of data.mediaItems) {
                if (item.url && item.url.startsWith('data:')) {
                    const [meta, base64Data] = item.url.split(',');
                    const mime = meta.match(/:(.*?);/)?.[1] || 'image/png';
                    const extension = mime.split('/')[1] || 'png';
                    const buffer = Buffer.from(base64Data, 'base64');
                    
                    const media = await payload.create({
                        collection: 'media',
                        data: {
                            alt: `Album item for postcard`,
                        },
                        file: {
                            data: buffer,
                            mimetype: mime,
                            name: `postcard-album-${Date.now()}.${extension}`,
                            size: buffer.length,
                        },
                    })
                    processedMediaItems.push({
                        media: media.id,
                        type: item.type || 'image'
                    });
                } else if (item.media) {
                    // Already have a media ID
                    processedMediaItems.push(item);
                }
            }
        }

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

        // Remove processed fields from spread data to avoid validation errors
        const { frontImage, mediaItems, id, ...cleanData } = data;

        // Create the postcard record
        const newPostcard = await payload.create({
            collection: 'postcards',
            data: {
                ...cleanData,
                frontImage: frontImageId,
                frontImageURL: frontImageURL,
                mediaItems: processedMediaItems,
                publicId,
                date: new Date().toISOString(),
                status: 'published', // Automatically publish when created from editor
            },
        })

        // Simulate sending emails/SMS (Log to console)
        if (data.recipients && Array.isArray(data.recipients)) {
            console.log(`[SIMULATION] Sending postcard ${publicId} to:`, data.recipients)
            // In a real app, you would integrate Resend/Twilio here
        }

        return { success: true, publicId }
    } catch (error) {
        console.error('Error creating postcard:', error)
        if (isHeifUploadError(error)) {
            return {
                success: false,
                error: 'Cette photo (format HEIC/iPhone) ne peut pas être traitée. Utilisez une photo en JPEG ou PNG.',
            }
        }
        const msg = error instanceof Error ? error.message : 'Failed to create postcard'
        return { success: false, error: msg.includes('upload') ? 'Erreur lors de l’envoi de l’image. Utilisez JPEG ou PNG.' : 'Impossible de créer la carte. Réessayez.' }
    }
}

export async function getPostcardByPublicId(publicId: string): Promise<Postcard | null> {
    try {
        const payload = await getPayload({ config })
        const result = await payload.find({
            collection: 'postcards',
            where: {
                publicId: {
                    equals: publicId
                }
            },
            depth: 2, // Ensure we get media details
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
