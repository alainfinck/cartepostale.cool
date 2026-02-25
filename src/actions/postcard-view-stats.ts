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
  recentEvents: {
    openedAt: string
    country: string | null
    browser: string | null
    durationSeconds: number | null
  }[]
}

export async function getPostcardViewStats(postcardId: number): Promise<PostcardViewStats | null> {
  const user = await getCurrentUser()
  if (!user) return null

  try {
    const payload = await getPayload({ config })

    // Si l'utilisateur n'est pas admin, on vérifie qu'il est bien l'auteur de la carte
    if (user.role !== 'admin') {
      const postcard = await payload.findByID({
        collection: 'postcards',
        id: postcardId,
        depth: 0,
      })

      const authorId =
        typeof postcard.author === 'object' && postcard.author
          ? postcard.author.id
          : postcard.author
      if (authorId !== user.id) {
        return null
      }
    }

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

/** Stats agrégées sur toutes les vues (toutes cartes). Pour le tableau de bord /manager. */
export async function getGlobalViewStats(): Promise<PostcardViewStats | null> {
  await requireAdmin()
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'postcard-view-events',
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
    const byCountry = Object.entries(byCountryMap)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
    const byBrowser = Object.entries(byBrowserMap)
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
    const avgDurationSeconds = durationCount > 0 ? durationSum / durationCount : null
    const recentEvents = docs.slice(0, 15).map((d) => ({
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
    console.error('Error fetching global view stats:', error)
    return null
  }
}

/** Vues par jour (derniers N jours) pour une ou plusieurs cartes de l'utilisateur. */
export interface ViewStatsByDayItem {
  date: string // YYYY-MM-DD
  views: number
  uniqueSessions: number
}

export async function getViewStatsByDay(
  postcardIds: number[] | null,
  days: number = 14,
): Promise<ViewStatsByDayItem[]> {
  const user = await getCurrentUser()
  if (!user) return []

  try {
    const payload = await getPayload({ config })
    let cardIds = postcardIds
    if (cardIds == null || cardIds.length === 0) {
      const userCards = await payload.find({
        collection: 'postcards',
        where: { author: { equals: user.id } },
        limit: 1000,
        depth: 0,
      })
      cardIds = userCards.docs.map((d) => d.id)
    } else {
      // Vérifier que l'utilisateur possède bien ces cartes
      const requestedIds = postcardIds as number[]
      const userCards = await payload.find({
        collection: 'postcards',
        where: { author: { equals: user.id }, id: { in: requestedIds } },
        limit: requestedIds.length,
        depth: 0,
      })
      cardIds = userCards.docs.map((d) => d.id)
    }
    if (cardIds.length === 0) return []

    const since = new Date()
    since.setDate(since.getDate() - days)
    since.setHours(0, 0, 0, 0)

    const result = await payload.find({
      collection: 'postcard-view-events',
      where: {
        postcard: { in: cardIds },
        openedAt: { greater_than_equal: since.toISOString() },
      },
      limit: 50000,
      depth: 0,
      sort: 'openedAt',
      overrideAccess: true,
    })

    const docs = result.docs as Array<{ openedAt: string; sessionId: string }>
    const byDay: Record<string, { views: number; sessions: Set<string> }> = {}
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    for (let d = 0; d < days; d++) {
      const date = new Date(today)
      date.setDate(date.getDate() - (days - 1 - d))
      const key = date.toISOString().slice(0, 10)
      byDay[key] = { views: 0, sessions: new Set() }
    }
    for (const ev of docs) {
      const key = ev.openedAt.slice(0, 10)
      if (!byDay[key]) byDay[key] = { views: 0, sessions: new Set() }
      byDay[key].views += 1
      byDay[key].sessions.add(ev.sessionId)
    }

    const sortedKeys = Object.keys(byDay).sort()
    return sortedKeys.map((date) => ({
      date,
      views: byDay[date].views,
      uniqueSessions: byDay[date].sessions.size,
    }))
  } catch (error) {
    console.error('Error fetching view stats by day:', error)
    return []
  }
}

export async function getEspaceClientViewStats(): Promise<PostcardViewStats | null> {
  const user = await getCurrentUser()
  if (!user) return null

  try {
    const payload = await getPayload({ config })
    const userCards = await payload.find({
      collection: 'postcards',
      where: { author: { equals: user.id } },
      limit: 1000,
      depth: 0,
    })
    const cardIds = userCards.docs.map((d) => d.id)

    if (cardIds.length === 0) return null

    const result = await payload.find({
      collection: 'postcard-view-events',
      where: { postcard: { in: cardIds } },
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

    const byCountry = Object.entries(byCountryMap)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
    const byBrowser = Object.entries(byBrowserMap)
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
    const avgDurationSeconds = durationCount > 0 ? durationSum / durationCount : null

    const recentEvents = docs.slice(0, 15).map((d) => ({
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
    console.error('Error fetching espace client view stats:', error)
    return null
  }
}
