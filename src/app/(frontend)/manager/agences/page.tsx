import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default function ManagerAgencesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Agences</h1>
        <p className="text-muted-foreground">Gestion des agences (à venir).</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Fonctionnalité à venir</CardTitle>
          <CardDescription>
            La liste et la gestion des agences seront disponibles ici.
          </CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  )
}
