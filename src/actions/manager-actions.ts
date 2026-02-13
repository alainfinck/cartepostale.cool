'use server'

import { getPayload } from 'payload'
import type { Where } from 'payload'
import config from '@payload-config'
import { Postcard, User, Agency, Gallery, GalleryCategory, GalleryTag } from '@/payload-types'
import { getCurrentUser } from '@/lib/auth'
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3'

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

/** Bulk update status for multiple postcards (admin only). */
export async function updatePostcardStatusBulk(
    ids: number[],
    status: 'published' | 'draft' | 'archived'
): Promise<{ success: boolean; updatedCount?: number; error?: string }> {
    await requireAdmin()
    if (!ids.length) return { success: true, updatedCount: 0 }
    try {
        const payload = await getPayload({ config })
        let updatedCount = 0
        for (const id of ids) {
            await payload.update({
                collection: 'postcards',
                id,
                data: { status },
            })
            updatedCount++
        }
        return { success: true, updatedCount }
    } catch (error) {
        console.error('Error bulk updating postcard status:', error)
        return { success: false, error: 'Failed to update status' }
    }
}

/** Bulk delete postcards (admin only). */
export async function deletePostcardsBulk(
    ids: number[]
): Promise<{ success: boolean; deletedCount?: number; error?: string }> {
    await requireAdmin()
    if (!ids.length) return { success: true, deletedCount: 0 }
    try {
        const payload = await getPayload({ config })
        let deletedCount = 0
        for (const id of ids) {
            await payload.delete({
                collection: 'postcards',
                id,
            })
            deletedCount++
        }
        return { success: true, deletedCount }
    } catch (error) {
        console.error('Error bulk deleting postcards:', error)
        return { success: false, error: 'Failed to delete postcards' }
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

        // Handle front image: direct R2 key (presigned upload) or base64 fallback
        if (data.frontImageKey) {
            const media = await payload.create({
                collection: 'media',
                data: {
                    alt: `Updated Front Image for postcard ${data.recipientName || 'unnamed'}`,
                    filename: data.frontImageKey,
                    mimeType: data.frontImageMimeType || 'image/jpeg',
                    filesize: data.frontImageFilesize ?? 0,
                },
            })
            updateData.frontImage = media.id
            const mediaDoc = media as { url?: string | null; filename?: string | null }
            updateData.frontImageURL = mediaDoc.url ?? (mediaDoc.filename ? `/media/${encodeURIComponent(mediaDoc.filename)}` : undefined)
            delete updateData.frontImageKey
            delete updateData.frontImageMimeType
            delete updateData.frontImageFilesize
        } else if (data.frontImage && data.frontImage.startsWith('data:image')) {
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
            updateData.frontImageURL = mediaDoc.url ?? (mediaDoc.filename ? `/media/${encodeURIComponent(mediaDoc.filename)}` : undefined)
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

// --- Gallery Categories ---

export interface GalleryCategoriesResult {
    docs: GalleryCategory[]
    totalDocs: number
    totalPages: number
    page: number
}

export async function getAllGalleryCategories(params?: { page?: number; limit?: number; search?: string }): Promise<GalleryCategoriesResult> {
    await requireAdmin()
    try {
        const payload = await getPayload({ config })
        const where: Where = {}
        if (params?.search?.trim()) {
            where.name = { contains: params.search }
        }
        const result = await payload.find({
            collection: 'gallery-categories',
            where: Object.keys(where).length > 0 ? where : undefined,
            page: params?.page ?? 1,
            limit: params?.limit ?? 100,
            sort: 'name',
            depth: 0,
        })
        return {
            docs: result.docs as GalleryCategory[],
            totalDocs: result.totalDocs,
            totalPages: result.totalPages,
            page: result.page ?? 1,
        }
    } catch (error) {
        console.error('Error fetching gallery categories:', error)
        return { docs: [], totalDocs: 0, totalPages: 0, page: 1 }
    }
}

export async function createGalleryCategory(data: { name: string; slug?: string; description?: string }): Promise<{ success: boolean; data?: GalleryCategory; error?: string }> {
    await requireAdmin()
    try {
        const payload = await getPayload({ config })
        const result = await payload.create({
            collection: 'gallery-categories',
            data: data as never,
        })
        return { success: true, data: result as GalleryCategory }
    } catch (error: unknown) {
        console.error('Error creating gallery category:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Failed to create category' }
    }
}

export async function updateGalleryCategory(id: number | string, data: { name?: string; slug?: string; description?: string }): Promise<{ success: boolean; data?: GalleryCategory; error?: string }> {
    await requireAdmin()
    try {
        const payload = await getPayload({ config })
        const result = await payload.update({
            collection: 'gallery-categories',
            id,
            data,
        })
        return { success: true, data: result as GalleryCategory }
    } catch (error: unknown) {
        console.error('Error updating gallery category:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Failed to update category' }
    }
}

export async function deleteGalleryCategory(id: number | string): Promise<{ success: boolean; error?: string }> {
    await requireAdmin()
    try {
        const payload = await getPayload({ config })
        await payload.delete({
            collection: 'gallery-categories',
            id,
        })
        return { success: true }
    } catch (error: unknown) {
        console.error('Error deleting gallery category:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Failed to delete category' }
    }
}

// --- Gallery Tags ---

export interface GalleryTagsResult {
    docs: GalleryTag[]
    totalDocs: number
    totalPages: number
    page: number
}

export async function getAllGalleryTags(params?: { page?: number; limit?: number; search?: string }): Promise<GalleryTagsResult> {
    await requireAdmin()
    try {
        const payload = await getPayload({ config })
        const where: Where = {}
        if (params?.search?.trim()) {
            where.name = { contains: params.search }
        }
        const result = await payload.find({
            collection: 'gallery-tags',
            where: Object.keys(where).length > 0 ? where : undefined,
            page: params?.page ?? 1,
            limit: params?.limit ?? 100,
            sort: 'name',
            depth: 0,
        })
        return {
            docs: result.docs as GalleryTag[],
            totalDocs: result.totalDocs,
            totalPages: result.totalPages,
            page: result.page ?? 1,
        }
    } catch (error) {
        console.error('Error fetching gallery tags:', error)
        return { docs: [], totalDocs: 0, totalPages: 0, page: 1 }
    }
}

export async function createGalleryTag(data: { name: string; slug?: string }): Promise<{ success: boolean; data?: GalleryTag; error?: string }> {
    await requireAdmin()
    try {
        const payload = await getPayload({ config })
        const result = await payload.create({
            collection: 'gallery-tags',
            data: data as never,
        })
        return { success: true, data: result as GalleryTag }
    } catch (error: unknown) {
        console.error('Error creating gallery tag:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Failed to create tag' }
    }
}

export async function updateGalleryTag(id: number | string, data: { name?: string; slug?: string }): Promise<{ success: boolean; data?: GalleryTag; error?: string }> {
    await requireAdmin()
    try {
        const payload = await getPayload({ config })
        const result = await payload.update({
            collection: 'gallery-tags',
            id,
            data,
        })
        return { success: true, data: result as GalleryTag }
    } catch (error: unknown) {
        console.error('Error updating gallery tag:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Failed to update tag' }
    }
}

export async function deleteGalleryTag(id: number | string): Promise<{ success: boolean; error?: string }> {
    await requireAdmin()
    try {
        const payload = await getPayload({ config })
        await payload.delete({
            collection: 'gallery-tags',
            id,
        })
        return { success: true }
    } catch (error: unknown) {
        console.error('Error deleting gallery tag:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Failed to delete tag' }
    }
}

// --- Gallery (images) ---

export interface GalleryFilters {
    category?: number
    tag?: number
    search?: string
    page?: number
    limit?: number
    sort?: string
}

export interface GalleryResult {
    docs: Gallery[]
    totalDocs: number
    totalPages: number
    page: number
    hasNextPage: boolean
    hasPrevPage: boolean
}

export async function getAllGalleryImages(filters?: GalleryFilters): Promise<GalleryResult> {
    await requireAdmin()
    try {
        const payload = await getPayload({ config })
        const where: Where = {}

        if (filters?.category) {
            where.category = { equals: filters.category }
        }
        if (filters?.tag) {
            where.tags = { in: [filters.tag] }
        }
        if (filters?.search?.trim()) {
            where.or = [
                { title: { contains: filters.search } },
                { caption: { contains: filters.search } },
            ]
        }

        const result = await payload.find({
            collection: 'gallery',
            where: Object.keys(where).length > 0 ? where : undefined,
            page: filters?.page ?? 1,
            limit: filters?.limit ?? 24,
            sort: filters?.sort ?? 'order',
            depth: 2,
        })

        return {
            docs: result.docs as Gallery[],
            totalDocs: result.totalDocs,
            totalPages: result.totalPages,
            page: result.page ?? 1,
            hasNextPage: result.hasNextPage ?? false,
            hasPrevPage: result.hasPrevPage ?? false,
        }
    } catch (error) {
        console.error('Error fetching gallery images:', error)
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

export async function createGalleryImage(data: Partial<Gallery> & { title: string; image: number }): Promise<{ success: boolean; data?: Gallery; error?: string }> {
    await requireAdmin()
    try {
        const payload = await getPayload({ config })
        const result = await payload.create({
            collection: 'gallery',
            data: {
                title: data.title,
                image: data.image,
                caption: data.caption ?? undefined,
                category: data.category ?? undefined,
                tags: data.tags ?? undefined,
                order: data.order ?? 0,
            },
        })
        return { success: true, data: result as Gallery }
    } catch (error: unknown) {
        console.error('Error creating gallery image:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Failed to create image' }
    }
}

export async function updateGalleryImage(id: number | string, data: Partial<Gallery>): Promise<{ success: boolean; data?: Gallery; error?: string }> {
    await requireAdmin()
    try {
        const payload = await getPayload({ config })
        const result = await payload.update({
            collection: 'gallery',
            id,
            data,
        })
        return { success: true, data: result as Gallery }
    } catch (error: unknown) {
        console.error('Error updating gallery image:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Failed to update image' }
    }
}

export async function deleteGalleryImage(id: number | string): Promise<{ success: boolean; error?: string }> {
    await requireAdmin()
    try {
        const payload = await getPayload({ config })
        await payload.delete({
            collection: 'gallery',
            id,
        })
        return { success: true }
    } catch (error: unknown) {
        console.error('Error deleting gallery image:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Failed to delete image' }
    }
}

/** List media for gallery image picker (admin only). */
export async function getMediaForGallery(params?: { limit?: number; search?: string }): Promise<{ docs: { id: number; alt: string; url?: string | null; filename?: string | null }[] }> {
    await requireAdmin()
    try {
        const payload = await getPayload({ config })
        const where: Where = {}
        if (params?.search?.trim()) {
            where.alt = { contains: params.search }
        }
        const result = await payload.find({
            collection: 'media',
            where: Object.keys(where).length > 0 ? where : undefined,
            limit: params?.limit ?? 50,
            sort: '-createdAt',
            depth: 0,
        })
        const docs = (result.docs as { id: number; alt?: string; url?: string | null; filename?: string | null }[]).map((d) => ({
            id: d.id,
            alt: d.alt ?? '',
            url: d.url ?? null,
            filename: d.filename ?? null,
        }))
        return { docs }
    } catch (error) {
        console.error('Error fetching media for gallery:', error)
        return { docs: [] }
    }
}

const cleanEnv = (v?: string) => v?.trim().replace(/^['"]|['"]$/g, '').split('=').pop()?.trim() || ''

const R2_BUCKET = process.env.S3_BUCKET
const R2_ENDPOINT = process.env.S3_ENDPOINT
const R2_ACCESS_KEY = cleanEnv(process.env.S3_ACCESS_KEY_ID)
const R2_SECRET_KEY = cleanEnv(process.env.S3_SECRET_ACCESS_KEY)
const R2_PUBLIC_BASE_URL = process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, '')

function getR2Client(): S3Client | null {
    if (!R2_BUCKET || !R2_ACCESS_KEY || !R2_SECRET_KEY || !R2_ENDPOINT) return null
    const isR2 = R2_ENDPOINT.includes('r2.cloudflarestorage.com')
    return new S3Client({
        credentials: { accessKeyId: R2_ACCESS_KEY, secretAccessKey: R2_SECRET_KEY },
        region: process.env.S3_REGION || 'us-east-1',
        endpoint: R2_ENDPOINT,
        forcePathStyle: true,
    })
}

export interface R2ObjectItem {
    key: string
    size: number
    lastModified: string | null
    publicUrl: string | null
}

export interface ListR2Result {
    objects: R2ObjectItem[]
    prefixes: string[]
    publicBaseUrl: string | null
    configured: boolean
}

/** List R2 bucket contents (admin only). Prefix without trailing slash; empty = root. */
export async function listR2Objects(prefix?: string, maxKeys = 100): Promise<ListR2Result> {
    await requireAdmin()
    const client = getR2Client()
    if (!client || !R2_BUCKET) {
        return { objects: [], prefixes: [], publicBaseUrl: R2_PUBLIC_BASE_URL ?? null, configured: false }
    }
    try {
        const delimiter = '/'
        const cmd = new ListObjectsV2Command({
            Bucket: R2_BUCKET,
            Prefix: prefix ? (prefix.endsWith('/') ? prefix : prefix + '/') : '',
            Delimiter: delimiter,
            MaxKeys: maxKeys,
        })
        const out = await client.send(cmd)
        const objects: R2ObjectItem[] = (out.Contents ?? []).map((c) => {
            const key = c.Key ?? ''
            const pathEncoded = key.split('/').map(encodeURIComponent).join('/')
            return {
                key,
                size: c.Size ?? 0,
                lastModified: c.LastModified?.toISOString() ?? null,
                publicUrl: R2_PUBLIC_BASE_URL ? `${R2_PUBLIC_BASE_URL}/${pathEncoded}` : null,
            }
        })
        const prefixes: string[] = (out.CommonPrefixes ?? []).map((p) => (p.Prefix ?? '').replace(/\/$/, ''))
        return {
            objects,
            prefixes,
            publicBaseUrl: R2_PUBLIC_BASE_URL ?? null,
            configured: true,
        }
    } catch (error) {
        console.error('Error listing R2:', error)
        return { objects: [], prefixes: [], publicBaseUrl: R2_PUBLIC_BASE_URL ?? null, configured: true }
    }
}
