'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Mail, Users, Building2, Eye, Share2,
    TrendingUp, Calendar, CreditCard, ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

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

export function StatsOverview({ stats }: { stats: Stats }) {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Title & Date */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-stone-800">Vue d'ensemble</h2>
                    <p className="text-stone-500 text-sm">Statistiques globales de votre plateforme.</p>
                </div>
                <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm border border-border/50 px-3 py-1.5 rounded-lg shadow-sm">
                    <Calendar size={14} className="text-stone-400" />
                    <span className="text-xs font-semibold text-stone-600 uppercase tracking-tight">
                        Aujourd'hui, {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
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
                        <Badge variant="outline" className="bg-background/50 border-border/50 shadow-none">Temps Réel</Badge>
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
                                    <span className="text-xs font-medium uppercase tracking-tight">Total Partages</span>
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
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-stone-500">Distribution</CardTitle>
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
        </div>
    )
}

function StatCard({
    icon, label, value, trend, variant, isPremium
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
    trend: string;
    variant: 'teal' | 'blue' | 'orange' | 'amber';
    isPremium?: boolean;
}) {
    const themes = {
        teal: "from-teal-500 to-teal-600 text-teal-600 shadow-teal-500/10",
        blue: "from-blue-500 to-blue-600 text-blue-600 shadow-blue-500/10",
        orange: "from-orange-500 to-orange-600 text-orange-600 shadow-orange-500/10",
        amber: "from-amber-400 to-amber-500 text-amber-600 shadow-amber-500/10",
    }

    return (
        <Card className="relative group overflow-hidden border-border/50 bg-card/60 backdrop-blur-md shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className={cn("absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 pointer-events-none transition-transform duration-700 group-hover:scale-125 bg-gradient-to-br", themes[variant].split(' ')[1])} />

            <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-inner text-white",
                        themes[variant].split(' ').slice(0, 2).join(' ')
                    )}>
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
                        <span className={cn("text-[11px] font-bold tracking-tight", themes[variant].split(' ')[2])}>
                            {trend}
                        </span>
                        <ChevronRight size={14} className="text-stone-300 transition-transform group-hover:translate-x-1" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function DistributionItem({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
    const percentage = total > 0 ? (value / total) * 100 : 0
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-stone-600 uppercase tracking-tight">{label}</span>
                <span className="text-xs font-bold text-stone-800">{value}</span>
            </div>
            <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden flex">
                <div className={cn("h-full transition-all duration-1000", color)} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    )
}
