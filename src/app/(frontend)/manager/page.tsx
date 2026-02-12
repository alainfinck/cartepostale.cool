import { getManagerStats } from '@/actions/manager-actions'
import { getGlobalViewStats } from '@/actions/postcard-view-stats'
import { StatsOverview } from './StatsOverview'

export const dynamic = 'force-dynamic'

export default async function ManagerDashboardPage() {
  const [stats, viewStats] = await Promise.all([
    getManagerStats(),
    getGlobalViewStats(),
  ])

  return <StatsOverview stats={stats} viewStats={viewStats} />
}
