'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import type { Postcard, Agency, PostcardTrackingLink } from '@/payload-types'
import { getCurrentUser } from '@/lib/auth'
import { sendEmail, generateTrackingLinkEmail } from '@/lib/email-service'
import { headers } from 'next/headers'

// --- Auth helper ---

async function requireAgence(): Promise<{ userId: number; agencyId: number }> {
    const user = await getCurrentUser()
    if (!user || user.role !== 'agence') {
        throw new Error('Accès réservé aux comptes agence.')
    }
    if (!user.agency) {
        throw new Error('Aucune agence associée à votre compte.')
    }
    return { userId: user.id, agencyId: user.agency }
}

// --- Ownership check ---

async function ensureAgencyOwnership(postcardId: number, agencyId: number): Promise<{ allowed: boolean; error?: string }> {
    const payload = await getPayload({ config })
    const doc = await payload.findByID({
        collection: 'postcards',
        id: postcardId,
        depth: 0,
    })
    const docAgencyId = typeof doc.agency === 'object' && doc.agency ? (doc.agency as { id: number }).id : doc.agency
    if (docAgencyId !== agencyId) {
        return { allowed: false, error: 'Cette carte n\'appartient pas à votre agence.' }
    }
    return { allowed: true }
}

// --- Types ---

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

// --- Agency postcards ---

