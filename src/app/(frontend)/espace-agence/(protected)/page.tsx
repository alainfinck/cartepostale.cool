import React from 'react'
import { Metadata } from 'next'
import { getAgencyStats, getAgencyViewStats } from '@/actions/agence-actions'
import { Mail, FileText, Archive, Eye, Share2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Espace Agence - Dashboard',
  description: 'Tableau de bord de votre agence',
}

export const dynamic = 'force-dynamic'

export default async function EspaceAgenceDashboardPage() {
  const [stats, viewStats] = await Promise.all([
    getAgencyStats(),
    getAgencyViewStats(),
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard Agence</h1>
        <p className="text-muted-foreground mt-1">Vue d&apos;ensemble de l&apos;activité de votre agence.</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon={<Mail size={18} />} label="Total cartes" value={stats.totalPostcards} />
        <StatCard icon={<FileText size={18} />} label="Publiées" value={stats.publishedPostcards} variant="success" />
        <StatCard icon={<FileText size={18} />} label="Brouillons" value={stats.draftPostcards} variant="warning" />
        <StatCard icon={<Archive size={18} />} label="Archivées" value={stats.archivedPostcards} variant="muted" />
        <StatCard icon={<Eye size={18} />} label="Vues" value={stats.totalViews} variant="info" />
        <StatCard icon={<Share2 size={18} />} label="Partages" value={stats.totalShares} variant="info" />
      </div>

      {/* Analytics */}
      {viewStats && (
        <div className="p-6 bg-card border border-border rounded-xl space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Analytics des vues</h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-tight">Total vues</p>
              <p className="text-2xl font-bold">{viewStats.totalViews}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-tight">Sessions uniques</p>
              <p className="text-2xl font-bold">{viewStats.uniqueSessions}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-tight">Durée moyenne</p>
              <p className="text-2xl font-bold">
                {viewStats.avgDurationSeconds != null ? `${Math.round(viewStats.avgDurationSeconds)}s` : '—'}
              </p>
            </div>
          </div>

          {(viewStats.byCountry.length > 0 || viewStats.byBrowser.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border">
              {viewStats.byCountry.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-3 uppercase tracking-tight font-semibold">Pays (top)</p>
                  <ul className="space-y-2 text-sm">
                    {viewStats.byCountry.slice(0, 5).map(({ country, count }) => (
                      <li key={country} className="flex justify-between gap-2">
                        <span className="truncate">{country}</span>
                        <span className="font-medium tabular-nums">{count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {viewStats.byBrowser.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-3 uppercase tracking-tight font-semibold">Navigateurs (top)</p>
                  <ul className="space-y-2 text-sm">
                    {viewStats.byBrowser.slice(0, 5).map(({ browser, count }) => (
                      <li key={browser} className="flex justify-between gap-2">
                        <span className="truncate">{browser}</span>
                        <span className="font-medium tabular-nums">{count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {viewStats.recentEvents.length > 0 && (
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-3 uppercase tracking-tight font-semibold">Dernières ouvertures</p>
              <ul className="space-y-1.5 text-xs max-h-48 overflow-y-auto">
                {viewStats.recentEvents.map((ev, i) => (
                  <li key={i} className="flex justify-between gap-3 py-1.5 border-b border-border/30 last:border-0">
                    <span className="text-muted-foreground">
                      {new Date(ev.openedAt).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="truncate">{ev.country ?? '—'}</span>
                    <span className="truncate">{ev.browser ?? '—'}</span>
                    <span className="tabular-nums">{ev.durationSeconds != null ? `${ev.durationSeconds}s` : '—'}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const statVariants = {
  default: 'border-border bg-card',
  success: 'border-emerald-200/50 bg-emerald-50/50 text-emerald-700',
  warning: 'border-amber-200/50 bg-amber-50/50 text-amber-700',
  muted: 'border-border bg-muted/40 text-muted-foreground',
  info: 'border-blue-200/50 bg-blue-50/50 text-blue-700',
} as const

function StatCard({ icon, label, value, variant = 'default' }: { icon: React.ReactNode; label: string; value: number; variant?: keyof typeof statVariants }) {
  return (
    <div className={`p-4 flex items-center gap-3 rounded-xl border ${statVariants[variant]}`}>
      <div className="opacity-60">{icon}</div>
      <div>
        <div className="text-xl font-bold leading-none">{value}</div>
        <div className="text-[10px] uppercase tracking-wider opacity-70 mt-1 font-medium">{label}</div>
      </div>
    </div>
  )
}
