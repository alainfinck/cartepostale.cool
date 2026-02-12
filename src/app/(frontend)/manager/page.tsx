import Link from 'next/link'
import { Mail, Users, FileText, FileCheck } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getManagerStats } from '@/actions/manager-actions'

export const dynamic = 'force-dynamic'

export default async function ManagerDashboardPage() {
  const stats = await getManagerStats()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Tableau de bord</h1>
        <p className="text-muted-foreground">Vue d’ensemble de la plateforme.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cartes postales</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPostcards}</div>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Publiées</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.publishedPostcards}</div>
            <p className="text-xs text-muted-foreground">En ligne</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Brouillons</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draftPostcards}</div>
            <p className="text-xs text-muted-foreground">Non publiés</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Comptes utilisateurs</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cartes postales</CardTitle>
            <CardDescription>Gérer, publier et archiver les cartes.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/manager/cartes">
              <Button>Ouvrir la gestion des cartes</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Clients</CardTitle>
            <CardDescription>Voir la liste des utilisateurs inscrits.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/manager/clients">
              <Button variant="outline">Ouvrir la liste des clients</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
