'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import type { Postcard } from '@/payload-types'
import { getCurrentUser } from '@/lib/auth'

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

        return {
            docs: result.docs as Postcard[],
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
    data: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
    const { allowed, error } = await ensureOwnership(id)
    if (!allowed) return { success: false, error }

    try {
        const payload = await getPayload({ config })

        const updateData: Record<string, unknown> = { ...data }

        if (data.frontImage && typeof data.frontImage === 'string' && data.frontImage.startsWith('data:image')) {
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
            updateData.frontImageURL = mediaDoc.url ?? (mediaDoc.filename ? `/media/${encodeURIComponent(mediaDoc.filename)}` : undefined)
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
    status: 'published' | 'draft' | 'archived'
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