export async function getAgencyPostcards(filters?: PostcardFilters): Promise<PostcardsResult> {
    const { agencyId } = await requireAgence()
    try {
        const payload = await getPayload({ config })

        const where: Record<string, any> = {
            agency: { equals: agencyId },
        }

        if (filters?.status) {
            where.status = { equals: filters.status }
        }

        if (filters?.search?.trim()) {
            const and: any[] = [
                { agency: { equals: agencyId } },
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
            delete where.agency
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
        console.error('Error fetching agency postcards:', error)
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

// --- Agency stats ---

export interface AgencyStats {
    totalPostcards: number
    publishedPostcards: number
    draftPostcards: number
    archivedPostcards: number
    totalViews: number
    totalShares: number
}

export async function getAgencyStats(): Promise<AgencyStats> {
    const { agencyId } = await requireAgence()
    try {
        const payload = await getPayload({ config })
        const base = { agency: { equals: agencyId } }

        const [all, published, draft, archived] = await Promise.all([
            payload.find({ collection: 'postcards', where: base, limit: 1000, depth: 0 }),
            payload.find({ collection: 'postcards', where: { ...base, status: { equals: 'published' } }, limit: 0, depth: 0 }),
            payload.find({ collection: 'postcards', where: { ...base, status: { equals: 'draft' } }, limit: 0, depth: 0 }),
            payload.find({ collection: 'postcards', where: { ...base, status: { equals: 'archived' } }, limit: 0, depth: 0 }),
        ])

        const totalViews = all.docs.reduce((sum, card) => sum + ((card as Postcard).views || 0), 0)
        const totalShares = all.docs.reduce((sum, card) => sum + ((card as Postcard).shares || 0), 0)

        return {
            totalPostcards: all.totalDocs,
            publishedPostcards: published.totalDocs,
            draftPostcards: draft.totalDocs,
            archivedPostcards: archived.totalDocs,
            totalViews,
            totalShares,
        }
    } catch (error) {
        console.error('Error fetching agency stats:', error)
        return {
            totalPostcards: 0,
            publishedPostcards: 0,
            draftPostcards: 0,
            archivedPostcards: 0,
            totalViews: 0,
            totalShares: 0,
        }
    }
}

// --- Agency view stats (analytics) ---

export interface PostcardViewStats {
    totalViews: number
    uniqueSessions: number
    byCountry: { country: string; count: number }[]
    byBrowser: { browser: string; count: number }[]
    avgDurationSeconds: number | null
    recentEvents: { openedAt: string; country: string | null; browser: string | null; durationSeconds: number | null }[]
}

export async function getAgencyViewStats(): Promise<PostcardViewStats | null> {
    const { agencyId } = await requireAgence()
    try {
        const payload = await getPayload({ config })
        // Get all postcards belonging to the agency
        const postcards = await payload.find({
            collection: 'postcards',
            where: { agency: { equals: agencyId } },
            limit: 1000,
            depth: 0,
        })
        const postcardIds = postcards.docs.map((p) => p.id)
        if (postcardIds.length === 0) return null

        const result = await payload.find({
            collection: 'postcard-view-events',
            where: { postcard: { in: postcardIds } },
            limit: 10000,
            depth: 0,
            sort: '-openedAt',
            overrideAccess: true,
        })

        const docs = result.docs as Array<{
            sessionId: string
            country?: string | null
            browser?: string | null
            durationSeconds?: number | null
            closedAt?: string | null
            openedAt: string
        }>

        const totalViews = docs.length
        const uniqueSessions = new Set(docs.map((d) => d.sessionId)).size
        const byCountryMap: Record<string, number> = {}
        const byBrowserMap: Record<string, number> = {}
        let durationSum = 0
        let durationCount = 0
        for (const d of docs) {
            const country = d.country || '(inconnu)'
            byCountryMap[country] = (byCountryMap[country] || 0) + 1
            const browser = d.browser || '(inconnu)'
            byBrowserMap[browser] = (byBrowserMap[browser] || 0) + 1
            if (d.closedAt != null && d.durationSeconds != null) {
                durationSum += d.durationSeconds
                durationCount++
            }
        }

        return {
            totalViews,
            uniqueSessions,
            byCountry: Object.entries(byCountryMap).map(([country, count]) => ({ country, count })).sort((a, b) => b.count - a.count).slice(0, 10),
            byBrowser: Object.entries(byBrowserMap).map(([browser, count]) => ({ browser, count })).sort((a, b) => b.count - a.count).slice(0, 5),
            avgDurationSeconds: durationCount > 0 ? durationSum / durationCount : null,
            recentEvents: docs.slice(0, 15).map((d) => ({
                openedAt: d.openedAt,
                country: d.country ?? null,
                browser: d.browser ?? null,
                durationSeconds: d.durationSeconds ?? null,
            })),
        }
    } catch (error) {
        console.error('Error fetching agency view stats:', error)
        return null
    }
}

/** View stats for a single postcard (verifies agency ownership). */
export async function getAgencyPostcardViewStats(postcardId: number): Promise<PostcardViewStats | null> {
    const { agencyId } = await requireAgence()
    const { allowed } = await ensureAgencyOwnership(postcardId, agencyId)
    if (!allowed) return null

    try {
        const payload = await getPayload({ config })
        const result = await payload.find({
            collection: 'postcard-view-events',
            where: { postcard: { equals: postcardId } },
            limit: 5000,
            depth: 0,
            sort: '-openedAt',
            overrideAccess: true,
        })

        const docs = result.docs as Array<{
            sessionId: string
            country?: string | null
            browser?: string | null
            durationSeconds?: number | null
            closedAt?: string | null
            openedAt: string
        }>

        const totalViews = docs.length
        const uniqueSessions = new Set(docs.map((d) => d.sessionId)).size
        const byCountryMap: Record<string, number> = {}
        const byBrowserMap: Record<string, number> = {}
        let durationSum = 0
        let durationCount = 0
        for (const d of docs) {
            const country = d.country || '(inconnu)'
            byCountryMap[country] = (byCountryMap[country] || 0) + 1
            const browser = d.browser || '(inconnu)'
            byBrowserMap[browser] = (byBrowserMap[browser] || 0) + 1
            if (d.closedAt != null && d.durationSeconds != null) {
                durationSum += d.durationSeconds
                durationCount++
            }
        }

        return {
            totalViews,
            uniqueSessions,
            byCountry: Object.entries(byCountryMap).map(([country, count]) => ({ country, count })).sort((a, b) => b.count - a.count).slice(0, 10),
            byBrowser: Object.entries(byBrowserMap).map(([browser, count]) => ({ browser, count })).sort((a, b) => b.count - a.count).slice(0, 5),
            avgDurationSeconds: durationCount > 0 ? durationSum / durationCount : null,
            recentEvents: docs.slice(0, 10).map((d) => ({
                openedAt: d.openedAt,
                country: d.country ?? null,
                browser: d.browser ?? null,
                durationSeconds: d.durationSeconds ?? null,
            })),
        }
    } catch (error) {
        console.error('Error fetching agency postcard view stats:', error)
        return null
    }
}

// --- Agency info ---

export async function getAgencyInfo(): Promise<Agency | null> {
    const { agencyId } = await requireAgence()
    try {
        const payload = await getPayload({ config })
        const agency = await payload.findByID({
            collection: 'agencies',
            id: agencyId,
            depth: 1,
        })
        return agency as Agency
    } catch (error) {
        console.error('Error fetching agency info:', error)
        return null
    }
}

export async function updateAgencyInfo(data: Record<string, unknown>): Promise<{ success: boolean; error?: string }> {
    const { agencyId } = await requireAgence()
    try {
        const payload = await getPayload({ config })
        await payload.update({
            collection: 'agencies',
            id: agencyId,
            data,
        })
        return { success: true }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour.'
        console.error('Error updating agency info:', err)
        return { success: false, error: message }
    }
}

// --- Update postcard ---

export async function updateAgencyPostcard(
    id: number,
    data: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
    const { agencyId } = await requireAgence()
    const { allowed, error } = await ensureAgencyOwnership(id, agencyId)
    if (!allowed) return { success: false, error }

    try {
        const payload = await getPayload({ config })

        const updateData: Record<string, unknown> = { ...data }

        if (data.frontImageKey && typeof data.frontImageKey === 'string') {
            const media = await payload.create({
                collection: 'media',
                data: {
                    alt: `Face avant - carte ${data.recipientName ?? 'sans nom'}`,
                    filename: data.frontImageKey,
                    mimeType: (data.frontImageMimeType as string) || 'image/jpeg',
                    filesize: (data.frontImageFilesize as number) ?? 0,
                },
            })
            const mediaDoc = media as { url?: string | null; filename?: string | null }
            updateData.frontImage = media.id
            updateData.frontImageURL = mediaDoc.url ?? (mediaDoc.filename ? `/media/${encodeURIComponent(mediaDoc.filename)}` : undefined)
            delete updateData.frontImageKey
            delete updateData.frontImageMimeType
            delete updateData.frontImageFilesize
        } else if (data.frontImage && typeof data.frontImage === 'string' && (data.frontImage as string).startsWith('data:image')) {
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
        console.error('Error updating agency postcard:', err)
        return { success: false, error: message }
    }
}

// --- Update postcard status ---

export async function updateAgencyPostcardStatus(
    id: number,
    status: 'published' | 'draft' | 'archived'
): Promise<{ success: boolean; error?: string }> {
    const { agencyId } = await requireAgence()
    const { allowed, error } = await ensureAgencyOwnership(id, agencyId)
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
        console.error('Error updating agency postcard status:', err)
        return { success: false, error: message }
    }
}

// --- Delete postcard ---

export async function deleteAgencyPostcard(id: number): Promise<{ success: boolean; error?: string }> {
    const { agencyId } = await requireAgence()
    const { allowed, error } = await ensureAgencyOwnership(id, agencyId)
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
        console.error('Error deleting agency postcard:', err)
        return { success: false, error: message }
    }
}

// --- Tracking links ---

export interface CreateTrackingLinkData {
    recipientFirstName?: string
    recipientLastName?: string
    description?: string
}

export async function createAgencyTrackingLink(
    postcardId: number,
    data: CreateTrackingLinkData
): Promise<{ success: boolean; tracking?: PostcardTrackingLink; error?: string }> {
    const { userId, agencyId } = await requireAgence()
    const { allowed, error } = await ensureAgencyOwnership(postcardId, agencyId)
    if (!allowed) return { success: false, error }

    try {
        const payload = await getPayload({ config })
        const tracking = await payload.create({
            collection: 'postcard-tracking-links',
            data: {
                postcard: postcardId,
                recipientFirstName: data.recipientFirstName?.trim() || undefined,
                recipientLastName: data.recipientLastName?.trim() || undefined,
                description: data.description?.trim() || undefined,
                author: userId,
            },
            overrideAccess: true,
        } as Parameters<typeof payload.create>[0])
        return { success: true, tracking: tracking as PostcardTrackingLink }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erreur lors de la création du lien.'
        console.error('Error creating agency tracking link:', err)
        return { success: false, error: message }
    }
}

export async function getAgencyTrackingLinks(
    postcardId: number
): Promise<{ success: boolean; links?: PostcardTrackingLink[]; error?: string }> {
    const { agencyId } = await requireAgence()
    const { allowed, error } = await ensureAgencyOwnership(postcardId, agencyId)
    if (!allowed) return { success: false, error }

    try {
        const payload = await getPayload({ config })
        const result = await payload.find({
            collection: 'postcard-tracking-links',
            where: {
                postcard: { equals: postcardId },
            },
            sort: '-createdAt',
            depth: 0,
            overrideAccess: true,
        })
        return { success: true, links: result.docs as PostcardTrackingLink[] }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erreur lors du chargement des liens.'
        console.error('Error fetching agency tracking links:', err)
        return { success: false, error: message }
    }
}

async function getBaseUrl(): Promise<string> {
    try {
        const headersList = await headers()
        const host = headersList.get('host') || 'localhost:3000'
        const protocol = host.includes('localhost') ? 'http' : 'https'
        return `${protocol}://${host}`
    } catch {
        return process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : 'http://localhost:3000'
    }
}

export async function sendAgencyTrackingLinkByEmail(
    trackingId: number,
    recipientEmail: string
): Promise<{ success: boolean; error?: string }> {
    const { userId, agencyId } = await requireAgence()

    const payload = await getPayload({ config })
    const tracking = await payload.findByID({
        collection: 'postcard-tracking-links',
        id: trackingId,
        depth: 1,
        overrideAccess: true,
    })

    // Verify the tracking link belongs to a postcard of this agency
    const postcardId = typeof tracking.postcard === 'object' ? (tracking.postcard as { id: number }).id : tracking.postcard
    const { allowed, error } = await ensureAgencyOwnership(postcardId as number, agencyId)
    if (!allowed) return { success: false, error }

    const postcard = typeof tracking.postcard === 'object' ? tracking.postcard : null
    const senderName = postcard && typeof postcard === 'object' && 'senderName' in postcard
        ? (postcard as { senderName?: string }).senderName
        : undefined

    const baseUrl = await getBaseUrl()
    const trackingUrl = `${baseUrl}/v/${tracking.token}`
    const html = generateTrackingLinkEmail(
        trackingUrl,
        tracking.recipientFirstName,
        senderName
    )

    const ok = await sendEmail({
        to: recipientEmail.trim().toLowerCase(),
        subject: 'Une carte postale pour vous',
        html,
    })
    if (!ok) return { success: false, error: 'Échec de l\'envoi de l\'email.' }

    await payload.update({
        collection: 'postcard-tracking-links',
        id: trackingId,
        data: {
            sentVia: 'email',
            sentAt: new Date().toISOString(),
        },
        overrideAccess: true,
    })

    return { success: true }
}
