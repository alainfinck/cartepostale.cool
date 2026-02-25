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

/** Récupère les visites par URL via /metrics?type=url. y = visiteurs uniques par URL. */
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
 * Utilise le paramètre `path=` (et non `url=` qui est ignoré par l'API Umami Cloud).
 */
export async function getDetailedUmamiStats(publicId: string): Promise<DetailedUmamiStats | null> {
  const { apiKey, websiteId } = getUmamiEnv()
  if (!apiKey || !websiteId) return null

  const path = `/carte/${publicId}`
  const { startAt, endAt } = getDefaultRange()
  const encodedPath = encodeURIComponent(path)

  try {
    const [statsRes, countriesRes, browsersRes] = await Promise.all([
      fetch(
        `${UMAMI_API_BASE}/websites/${websiteId}/stats?startAt=${startAt}&endAt=${endAt}&path=${encodedPath}`,
        { headers: { Authorization: `Bearer ${apiKey}` }, next: { revalidate: 3600 } },
      ),
      fetch(
        `${UMAMI_API_BASE}/websites/${websiteId}/metrics?type=country&startAt=${startAt}&endAt=${endAt}&path=${encodedPath}`,
        { headers: { Authorization: `Bearer ${apiKey}` }, next: { revalidate: 3600 } },
      ),
      fetch(
        `${UMAMI_API_BASE}/websites/${websiteId}/metrics?type=browser&startAt=${startAt}&endAt=${endAt}&path=${encodedPath}`,
        { headers: { Authorization: `Bearer ${apiKey}` }, next: { revalidate: 3600 } },
      ),
    ])

    const [statsData, countriesData, browsersData] = await Promise.all([
      statsRes.ok ? statsRes.json() : { pageviews: 0, visitors: 0 },
      countriesRes.ok ? countriesRes.json() : [],
      browsersRes.ok ? browsersRes.json() : [],
    ])

    return {
      views: (statsData.pageviews as number) || 0,
      visitors: (statsData.visitors as number) || 0,
      countries: countriesData,
      browsers: browsersData,
    }
  } catch (error) {
    console.error(`Failed to fetch detailed Umami stats for ${path}:`, error)
    return null
  }
}
