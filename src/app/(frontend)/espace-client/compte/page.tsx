import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { Mail, CreditCard, ArrowLeft, ShieldCheck } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import AccountForm from './AccountForm'

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
    <div className="space-y-8 max-w-2xl px-4 sm:px-0 mx-auto">
      <div>
        <h1 className="text-3xl font-serif font-bold text-stone-800">Mon profil</h1>
        <p className="text-stone-600 mt-1">Personnalisez votre compte et vos liens sociaux.</p>
      </div>

      <AccountForm user={user} />

      <div className="space-y-6">
        <h3 className="text-lg font-serif font-bold text-stone-800">Paramètres système</h3>

        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
          <dl className="divide-y divide-stone-100">
            <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-2">
              <dt className="flex items-center gap-2 text-stone-500 text-sm font-medium sm:w-40 shrink-0">
                <Mail size={18} /> Email
              </dt>
              <dd className="text-stone-800 font-medium">{user.email}</dd>
            </div>

            <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-2">
              <dt className="flex items-center gap-2 text-stone-500 text-sm font-medium sm:w-40 shrink-0">
                <ShieldCheck size={18} /> Offre
              </dt>
              <dd className="text-stone-800">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 border border-teal-200">
                  {user.plan ? planLabels[user.plan] || user.plan : 'Gratuit'}
                </span>
              </dd>
            </div>

            {typeof user.cardsCreated === 'number' && (
              <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-2">
                <dt className="text-stone-500 text-sm font-medium sm:w-40 shrink-0">
                  Cartes créées
                </dt>
                <dd className="text-stone-800">{user.cardsCreated}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="flex flex-wrap gap-3 pt-4">
          <Link href="/connexion/mot-de-passe-oublie">
            <Button
              variant="outline"
              className="rounded-xl border-stone-200 text-stone-600 hover:bg-stone-50"
            >
              Changer le mot de passe
            </Button>
          </Link>
          <Link href="/espace-client">
            <Button variant="ghost" className="rounded-xl text-stone-500 hover:text-stone-800">
              <ArrowLeft size={18} className="mr-2" /> Retour au tableau de bord
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
