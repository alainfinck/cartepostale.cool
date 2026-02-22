import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { User, Mail, Building2, CreditCard, ArrowLeft } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Mon compte',
  description: 'Informations de votre compte CartePostale.cool',
}

export const dynamic = 'force-dynamic'

const planLabels: Record<string, string> = {
  free: 'Gratuit',
  pro: 'Pro',
  enterprise: 'Enterprise',
}

export default async function EspaceClientComptePage() {
  const user = await getCurrentUser()
  if (!user) return null

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-serif font-bold text-stone-800">Mon compte</h1>
        <p className="text-stone-600 mt-1">Vos informations et préférences.</p>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100 bg-stone-50/50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-teal-100 flex items-center justify-center">
              <User className="w-7 h-7 text-teal-600" />
            </div>
            <div>
              <p className="font-bold text-stone-800 text-lg">{user.name || 'Utilisateur'}</p>
              <p className="text-stone-500 text-sm">{user.email}</p>
            </div>
          </div>
        </div>

        <dl className="divide-y divide-stone-100">
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-2">
            <dt className="flex items-center gap-2 text-stone-500 text-sm font-medium sm:w-40 shrink-0">
              <Mail size={18} /> Email
            </dt>
            <dd className="text-stone-800">{user.email}</dd>
          </div>
          {user.name && (
            <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-2">
              <dt className="flex items-center gap-2 text-stone-500 text-sm font-medium sm:w-40 shrink-0">
                <User size={18} /> Nom
              </dt>
              <dd className="text-stone-800">{user.name}</dd>
            </div>
          )}
          {user.company && (
            <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-2">
              <dt className="flex items-center gap-2 text-stone-500 text-sm font-medium sm:w-40 shrink-0">
                <Building2 size={18} /> Société
              </dt>
              <dd className="text-stone-800">{user.company}</dd>
            </div>
          )}
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-2">
            <dt className="flex items-center gap-2 text-stone-500 text-sm font-medium sm:w-40 shrink-0">
              <CreditCard size={18} /> Offre
            </dt>
            <dd className="text-stone-800">
              {user.plan ? planLabels[user.plan] || user.plan : 'Gratuit'}
            </dd>
          </div>
          {typeof user.cardsCreated === 'number' && (
            <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-2">
              <dt className="text-stone-500 text-sm font-medium sm:w-40 shrink-0">Cartes créées</dt>
              <dd className="text-stone-800">{user.cardsCreated}</dd>
            </div>
          )}
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-2">
            <dt className="text-stone-500 text-sm font-medium sm:w-40 shrink-0 font-bold text-teal-600">
              Crédits disponibles
            </dt>
            <dd className="text-teal-700 font-bold">{(user as any).credits || 0} cartes</dd>
          </div>
        </dl>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/connexion/mot-de-passe-oublie">
          <Button variant="outline" className="rounded-xl">
            Changer le mot de passe
          </Button>
        </Link>
        <Link href="/espace-client">
          <Button variant="ghost" className="rounded-xl text-stone-600">
            <ArrowLeft size={18} className="mr-2" /> Retour au tableau de bord
          </Button>
        </Link>
      </div>
    </div>
  )
}
