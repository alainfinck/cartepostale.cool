import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { User, Mail, Building2, CreditCard, ArrowLeft } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Mon compte - Espace Agence',
  description: 'Informations de votre compte agence',
}

export const dynamic = 'force-dynamic'

const planLabels: Record<string, string> = {
  free: 'Gratuit',
  pro: 'Pro',
  enterprise: 'Enterprise',
}

export default async function EspaceAgenceComptePage() {
  const user = await getCurrentUser()
  if (!user) return null

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mon compte</h1>
        <p className="text-muted-foreground mt-1">Vos informations personnelles.</p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/30">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-teal-100 flex items-center justify-center">
              <User className="w-7 h-7 text-teal-600" />
            </div>
            <div>
              <p className="font-bold text-foreground text-lg">{user.name || 'Utilisateur'}</p>
              <p className="text-muted-foreground text-sm">{user.email}</p>
            </div>
          </div>
        </div>

        <dl className="divide-y divide-border">
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-2">
            <dt className="flex items-center gap-2 text-muted-foreground text-sm font-medium sm:w-40 shrink-0">
              <Mail size={18} /> Email
            </dt>
            <dd className="text-foreground">{user.email}</dd>
          </div>
          {user.name && (
            <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-2">
              <dt className="flex items-center gap-2 text-muted-foreground text-sm font-medium sm:w-40 shrink-0">
                <User size={18} /> Nom
              </dt>
              <dd className="text-foreground">{user.name}</dd>
            </div>
          )}
          {user.company && (
            <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-2">
              <dt className="flex items-center gap-2 text-muted-foreground text-sm font-medium sm:w-40 shrink-0">
                <Building2 size={18} /> Société
              </dt>
              <dd className="text-foreground">{user.company}</dd>
            </div>
          )}
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-2">
            <dt className="flex items-center gap-2 text-muted-foreground text-sm font-medium sm:w-40 shrink-0">
              <CreditCard size={18} /> Offre
            </dt>
            <dd className="text-foreground">
              {user.plan ? planLabels[user.plan] || user.plan : 'Gratuit'}
            </dd>
          </div>
        </dl>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/connexion/mot-de-passe-oublie">
          <Button variant="outline" className="rounded-xl">
            Changer le mot de passe
          </Button>
        </Link>
        <Link href="/espace-agence">
          <Button variant="ghost" className="rounded-xl text-muted-foreground">
            <ArrowLeft size={18} className="mr-2" /> Retour au dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
