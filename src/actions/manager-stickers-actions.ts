'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { Media } from '@/payload-types'
import { getCurrentUser } from '@/lib/auth'

async function requireAdmin(): Promise<void> {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
        throw new Error('Accès réservé aux administrateurs.')
    }
}

export async function getAllStickers(): Promise<any[]> {
    try {
        const payload = await getPayload({ config })
        const result = await payload.find({
            collection: 'stickers' as any,
            depth: 1,
            limit: 100,
            sort: 'name',
        })
        return result.docs
    } catch (error) {
        console.error('Error fetching stickers:', error)
        return []
    }
}

export async function createSticker(data: { name: string; imageId: number; category?: string }): Promise<{ success: boolean; data?: any; error?: string }> {
    await requireAdmin()
    try {
        const payload = await getPayload({ config })
        const result = await payload.create({
            collection: 'stickers' as any,
            data: {
                name: data.name,
                image: data.imageId,
                category: data.category || 'deco',
            },
        })
        return { success: true, data: result }
    } catch (error: any) {
        console.error('Error creating sticker:', error)
        return { success: false, error: error.message || 'Failed to create sticker' }
    }
}

export async function uploadStickerImage(base64Body: string, filename: string, name: string): Promise<{ success: boolean; data?: any; error?: string }> {
    await requireAdmin()
    try {
        const payload = await getPayload({ config })

        // Convert base64 to buffer
        const base64Data = base64Body.replace(/^data:image\/\w+;base64,/, '')
        const buffer = Buffer.from(base64Data, 'base64')

        // Create media item
        const media = await payload.create({
            collection: 'media',
            data: {
                alt: name,
            },
            file: {
                data: buffer,
                name: filename,
                mimetype: 'image/png',
                size: buffer.length,
            },
        })

        // Create sticker
        const sticker = await payload.create({
            collection: 'stickers' as any,
            data: {
                name,
                image: media.id,
                category: 'deco',
            },
        })

        return { success: true, data: sticker }
    } catch (error: any) {
        console.error('Error uploading sticker image:', error)
        return { success: false, error: error.message || 'Failed to upload sticker image' }
    }
}

export async function deleteSticker(id: number): Promise<{ success: boolean; error?: string }> {
    await requireAdmin()
    try {
        const payload = await getPayload({ config })
        await payload.delete({
            collection: 'stickers' as any,
            id,
        })
        return { success: true }
    } catch (error: any) {
        console.error('Error deleting sticker:', error)
        return { success: false, error: error.message || 'Failed to delete sticker' }
    }
}
