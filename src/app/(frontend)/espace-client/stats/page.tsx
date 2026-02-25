import {
  getEspaceClientViewStats,
  getViewStatsByDay,
} from '@/actions/postcard-view-stats'
import { getEspaceClientStats, getMyPostcardsForStatsSelector } from '@/actions/espace-client-actions'
import { EspaceClientStatsClient } from './EspaceClientStatsClient'

export const dynamic = 'force-dynamic'

export default async function EspaceClientStatsPage() {
  const [stats, viewStats, postcards, viewStatsByDay] = await Promise.all([
    getEspaceClientStats(),
    getEspaceClientViewStats(),
    getMyPostcardsForStatsSelector(),
    getViewStatsByDay(null, 14),
  ])

  return (
    <EspaceClientStatsClient
      stats={stats}
      viewStats={viewStats}
      postcards={postcards}
      initialViewStatsByDay={viewStatsByDay}
    />
  )
}
