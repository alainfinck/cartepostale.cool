'use server'

export interface UmamiMetric {
  x: string
  y: number
}

export async function getUmamiPageStats(): Promise<Record<string, number>> {
  const UMAMI_API_KEY = process.env.UMAMI_API_KEY
  const UMAMI_WEBSITE_ID = process.env.UMAMI_WEBSITE_ID
  const UMAMI_API_BASE = 'https://api.umami.is/v1'

  if (!UMAMI_API_KEY || !UMAMI_WEBSITE_ID) {
    console.warn('Umami API key or Website ID missing')
    return {}
  }

  try {
    const now = Date.now()
    // Default to last 90 days. You might want to make this configurable.
    const startAt = now - 90 * 24 * 60 * 60 * 1000
    const endAt = now

    const url = `${UMAMI_API_BASE}/websites/${UMAMI_WEBSITE_ID}/metrics?type=url&startAt=${startAt}&endAt=${endAt}`
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${UMAMI_API_KEY}`,
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      console.error('Umami API error:', response.status, response.statusText)
      return {}
    }

    const data: UmamiMetric[] = await response.json()
    
    // Convert to a map of url -> views
    const stats: Record<string, number> = {}
    data.forEach(metric => {
      stats[metric.x] = metric.y
    })

    return stats
  } catch (error) {
    console.error('Failed to fetch Umami stats:', error)
    return {}
  }
}

export async function getStatsForPostcard(publicId: string): Promise<number> {
  const allStats = await getUmamiPageStats()
  // The URL in Umami is usually /carte/[publicId]
  const path = `/carte/${publicId}`
  return allStats[path] || 0
}

export interface DetailedUmamiStats {
  views: number
  visitors: number
  countries: { x: string; y: number }[]
  browsers: { x: string; y: number }[]
}

export async function getDetailedUmamiStats(publicId: string): Promise<DetailedUmamiStats | null> {
  const UMAMI_API_KEY = process.env.UMAMI_API_KEY
  const UMAMI_WEBSITE_ID = process.env.UMAMI_WEBSITE_ID
  const UMAMI_API_BASE = 'https://api.umami.is/v1'

  if (!UMAMI_API_KEY || !UMAMI_WEBSITE_ID) return null

  const path = `/carte/${publicId}`
  const now = Date.now()
  const startAt = now - 90 * 24 * 60 * 60 * 1000
  const endAt = now

  try {
    // 1. Get Summary Stats (Views & Visitors)
    const statsUrl = `${UMAMI_API_BASE}/websites/${UMAMI_WEBSITE_ID}/stats?startAt=${startAt}&endAt=${endAt}&url=${encodeURIComponent(path)}`
    const statsRes = await fetch(statsUrl, {
      headers: { 'Authorization': `Bearer ${UMAMI_API_KEY}` },
      next: { revalidate: 3600 },
    })
    
    // 2. Get Countries
    const countriesUrl = `${UMAMI_API_BASE}/websites/${UMAMI_WEBSITE_ID}/metrics?type=country&startAt=${startAt}&endAt=${endAt}&url=${encodeURIComponent(path)}`
    const countriesRes = await fetch(countriesUrl, {
      headers: { 'Authorization': `Bearer ${UMAMI_API_KEY}` },
      next: { revalidate: 3600 },
    })

    // 3. Get Browsers
    const browsersUrl = `${UMAMI_API_BASE}/websites/${UMAMI_WEBSITE_ID}/metrics?type=browser&startAt=${startAt}&endAt=${endAt}&url=${encodeURIComponent(path)}`
    const browsersRes = await fetch(browsersUrl, {
      headers: { 'Authorization': `Bearer ${UMAMI_API_KEY}` },
      next: { revalidate: 3600 },
    })

    const [statsData, countriesData, browsersData] = await Promise.all([
      statsRes.ok ? statsRes.json() : { pageviews: { value: 0 }, visitors: { value: 0 } },
      countriesRes.ok ? countriesRes.json() : [],
      browsersRes.ok ? browsersRes.json() : [],
    ])

    return {
      views: statsData.pageviews?.value || 0,
      visitors: statsData.visitors?.value || 0,
      countries: countriesData,
      browsers: browsersData,
    }
  } catch (error) {
    console.error(`Failed to fetch detailed Umami stats for ${path}:`, error)
    return null
  }
}
