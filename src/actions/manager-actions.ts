'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { Postcard, User, Agency } from '@/payload-types'
import { getCurrentUser } from '@/lib/auth'

async function requireAdmin(): Promise<void> {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
        throw new Error('Accès réservé aux administrateurs.')
    }
}

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

export async function getAllPostcards(filters?: PostcardFilters): Promise<PostcardsResult> {
    await requireAdmin()
    try {
        const payload = await getPayload({ config })

        const where: any = {}

        if (filters?.status) {
            where.status = { equals: filters.status }
        }

        if (filters?.search) {
            where.or = [
                { senderName: { contains: filters.search } },
                { recipientName: { contains: filters.search } },
                { location: { contains: filters.search } },
                { message: { contains: filters.search } },
            ]
        }

        const result = await payload.find({
            collection: 'postcards',
            where: Object.keys(where).length > 0 ? where : undefined,
            page: filters?.page || 1,
            limit: filters?.limit || 50,
            sort: filters?.sort || '-createdAt',
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
        console.error('Error fetching postcards:', error)
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

export async function updatePostcardStatus(
    id: number,
    status: 'published' | 'draft' | 'archived'
): Promise<{ success: boolean; error?: string }> {
    await requireAdmin()
    try {
        const payload = await getPayload({ config })

        await payload.update({
            collection: 'postcards',
            id,
            data: { status },
        })

        return { success: true }
    } catch (error) {
        console.error('Error updating postcard status:', error)
        return { success: false, error: 'Failed to update status' }
    }
}

export async function deletePostcard(
    id: number
): Promise<{ success: boolean; error?: string }> {
    await requireAdmin()
    try {
        const payload = await getPayload({ config })

        await payload.delete({
            collection: 'postcards',
            id,
        })

        return { success: true }
    } catch (error) {
        console.error('Error deleting postcard:', error)
        return { success: false, error: 'Failed to delete postcard' }
    }
}

export async function updatePostcard(
    id: number,
    data: any
): Promise<{ success: boolean; error?: string }> {
    await requireAdmin()
    try {
        const payload = await getPayload({ config })

        const updateData: any = { ...data }

        // Handle front image update if it's base64
        if (data.frontImage && data.frontImage.startsWith('data:image')) {
            const [meta, base64Data] = data.frontImage.split(',')
            const mime = meta.match(/:(.*?);/)?.[1] || 'image/png'
            const extension = mime.split('/')[1] || 'png'
            const buffer = Buffer.from(base64Data, 'base64')

            const media = await payload.create({
                collection: 'media',
                data: {
                    alt: `Updated Front Image for postcard ${data.recipientName || 'unnamed'}`,
                },
                file: {
                    data: buffer,
                    mimetype: mime,
                    name: `postcard-front-${Date.now()}.${extension}`,
                    size: buffer.length,
                },
            })

            updateData.frontImage = media.id
            const mediaDoc = media as { url?: string | null; filename?: string | null }
            updateData.frontImageURL = mediaDoc.url ?? (mediaDoc.filename ? `/api/media/file/${encodeURIComponent(mediaDoc.filename)}` : undefined)
        }

        await payload.update({
            collection: 'postcards',
            id,
            data: updateData,
        })

        return { success: true }
    } catch (error: any) {
        console.error('Error updating postcard:', error)
        return { success: false, error: error.message || 'Failed to update postcard' }
    }
}

export interface ManagerStats {
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

export async function getManagerStats(): Promise<ManagerStats> {
    await requireAdmin()
    try {
        const payload = await getPayload({ config })
        const [postcards, users, agencies] = await Promise.all([
            payload.find({ collection: 'postcards', limit: 0, depth: 0 }),
            payload.find({ collection: 'users', limit: 0, depth: 0 }),
            payload.find({ collection: 'agencies', limit: 0, depth: 0 }),
        ])

        const [publishedRes, draftRes, archivedRes, premiumRes] = await Promise.all([
            payload.find({ collection: 'postcards', where: { status: { equals: 'published' } }, limit: 0, depth: 0 }),
            payload.find({ collection: 'postcards', where: { status: { equals: 'draft' } }, limit: 0, depth: 0 }),
            payload.find({ collection: 'postcards', where: { status: { equals: 'archived' } }, limit: 0, depth: 0 }),
            payload.find({ collection: 'postcards', where: { isPremium: { equals: true } }, limit: 0, depth: 0 }),
        ])

        // Sum views and shares from all postcards
        const allCards = await payload.find({ collection: 'postcards', limit: 1000, depth: 0 })
        const totalViews = allCards.docs.reduce((sum, card) => sum + (card.views || 0), 0)
        const totalShares = allCards.docs.reduce((sum, card) => sum + (card.shares || 0), 0)

        return {
            totalPostcards: postcards.totalDocs,
            totalUsers: users.totalDocs,
            totalAgencies: agencies.totalDocs,
            publishedPostcards: publishedRes.totalDocs,
            draftPostcards: draftRes.totalDocs,
            archivedPostcards: archivedRes.totalDocs,
            premiumPostcards: premiumRes.totalDocs,
            totalViews,
            totalShares,
        }
    } catch (error) {
        console.error('Error fetching manager stats:', error)
        return {
            totalPostcards: 0, totalUsers: 0, totalAgencies: 0,
            publishedPostcards: 0, draftPostcards: 0, archivedPostcards: 0,
            premiumPostcards: 0, totalViews: 0, totalShares: 0
        }
    }
}

export interface UsersResult {
    docs: User[]
    totalDocs: number
    totalPages: number
    page: number
}

export async function getAllUsers(params?: { page?: number; limit?: number; search?: string }): Promise<UsersResult> {
    await requireAdmin()
    try {
        const payload = await getPayload({ config })
        const where: any = {}
        if (params?.search?.trim()) {
            where.or = [
                { email: { contains: params.search } },
                { name: { contains: params.search } },
                { company: { contains: params.search } },
            ]
        }
        const result = await payload.find({
            collection: 'users',
            where: Object.keys(where).length > 0 ? where : undefined,
            page: params?.page ?? 1,
            limit: params?.limit ?? 50,
            sort: '-createdAt',
            depth: 0,
        })
        return {
            docs: result.docs as User[],
            totalDocs: result.totalDocs,
            totalPages: result.totalPages,
            page: result.page ?? 1,
        }
    } catch (error) {
        console.error('Error fetching users:', error)
        return { docs: [], totalDocs: 0, totalPages: 0, page: 1 }
    }
}

export async function createUser(data: any): Promise<{ success: boolean; data?: User; error?: string }> {
    await requireAdmin()
    try {
        const payload = await getPayload({ config })
        const result = await payload.create({
            collection: 'users',
            data,
        })
        return { success: true, data: result as User }
    } catch (error: any) {
        console.error('Error creating user:', error)
        return { success: false, error: error.message || 'Failed to create user' }
    }
}

export async function updateUser(id: number | string, data: any): Promise<{ success: boolean; data?: User; error?: string }> {
    await requireAdmin()
    try {
        const payload = await getPayload({ config })
        const result = await payload.update({
            collection: 'users',
            id,
            data,
        })
        return { success: true, data: result as User }
    } catch (error: any) {
        console.error('Error updating user:', error)
        return { success: false, error: error.message || 'Failed to update user' }
    }
}

export async function deleteUser(id: number | string): Promise<{ success: boolean; error?: string }> {
    await requireAdmin()
    try {
        const payload = await getPayload({ config })
        await payload.delete({
            collection: 'users',
            id,
        })
        return { success: true }
    } catch (error: any) {
        console.error('Error deleting user:', error)
        return { success: false, error: error.message || 'Failed to delete user' }
    }
}

// --- Agencies Actions ---

export interface AgenciesResult {
    docs: Agency[]
    totalDocs: number
    totalPages: number
    page: number
}

export async function getAllAgencies(params?: { page?: number; limit?: number; search?: string }): Promise<AgenciesResult> {
    await requireAdmin()
    try {
        const payload = await getPayload({ config })
        const where: any = {}
        if (params?.search?.trim()) {
            where.name = { contains: params.search }
        }
        const result = await payload.find({
            collection: 'agencies',
            where: Object.keys(where).length > 0 ? where : undefined,
            page: params?.page ?? 1,
            limit: params?.limit ?? 50,
            sort: '-createdAt',
            depth: 1,
        })
        return {
            docs: result.docs as Agency[],
            totalDocs: result.totalDocs,
            totalPages: result.totalPages,
            page: result.page ?? 1,
        }
    } catch (error) {
        console.error('Error fetching agencies:', error)
        return { docs: [], totalDocs: 0, totalPages: 0, page: 1 }
    }
}

export async function createAgency(data: any): Promise<{ success: boolean; data?: Agency; error?: string }> {
    await requireAdmin()
    try {
        const payload = await getPayload({ config })
        const result = await payload.create({
            collection: 'agencies',
            data,
        })
        return { success: true, data: result as Agency }
    } catch (error: any) {
        console.error('Error creating agency:', error)
        return { success: false, error: error.message || 'Failed to create agency' }
    }
}

export async function updateAgency(id: number | string, data: any): Promise<{ success: boolean; data?: Agency; error?: string }> {
    await requireAdmin()
    try {
        const payload = await getPayload({ config })
        const result = await payload.update({
            collection: 'agencies',
            id,
            data,
        })
        return { success: true, data: result as Agency }
    } catch (error: any) {
        console.error('Error updating agency:', error)
        return { success: false, error: error.message || 'Failed to update agency' }
    }
}

export async function deleteAgency(id: number | string): Promise<{ success: boolean; error?: string }> {
    await requireAdmin()
    try {
        const payload = await getPayload({ config })
        await payload.delete({
            collection: 'agencies',
            id,
        })
        return { success: true }
    } catch (error: any) {
        console.error('Error deleting agency:', error)
        return { success: false, error: error.message || 'Failed to delete agency' }
    }
}
