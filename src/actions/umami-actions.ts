'use server'

export interface UmamiMetric {
  x: string
  y: number
}

const UMAMI_API_BASE = 'https://api.umami.is/v1'

function getUmamiEnv() {
  return {
    apiKey: process.env.UMAMI_API_KEY,
    websiteId: process.env.UMAMI_WEBSITE_ID,
  }
}

function getDefaultRange() {
  const now = Date.now()
  return { startAt: now - 90 * 24 * 60 * 60 * 1000, endAt: now }
}

/** Récupère les visites par URL via /metrics?type=url (seul endpoint qui filtre par URL). */
export async function getUmamiPageStats(): Promise<Record<string, number>> {
  const { apiKey, websiteId } = getUmamiEnv()
  if (!apiKey || !websiteId) {
    console.warn('Umami API key or Website ID missing')
    return {}
  }

  const { startAt, endAt } = getDefaultRange()
  try {
    const url = `${UMAMI_API_BASE}/websites/${websiteId}/metrics?type=url&startAt=${startAt}&endAt=${endAt}&limit=500`
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { revalidate: 3600 },
    })
    if (!response.ok) {
      console.error('Umami API error:', response.status, response.statusText)
      return {}
    }
    const data: UmamiMetric[] = await response.json()
    const stats: Record<string, number> = {}
    data.forEach((metric) => {
      stats[metric.x] = metric.y
    })
    return stats
  } catch (error) {
    console.error('Failed to fetch Umami stats:', error)
    return {}
  }
}

export interface DetailedUmamiStats {
  views: number
  visitors: number
  countries: { x: string; y: number }[]
  browsers: { x: string; y: number }[]
}

/**
 * Stats détaillées pour une carte.
 * Note: l'endpoint /stats de l'API Umami Cloud ignore le filtre &url=,
 * donc on utilise uniquement /metrics?type=country et /metrics?type=browser
 * qui filtrent correctement par URL.
 */
export async function getDetailedUmamiStats(publicId: string): Promise<DetailedUmamiStats | null> {
  const { apiKey, websiteId } = getUmamiEnv()
  if (!apiKey || !websiteId) return null

  const path = `/carte/${publicId}`
  const { startAt, endAt } = getDefaultRange()
  const encoded = encodeURIComponent(path)

  try {
    const [countriesRes, browsersRes, urlMetricsRes] = await Promise.all([
      fetch(
        `${UMAMI_API_BASE}/websites/${websiteId}/metrics?type=country&startAt=${startAt}&endAt=${endAt}&url=${encoded}`,
        { headers: { Authorization: `Bearer ${apiKey}` }, next: { revalidate: 3600 } },
      ),
      fetch(
        `${UMAMI_API_BASE}/websites/${websiteId}/metrics?type=browser&startAt=${startAt}&endAt=${endAt}&url=${encoded}`,
        { headers: { Authorization: `Bearer ${apiKey}` }, next: { revalidate: 3600 } },
      ),
      fetch(
        `${UMAMI_API_BASE}/websites/${websiteId}/metrics?type=url&startAt=${startAt}&endAt=${endAt}&limit=500`,
        { headers: { Authorization: `Bearer ${apiKey}` }, next: { revalidate: 3600 } },
      ),
    ])

    const [countriesData, browsersData, urlMetrics]: [UmamiMetric[], UmamiMetric[], UmamiMetric[]] =
      await Promise.all([
        countriesRes.ok ? countriesRes.json() : [],
        browsersRes.ok ? browsersRes.json() : [],
        urlMetricsRes.ok ? urlMetricsRes.json() : [],
      ])

    // Le y du /metrics?type=url représente les visites pour cette URL
    const urlEntry = urlMetrics.find((m) => m.x === path)
    const visits = urlEntry?.y ?? 0

    // La somme des pays = visiteurs identifiés par pays (par URL)
    const visitors = countriesData.reduce((sum, c) => sum + c.y, 0)

    return {
      views: visits,
      visitors,
      countries: countriesData,
      browsers: browsersData,
    }
  } catch (error) {
    console.error(`Failed to fetch detailed Umami stats for ${path}:`, error)
    return null
  }
}
