import Link from 'next/link'
import { getManagerStats } from '@/actions/manager-actions'
import { getGlobalViewStats } from '@/actions/postcard-view-stats'
import { StatsOverview } from './StatsOverview'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Users, Building2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ManagerPage() {
  const [stats, viewStats] = await Promise.all([
    getManagerStats(),
    getGlobalViewStats(),
  ])

  const actionCards = [
    {
      title: 'Cartes postales',
      description: 'Accédez à la bibliothèque complète de cartes et filtrez par statut.',
      value: stats.totalPostcards,
      href: '/manager/cartes',
      Icon: Mail,
    },
    {
      title: 'Clients',
      description: 'Créez, modifiez ou supprimez les comptes utilisateurs.',
      value: stats.totalUsers,
      href: '/manager/clients',
      Icon: Users,
    },
    {
      title: 'Agences',
      description: 'Supervisez les partenaires et équipes enregistrées.',
      value: stats.totalAgencies,
      href: '/manager/agences',
      Icon: Building2,
    },
  ]

  return (
    <div className="space-y-8">
      <StatsOverview stats={stats} viewStats={viewStats} />

      <section className="grid gap-4 md:grid-cols-3">
        {actionCards.map(({ title, description, value, href, Icon }) => (
          <Card key={title} className="border-border/60 bg-card/60 backdrop-blur-md shadow-lg">
            <CardHeader className="flex items-center justify-between gap-2 border-b border-border/30 pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-[0.15em] text-stone-500 flex items-center gap-2">
                <Icon className="h-4 w-4 text-teal-500" />
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-4xl font-black text-stone-900">{value.toLocaleString()}</p>
              <p className="text-sm text-stone-500">{description}</p>
              <Button asChild variant="outline" className="w-full">
                <Link href={href} className="w-full text-center">
                  Explorer
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  )
}

