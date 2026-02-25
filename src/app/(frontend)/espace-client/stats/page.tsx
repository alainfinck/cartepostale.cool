import { getEspaceClientViewStats } from '@/actions/postcard-view-stats'
import { StatsOverview } from '@/app/(frontend)/manager/StatsOverview'
import { getEspaceClientStats } from '@/actions/espace-client-actions'

export const dynamic = 'force-dynamic'

export default async function EspaceClientStatsPage() {
  const [stats, viewStats] = await Promise.all([getEspaceClientStats(), getEspaceClientViewStats()])

  return <StatsOverview stats={stats} viewStats={viewStats} isClientView={true} />
}
