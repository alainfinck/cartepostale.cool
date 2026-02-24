'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Mail,
  Users,
  Building2,
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
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PostcardViewStats } from '@/actions/postcard-view-stats'

interface Stats {
  totalPostcards: number
  publishedPostcards: number
  draftPostcards: number
  archivedPostcards: number
  totalViews: number
  totalShares: number
  totalUsers: number
  totalAgencies: number
  premiumPostcards: number
}

export function StatsOverview({
  stats,
  viewStats,
}: {
  stats: Stats
  viewStats?: PostcardViewStats | null
}) {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Title & Date */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-stone-800">Vue d&apos;ensemble</h2>
          <p className="text-stone-500 text-sm">Statistiques globales de votre plateforme.</p>
        </div>
        <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm border border-border/50 px-3 py-1.5 rounded-lg shadow-sm">
          <Calendar size={14} className="text-stone-400" />
          <span className="text-xs font-semibold text-stone-600 uppercase tracking-tight">
            Aujourd&apos;hui,{' '}
            {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
          </span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Mail size={22} />}
          label="Cartes Créées"
          value={stats.totalPostcards}
          trend="+12% ce mois"
          variant="teal"
        />
        <StatCard
          icon={<Users size={22} />}
          label="Utilisateurs"
          value={stats.totalUsers}
          trend="+5nouveaux"
          variant="blue"
        />
        <StatCard
          icon={<Building2 size={22} />}
          label="Agences"
          value={stats.totalAgencies}
          trend="Partenaires"
          variant="orange"
        />
        <StatCard
          icon={<CreditCard size={22} />}
          label="Premium"
          value={stats.premiumPostcards}
          trend={`${Math.round((stats.premiumPostcards / stats.totalPostcards) * 100)}% du total`}
          variant="amber"
          isPremium
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visibility Detail */}
        <Card className="lg:col-span-2 border-border/50 bg-card/60 backdrop-blur-md shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/30 bg-muted/20 pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-stone-500 flex items-center gap-2">
              <TrendingUp size={16} className="text-teal-500" />
              Engagement & Visibilité
            </CardTitle>
            <Badge variant="outline" className="bg-background/50 border-border/50 shadow-none">
              Temps Réel
            </Badge>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-stone-400">
                  <Eye size={16} />
                  <span className="text-xs font-medium uppercase tracking-tight">Total Vues</span>
                </div>
                <div className="text-4xl font-black text-stone-800 tracking-tighter">
                  {stats.totalViews.toLocaleString()}
                </div>
                <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 w-[70%]" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-stone-400">
                  <Share2 size={16} />
                  <span className="text-xs font-medium uppercase tracking-tight">
                    Total Partages
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

        {/* Status Breakdown */}
        <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-sm">
          <CardHeader className="border-b border-border/30 bg-muted/20 pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-stone-500">
              Distribution
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
      </div>

      {/* Statistiques de vues détaillées (analytics) */}
      {viewStats && (
        <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/30 bg-muted/20 pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-stone-500 flex items-center gap-2">
              <Activity size={16} className="text-teal-500" />
              Statistiques de vues détaillées
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
                  <Users size={14} />
                  <span className="text-[10px] font-medium uppercase tracking-tight">
                    Sessions uniques
                  </span>
                </div>
                <p className="text-2xl font-bold text-stone-800">
                  {viewStats.uniqueSessions.toLocaleString()}
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

      {/* Tracking & Marketing Info */}
      <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/30 bg-muted/20 pb-4">
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-stone-500 flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-500" />
            Tracking & Marketing
          </CardTitle>
          <Badge variant="outline" className="bg-background/50 border-border/50 shadow-none">
            Configuration
          </Badge>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Google Analytics */}
            <div className="space-y-4 p-4 rounded-xl bg-white/40 border border-border/40 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#F9AB00] flex items-center justify-center text-white">
                    <Activity size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-800 leading-tight">Google Analytics 4</h4>
                    <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                      Trafic & Audience
                    </p>
                  </div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">
                  Actif
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-stone-500">ID de mesure :</p>
                <code className="block p-2 bg-stone-100/80 rounded border border-stone-200 text-sm font-mono text-stone-800">
                  G-D0R51ZLTS9
                </code>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                Analyse le comportement des utilisateurs, les sources de trafic et les performances
                des pages.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-stone-200 hover:bg-stone-50 text-stone-600 gap-2 font-bold"
                asChild
              >
                <a
                  href="https://analytics.google.com/analytics/web/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ouvrir le Dashboard GA4 <ExternalLink size={14} />
                </a>
              </Button>
            </div>

            {/* Facebook Pixel */}
            <div className="space-y-4 p-4 rounded-xl bg-white/40 border border-border/40 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#0866FF] flex items-center justify-center text-white">
                    <Share2 size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-800 leading-tight">Meta Pixel</h4>
                    <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                      Conversion & Ads
                    </p>
                  </div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">
                  Actif
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-stone-500">ID du Pixel :</p>
                <code className="block p-2 bg-stone-100/80 rounded border border-stone-200 text-sm font-mono text-stone-800">
                  {process.env.NEXT_PUBLIC_META_PIXEL_ID || 'Non configuré'}
                </code>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                Suit les conversions et permet le reciblage publicitaire (retargeting) sur Facebook
                et Instagram.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-stone-200 hover:bg-stone-50 text-stone-600 gap-2 font-bold"
                asChild
              >
                <a
                  href="https://adsmanager.facebook.com/events_manager2/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ouvrir Events Manager <ExternalLink size={14} />
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
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
