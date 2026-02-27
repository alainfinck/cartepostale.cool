import { getManagerStats } from '@/actions/manager-actions'
import { getGlobalViewStats } from '@/actions/postcard-view-stats'
import { StatsOverview } from '../StatsOverview'

export const dynamic = 'force-dynamic'

export default async function StatsPage() {
  const [stats, viewStats] = await Promise.all([getManagerStats(), getGlobalViewStats()])

  return (
    <StatsOverview
      stats={stats}
      viewStats={viewStats}
      metaPixelId={process.env.META_PIXEL_ID}
      metaAccessToken={process.env.META_ACCESS_TOKEN}
    />
  )
}
