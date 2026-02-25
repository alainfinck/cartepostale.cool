import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { CreditsCard } from '@/components/espace-client/CreditsCard'

export const metadata: Metadata = {
  title: 'Gérer mes crédits',
  description: 'Recharger vos crédits cartes et utiliser un code promo',
}

export const dynamic = 'force-dynamic'

export default async function EspaceClientCreditsPage() {
  const user = await getCurrentUser()
  if (!user) return null

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-stone-900 tracking-tight flex items-center gap-3">
            Gérer mes crédits
            <Sparkles size={32} className="text-teal-500" />
          </h1>
          <p className="text-stone-500 mt-2 text-lg">
            Rechargez votre compte pour envoyer des cartes postales.
          </p>
        </div>
        <Link
          href="/espace-client"
          className="flex items-center gap-2 text-sm font-bold text-stone-600 hover:text-stone-900 transition-all bg-white border border-stone-200 px-4 py-2 rounded-xl shadow-sm hover:shadow-md"
        >
          <ArrowLeft size={18} />
          Retour au tableau de bord
        </Link>
      </div>

      <div className="w-full">
        <CreditsCard initialCredits={user.credits || 0} userId={user.id} userEmail={user.email} />
      </div>
    </div>
  )
}
