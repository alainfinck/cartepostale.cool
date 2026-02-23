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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/espace-client"
          className="flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-700 transition-colors"
        >
          <ArrowLeft size={18} />
          Retour
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-serif font-bold text-stone-800 flex items-center gap-2">
          <Sparkles size={28} className="text-teal-600" />
          Gérer mes crédits
        </h1>
        <p className="text-stone-600 mt-1">
          Rechargez votre compte avec un pack de cartes ou utilisez un code promo.
        </p>
      </div>
      <div className="w-full max-w-3xl">
        <CreditsCard
          initialCredits={user.credits || 0}
          userId={user.id}
          userEmail={user.email}
        />
      </div>
    </div>
  )
}
