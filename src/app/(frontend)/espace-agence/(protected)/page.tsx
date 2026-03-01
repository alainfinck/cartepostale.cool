import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { getAgencyStats, getAgencyViewStats, getAgencyInfo } from '@/actions/agence-actions'
import {
  Mail,
  FileText,
  Archive,
  Eye,
  Share2,
  Plus,
  Image as ImageIcon,
  BarChart3,
  ArrowRight,
  Globe,
  Monitor,
  Clock,
  Users,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Espace Agence - Dashboard',
  description: 'Tableau de bord de votre agence',
}

export const dynamic = 'force-dynamic'

export default async function EspaceAgenceDashboardPage() {
  const [agencyInfo, stats, viewStats] = await Promise.all([
    getAgencyInfo(),
    getAgencyStats(),
    getAgencyViewStats(),
  ])

  const agencyName = agencyInfo?.name ?? 'Votre agence'

  return (
    <div className="space-y-8">
      {/* Hero / Welcome */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Bonjour, {agencyName}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Vue d&apos;ensemble de l&apos;activité et des cartes postales de votre agence.
          </p>
        </div>
        <Link href="/editor">
          <Button
            size="lg"
            className="gap-2 bg-teal-600 hover:bg-teal-700"
          >
            <Plus className="h-4 w-4" />
            Créer une carte
          </Button>
        </Link>
      </div>

      {/* Quick actions */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/espace-agence/cartes">
          <Card className="transition-colors hover:border-teal-200 hover:bg-muted/30">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-600">
                <Mail className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">Cartes de l&apos;agence</p>
                <p className="text-xs text-muted-foreground">
                  Gérer et suivre vos cartes postales
                </p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/espace-agence/galerie">
          <Card className="transition-colors hover:border-teal-200 hover:bg-muted/30">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-600">
                <ImageIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">Galerie d&apos;images</p>
                <p className="text-xs text-muted-foreground">
                  Photos et visuels pour vos cartes
                </p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/espace-agence/agence">
          <Card className="transition-colors hover:border-teal-200 hover:bg-muted/30">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-600">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">Mon agence</p>
                <p className="text-xs text-muted-foreground">
                  Profil et paramètres de l&apos;agence
                </p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Stats */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Chiffres clés
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard
            icon={<Mail size={18} />}
            label="Total cartes"
            value={stats.totalPostcards}
          />
          <StatCard
            icon={<FileText size={18} />}
            label="Publiées"
            value={stats.publishedPostcards}
            variant="success"
          />
          <StatCard
            icon={<FileText size={18} />}
            label="Brouillons"
            value={stats.draftPostcards}
            variant="warning"
          />
          <StatCard
            icon={<Archive size={18} />}
            label="Archivées"
            value={stats.archivedPostcards}
            variant="muted"
          />
          <StatCard
            icon={<Eye size={18} />}
            label="Vues"
            value={stats.totalViews}
            variant="info"
          />
          <StatCard
            icon={<Share2 size={18} />}
            label="Partages"
            value={stats.totalShares}
            variant="info"
          />
        </div>
      </div>

      {/* Analytics */}
      {viewStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-teal-600" />
              Analytics des vues
            </CardTitle>
            <CardDescription>
              Statistiques d&apos;ouverture de vos cartes postales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-tight">
                    Total vues
                  </span>
                </div>
                <p className="mt-1 text-2xl font-bold tabular-nums">
                  {viewStats.totalViews}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-tight">
                    Sessions uniques
                  </span>
                </div>
                <p className="mt-1 text-2xl font-bold tabular-nums">
                  {viewStats.uniqueSessions}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-tight">
                    Durée moyenne
                  </span>
                </div>
                <p className="mt-1 text-2xl font-bold tabular-nums">
                  {viewStats.avgDurationSeconds != null
                    ? `${Math.round(viewStats.avgDurationSeconds)}s`
                    : '—'}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BarChart3 className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-tight">
                    Engagement
                  </span>
                </div>
                <p className="mt-1 text-2xl font-bold tabular-nums">
                  {viewStats.totalViews > 0 && viewStats.uniqueSessions > 0
                    ? `${((viewStats.uniqueSessions / viewStats.totalViews) * 100).toFixed(0)}%`
                    : '—'}
                </p>
              </div>
            </div>

            {(viewStats.byCountry.length > 0 || viewStats.byBrowser.length > 0) && (
              <div className="grid gap-6 border-t border-border pt-6 sm:grid-cols-2">
                {viewStats.byCountry.length > 0 && (
                  <div className="space-y-3">
                    <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Globe className="h-4 w-4 text-teal-600" />
                      Répartition par pays
                    </p>
                    <ul className="space-y-2">
                      {viewStats.byCountry.slice(0, 5).map(({ country, count }) => {
                        const maxCount = viewStats.byCountry[0]?.count ?? 1
                        const pct = maxCount > 0 ? (count / maxCount) * 100 : 0
                        return (
                          <li key={country} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="truncate">{country}</span>
                              <span className="tabular-nums font-medium">{count}</span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-teal-500 transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}
                {viewStats.byBrowser.length > 0 && (
                  <div className="space-y-3">
                    <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Monitor className="h-4 w-4 text-teal-600" />
                      Navigateurs
                    </p>
                    <ul className="space-y-2">
                      {viewStats.byBrowser.slice(0, 5).map(({ browser, count }) => {
                        const maxCount = viewStats.byBrowser[0]?.count ?? 1
                        const pct = maxCount > 0 ? (count / maxCount) * 100 : 0
                        return (
                          <li key={browser} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="truncate">{browser}</span>
                              <span className="tabular-nums font-medium">{count}</span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-teal-500 transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {viewStats.recentEvents.length > 0 && (
              <div className="space-y-3 border-t border-border pt-6">
                <p className="text-sm font-semibold text-foreground">
                  Dernières ouvertures
                </p>
                <div className="overflow-hidden rounded-lg border border-border">
                  <ul className="max-h-52 overflow-y-auto">
                    {viewStats.recentEvents.map((ev, i) => (
                      <li
                        key={i}
                        className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 bg-muted/20 px-4 py-2.5 text-xs last:border-0"
                      >
                        <span className="text-muted-foreground">
                          {new Date(ev.openedAt).toLocaleString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="flex items-center gap-3 tabular-nums">
                          <span className="truncate max-w-[80px]">{ev.country ?? '—'}</span>
                          <span className="truncate max-w-[100px]">{ev.browser ?? '—'}</span>
                          <span>
                            {ev.durationSeconds != null
                              ? `${ev.durationSeconds}s`
                              : '—'}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!viewStats && stats.totalPostcards > 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BarChart3 className="h-10 w-10 text-muted-foreground/50" />
            <p className="mt-2 font-medium text-muted-foreground">
              Aucune donnée d&apos;analyse pour le moment
            </p>
            <p className="text-sm text-muted-foreground">
              Les statistiques de vues apparaîtront lorsque vos cartes seront ouvertes.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

const statVariants = {
  default: 'border-border bg-card',
  success: 'border-emerald-200/60 bg-emerald-50/60 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/50',
  warning: 'border-amber-200/60 bg-amber-50/60 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/50',
  muted: 'border-border bg-muted/50 text-muted-foreground',
  info: 'border-blue-200/60 bg-blue-50/60 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800/50',
} as const

function StatCard({
  icon,
  label,
  value,
  variant = 'default',
}: {
  icon: React.ReactNode
  label: string
  value: number
  variant?: keyof typeof statVariants
}) {
  return (
    <Card className={statVariants[variant]}>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="opacity-70">{icon}</div>
        <div className="min-w-0">
          <div className="text-xl font-bold leading-none tabular-nums">{value}</div>
          <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wider opacity-80">
            {label}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
