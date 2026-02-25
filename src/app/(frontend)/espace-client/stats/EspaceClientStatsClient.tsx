'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Mail,
  Eye,
  Share2,
  TrendingUp,
  Calendar,
  CreditCard,
  ChevronRight,
  Globe,
  Monitor,
  Clock,
  Activity,
  BarChart3,
  MapPin,
  LayoutGrid,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PostcardViewStats, ViewStatsByDayItem } from '@/actions/postcard-view-stats'
import { getPostcardViewStats, getViewStatsByDay } from '@/actions/postcard-view-stats'
import type { PostcardOption } from '@/actions/espace-client-actions'
import type { EspaceClientStats } from '@/actions/espace-client-actions'

interface StatsOverviewProps {
  stats: EspaceClientStats
  viewStats: PostcardViewStats | null
  postcards: PostcardOption[]
  initialViewStatsByDay: ViewStatsByDayItem[]
}

export function EspaceClientStatsClient({
  stats,
  viewStats: initialViewStats,
  postcards,
  initialViewStatsByDay,
}: StatsOverviewProps) {
  const [selectedCardId, setSelectedCardId] = useState<string>('')
  const [viewStats, setViewStats] = useState<PostcardViewStats | null>(initialViewStats)
  const [viewStatsByDay, setViewStatsByDay] = useState<ViewStatsByDayItem[]>(initialViewStatsByDay)
  const [loadingCardStats, setLoadingCardStats] = useState(false)

  const loadCardStats = useCallback(async (cardId: number) => {
    setLoadingCardStats(true)
    try {
      const [statsRes, byDayRes] = await Promise.all([
        getPostcardViewStats(cardId),
        getViewStatsByDay([cardId], 14),
      ])
      setViewStats(statsRes ?? null)
      setViewStatsByDay(byDayRes)
    } finally {
      setLoadingCardStats(false)
    }
  }, [])

  useEffect(() => {
    if (selectedCardId === '') {
      setViewStats(initialViewStats)
      setViewStatsByDay(initialViewStatsByDay)
      return
    }
    const id = Number(selectedCardId)
    if (Number.isNaN(id)) return
    loadCardStats(id)
  }, [selectedCardId, initialViewStats, initialViewStatsByDay, loadCardStats])

  const selectedLabel =
    selectedCardId === ''
      ? 'Toutes les cartes'
      : postcards.find((p) => String(p.id) === selectedCardId)?.recipientName ||
        postcards.find((p) => String(p.id) === selectedCardId)?.senderName ||
        `#${postcards.find((p) => String(p.id) === selectedCardId)?.publicId ?? selectedCardId}`

  const topCardsByViews = [...postcards]
    .sort((a, b) => b.views - a.views)
    .slice(0, 8)

  const maxViewsByDay = Math.max(1, ...viewStatsByDay.map((d) => d.views))

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Title, date & card selector */}
      <div className="flex flex-col gap-4 px-1">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-stone-800">
              Statistiques détaillées
            </h2>
            <p className="text-stone-500 text-sm">
              Vue d&apos;ensemble et analytics par carte.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm border border-border/50 px-3 py-1.5 rounded-lg shadow-sm">
              <Calendar size={14} className="text-stone-400" />
              <span className="text-xs font-semibold text-stone-600 uppercase tracking-tight">
                {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <LayoutGrid size={16} className="text-stone-400 shrink-0" />
              <select
                value={selectedCardId}
                onChange={(e) => setSelectedCardId(e.target.value)}
                className={cn(
                  'min-w-[200px] rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-800',
                  'focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500',
                )}
              >
                <option value="">Toutes les cartes</option>
                {postcards.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.recipientName || p.senderName || `#${p.publicId}`} — {p.views} vues
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {selectedCardId !== '' && (
          <p className="text-xs text-stone-500 flex items-center gap-1.5">
            <MapPin size={12} />
            Statistiques affichées pour : <strong>{selectedLabel}</strong>
            {loadingCardStats && (
              <span className="text-teal-600 animate-pulse">Chargement…</span>
            )}
          </p>
        )}
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Mail size={22} />}
          label="Cartes créées"
          value={stats.totalPostcards}
          trend={`${stats.publishedPostcards} publiées`}
          variant="teal"
        />
        <StatCard
          icon={<Eye size={22} />}
          label="Total vues"
          value={stats.totalViews}
          trend={selectedCardId ? `Cette carte : ${viewStats?.totalViews ?? 0}` : 'Toutes cartes'}
          variant="blue"
        />
        <StatCard
          icon={<Share2 size={22} />}
          label="Partages"
          value={stats.totalShares}
          trend="Total enregistré"
          variant="orange"
        />
        <StatCard
          icon={<CreditCard size={22} />}
          label="Premium"
          value={stats.premiumPostcards}
          trend={`${stats.totalPostcards ? Math.round((stats.premiumPostcards / stats.totalPostcards) * 100) : 0}% du total`}
          variant="amber"
          isPremium
        />
      </div>

      {/* Distribution (published / draft / archived) */}
      <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-sm">
        <CardHeader className="border-b border-border/30 bg-muted/20 pb-4">
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-stone-500">
            Distribution des statuts
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-5">
            <DistributionItem
              label="Publiées"
              value={stats.publishedPostcards}
              total={stats.totalPostcards}
              color="bg-emerald-500"
            />
            <DistributionItem
              label="Brouillons"
              value={stats.draftPostcards}
              total={stats.totalPostcards}
              color="bg-amber-400"
            />
            <DistributionItem
              label="Archivées"
              value={stats.archivedPostcards}
              total={stats.totalPostcards}
              color="bg-stone-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* Vues par jour (14 derniers jours) */}
      <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/30 bg-muted/20 pb-4">
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-stone-500 flex items-center gap-2">
            <BarChart3 size={16} className="text-teal-500" />
            Vues sur les 14 derniers jours
          </CardTitle>
          <Badge variant="outline" className="bg-background/50 border-border/50 shadow-none">
            {selectedCardId ? 'Cette carte' : 'Toutes les cartes'}
          </Badge>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {viewStatsByDay.length === 0 ? (
              <p className="text-sm text-stone-500">Aucune donnée sur la période.</p>
            ) : (
              viewStatsByDay.map((day) => (
                <div key={day.date} className="flex items-center gap-4">
                  <span className="w-24 text-xs font-medium text-stone-600 shrink-0">
                    {new Date(day.date).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </span>
                  <div className="flex-1 h-8 bg-stone-100 rounded-lg overflow-hidden flex">
                    <div
                      className="h-full bg-teal-500 rounded-l-lg min-w-[2px] transition-all duration-500"
                      style={{
                        width: `${(day.views / maxViewsByDay) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="w-16 text-right text-sm font-semibold tabular-nums text-stone-800">
                    {day.views} {day.views > 1 ? 'vues' : 'vue'}
                  </span>
                  <span className="text-xs text-stone-400 tabular-nums">
                    {day.uniqueSessions} session{day.uniqueSessions !== 1 ? 's' : ''}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top cartes par vues (uniquement en vue "Toutes les cartes") */}
      {selectedCardId === '' && topCardsByViews.length > 0 && (
        <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-sm overflow-hidden">
          <CardHeader className="border-b border-border/30 bg-muted/20 pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-stone-500 flex items-center gap-2">
              <TrendingUp size={16} className="text-teal-500" />
              Top cartes par nombre de vues
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ul className="space-y-3">
              {topCardsByViews.map((p, i) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-4 py-2 px-3 rounded-lg bg-stone-50/80 border border-stone-100"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="text-stone-400 font-bold tabular-nums w-6">{i + 1}.</span>
                    <span className="truncate font-medium text-stone-800">
                      {p.recipientName || p.senderName || `#${p.publicId}`}
                    </span>
                    <Badge variant="secondary" className="text-[10px] shrink-0">
                      {p.status}
                    </Badge>
                  </span>
                  <span className="font-bold text-teal-600 tabular-nums shrink-0">
                    {p.views} {p.views === 1 ? 'vue' : 'vues'}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Engagement & detailed view stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/50 bg-card/60 backdrop-blur-md shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/30 bg-muted/20 pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-stone-500 flex items-center gap-2">
              <TrendingUp size={16} className="text-teal-500" />
              Engagement & visibilité
            </CardTitle>
            <Badge variant="outline" className="bg-background/50 border-border/50 shadow-none">
              Temps réel
            </Badge>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-stone-400">
                  <Eye size={16} />
                  <span className="text-xs font-medium uppercase tracking-tight">Total vues</span>
                </div>
                <div className="text-4xl font-black text-stone-800 tracking-tighter">
                  {(selectedCardId ? viewStats?.totalViews ?? 0 : stats.totalViews).toLocaleString()}
                </div>
                <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 transition-all duration-500"
                    style={{
                      width: `${(() => {
                        const totalViews =
                          selectedCardId ? (viewStats?.totalViews ?? 0) : stats.totalViews
                        const denom = Math.max(stats.totalPostcards * 10, 1)
                        const pct = stats.totalPostcards ? (totalViews / denom) * 100 : 0
                        return Math.min(100, pct)
                      })()}%`,
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-stone-400">
                  <Share2 size={16} />
                  <span className="text-xs font-medium uppercase tracking-tight">
                    Total partages
                  </span>
                </div>
                <div className="text-4xl font-black text-stone-800 tracking-tighter">
                  {stats.totalShares.toLocaleString()}
                </div>
                <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[45%]" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Résumé sessions / durée (si viewStats dispo) */}
        {viewStats && (
          <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-sm">
            <CardHeader className="border-b border-border/30 bg-muted/20 pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-stone-500">
                Résumé analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-stone-500">Sessions uniques</span>
                <span className="font-bold text-stone-800">{viewStats.uniqueSessions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-stone-500">Temps moyen (s)</span>
                <span className="font-bold text-stone-800">
                  {viewStats.avgDurationSeconds != null
                    ? Math.round(viewStats.avgDurationSeconds)
                    : '—'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-stone-500">Pays / Navigateurs</span>
                <span className="text-sm font-semibold text-stone-600">
                  {viewStats.byCountry.length} pays · {viewStats.byBrowser.length} navigateurs
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Statistiques de vues détaillées (analytics) */}
      {viewStats && (
        <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/30 bg-muted/20 pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-stone-500 flex items-center gap-2">
              <Activity size={16} className="text-teal-500" />
              Détail des vues {selectedCardId ? `— ${selectedLabel}` : ''}
            </CardTitle>
            <Badge variant="outline" className="bg-background/50 border-border/50 shadow-none">
              Analytics
            </Badge>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-stone-400">
                  <Eye size={14} />
                  <span className="text-[10px] font-medium uppercase tracking-tight">
                    Ouvertures totales
                  </span>
                </div>
                <p className="text-2xl font-bold text-stone-800">
                  {viewStats.totalViews.toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-stone-400">
                  <Clock size={14} />
                  <span className="text-[10px] font-medium uppercase tracking-tight">
                    Temps moyen (s)
                  </span>
                </div>
                <p className="text-2xl font-bold text-stone-800">
                  {viewStats.avgDurationSeconds != null
                    ? Math.round(viewStats.avgDurationSeconds)
                    : '—'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-medium uppercase tracking-tight text-stone-400">
                  Pays / Navigateurs
                </span>
                <p className="text-sm font-semibold text-stone-600">
                  {viewStats.byCountry.length} pays · {viewStats.byBrowser.length} navigateurs
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-border/20">
              {viewStats.byCountry.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-3 flex items-center gap-2">
                    <Globe size={12} /> Top pays
                  </p>
                  <ul className="space-y-2">
                    {viewStats.byCountry.slice(0, 8).map(({ country, count }) => (
                      <li key={country} className="flex justify-between items-center text-sm">
                        <span className="text-stone-700 truncate">{country}</span>
                        <span className="font-semibold text-stone-800 tabular-nums ml-2">
                          {count}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {viewStats.byBrowser.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-3 flex items-center gap-2">
                    <Monitor size={12} /> Top navigateurs
                  </p>
                  <ul className="space-y-2">
                    {viewStats.byBrowser.slice(0, 8).map(({ browser, count }) => (
                      <li key={browser} className="flex justify-between items-center text-sm">
                        <span className="text-stone-700 truncate">{browser}</span>
                        <span className="font-semibold text-stone-800 tabular-nums ml-2">
                          {count}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {viewStats.recentEvents.length > 0 && (
              <div className="pt-4 border-t border-border/20">
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-3">
                  Dernières ouvertures
                </p>
                <div className="overflow-x-auto -mx-1">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="text-stone-500 border-b border-border/30">
                        <th className="text-left py-2 px-2 font-medium">Date / Heure</th>
                        <th className="text-left py-2 px-2 font-medium">Pays</th>
                        <th className="text-left py-2 px-2 font-medium">Navigateur</th>
                        <th className="text-right py-2 px-2 font-medium">Durée</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewStats.recentEvents.map((ev, i) => (
                        <tr key={i} className="border-b border-border/10 hover:bg-muted/30">
                          <td className="py-2 px-2 text-stone-600 whitespace-nowrap">
                            {new Date(ev.openedAt).toLocaleString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="py-2 px-2 text-stone-600 truncate max-w-[100px]">
                            {ev.country ?? '—'}
                          </td>
                          <td className="py-2 px-2 text-stone-600 truncate max-w-[120px]">
                            {ev.browser ?? '—'}
                          </td>
                          <td className="py-2 px-2 text-right font-medium tabular-nums">
                            {ev.durationSeconds != null ? `${ev.durationSeconds}s` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  trend,
  variant,
  isPremium,
}: {
  icon: React.ReactNode
  label: string
  value: number
  trend: string
  variant: 'teal' | 'blue' | 'orange' | 'amber'
  isPremium?: boolean
}) {
  const themes = {
    teal: 'from-teal-500 to-teal-600 text-teal-600 shadow-teal-500/10',
    blue: 'from-blue-500 to-blue-600 text-blue-600 shadow-blue-500/10',
    orange: 'from-orange-500 to-orange-600 text-orange-600 shadow-orange-500/10',
    amber: 'from-amber-400 to-amber-500 text-amber-600 shadow-amber-500/10',
  }

  return (
    <Card className="relative group overflow-hidden border-border/50 bg-card/60 backdrop-blur-md shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div
        className={cn(
          'absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 pointer-events-none transition-transform duration-700 group-hover:scale-125 bg-gradient-to-br',
          themes[variant].split(' ')[1],
        )}
      />
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div
            className={cn(
              'w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-inner text-white',
              themes[variant].split(' ').slice(0, 2).join(' '),
            )}
          >
            {icon}
          </div>
          <div>
            <div className="text-3xl font-black text-stone-800 tracking-tight leading-none mb-1">
              {value}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-stone-500 opacity-70">
              {label}
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border/10">
            <span
              className={cn('text-[11px] font-bold tracking-tight', themes[variant].split(' ')[2])}
            >
              {trend}
            </span>
            <ChevronRight
              size={14}
              className="text-stone-300 transition-transform group-hover:translate-x-1"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function DistributionItem({
  label,
  value,
  total,
  color,
}: {
  label: string
  value: number
  total: number
  color: string
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-end">
        <span className="text-xs font-bold text-stone-600 uppercase tracking-tight">{label}</span>
        <span className="text-xs font-bold text-stone-800">{value}</span>
      </div>
      <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden flex">
        <div
          className={cn('h-full transition-all duration-1000', color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
