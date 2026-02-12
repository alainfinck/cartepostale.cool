import { getManagerStats } from '@/actions/manager-actions'
import { StatsOverview } from './StatsOverview'

export const dynamic = 'force-dynamic'

export default async function ManagerDashboardPage() {
  const stats = await getManagerStats()

  return <StatsOverview stats={stats} />
}
