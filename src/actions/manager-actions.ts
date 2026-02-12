'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { Postcard } from '@/payload-types'

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
