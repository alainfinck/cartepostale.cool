'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { getCurrentUser } from '@/lib/auth'

async function requireAdmin(): Promise<void> {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
        throw new Error('Accès réservé aux administrateurs.')
    }
}

export interface PostcardViewStats {
    totalViews: number
    uniqueSessions: number
    byCountry: { country: string; count: number }[]
    byBrowser: { browser: string; count: number }[]
    avgDurationSeconds: number | null
    recentEvents: { openedAt: string; country: string | null; browser: string | null; durationSeconds: number | null }[]
}

export async function getPostcardViewStats(postcardId: number): Promise<PostcardViewStats | null> {
    await requireAdmin()
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
        const byCountry = Object.entries(byCountryMap)
            .map(([country, count]) => ({ country, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)
        const byBrowser = Object.entries(byBrowserMap)
            .map(([browser, count]) => ({ browser, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
        const avgDurationSeconds = durationCount > 0 ? durationSum / durationCount : null
        const recentEvents = docs.slice(0, 10).map((d) => ({
            openedAt: d.openedAt,
            country: d.country ?? null,
            browser: d.browser ?? null,
            durationSeconds: d.durationSeconds ?? null,
        }))
        return {
            totalViews,
            uniqueSessions,
            byCountry,
            byBrowser,
            avgDurationSeconds,
            recentEvents,
        }
    } catch (error) {
        console.error('Error fetching postcard view stats:', error)
        return null
    }
}
