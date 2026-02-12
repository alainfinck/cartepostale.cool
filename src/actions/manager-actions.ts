'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { Postcard, User } from '@/payload-types'
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

export interface ManagerStats {
    totalPostcards: number
    totalUsers: number
    publishedPostcards: number
    draftPostcards: number
}

export async function getManagerStats(): Promise<ManagerStats> {
    await requireAdmin()
    try {
        const payload = await getPayload({ config })
        const [postcards, users] = await Promise.all([
            payload.find({ collection: 'postcards', limit: 0, depth: 0 }),
            payload.find({ collection: 'users', limit: 0, depth: 0 }),
        ])
        const [publishedRes, draftRes] = await Promise.all([
            payload.find({ collection: 'postcards', where: { status: { equals: 'published' } }, limit: 1, depth: 0 }),
            payload.find({ collection: 'postcards', where: { status: { equals: 'draft' } }, limit: 1, depth: 0 }),
        ])
        return {
            totalPostcards: postcards.totalDocs,
            totalUsers: users.totalDocs,
            publishedPostcards: publishedRes.totalDocs,
            draftPostcards: draftRes.totalDocs,
        }
    } catch (error) {
        console.error('Error fetching manager stats:', error)
        return { totalPostcards: 0, totalUsers: 0, publishedPostcards: 0, draftPostcards: 0 }
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
            limit: params?.limit ?? 20,
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
