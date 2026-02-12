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

export async function createPostcard(data: any): Promise<{ success: boolean; publicId?: string; error?: string }> {
    try {
        const payload = await getPayload({ config })

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

        // Create the postcard record
        const newPostcard = await payload.create({
            collection: 'postcards',
            data: {
                ...data,
                publicId,
                date: new Date().toISOString(), // Ensure date is set if not provided
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
        return { success: false, error: 'Failed to create postcard' }
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
