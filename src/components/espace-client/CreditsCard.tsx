'use client'

import React, { useState } from 'react'
import { Sparkles, Loader2, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type CreditsCardProps = {
  initialCredits: number
  userId: string | number
  userEmail?: string | null
}

export function CreditsCard({ initialCredits, userId, userEmail }: CreditsCardProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handlePurchase = async (packType: string, amount: number) => {
    setLoading(packType)
    setError(null)

    try {
      const res = await fetch('/api/revolut/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountEur: amount,
          description: `Pack ${packType.replace('pack_', '')} cartes - CartePostale.cool`,
          customerEmail: userEmail || undefined,
          redirectPath: '/espace-client?payment_success=true',
          metadata: {
            userId: userId.toString(),
            paymentType: packType,
          },
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la création du paiement')

      if (data.checkout_url) {
        window.location.href = data.checkout_url
      } else {
        throw new Error('URL de paiement manquante')
      }
    } catch (err: any) {
      console.error('Purchase error:', err)
      setError(err.message || 'Une erreur est survenue')
      setLoading(null)
    }
  }

  const packs = [
    { id: 'pack_5', label: '5 cartes', price: 12, icon: '💌' },
    { id: 'pack_10', label: '10 cartes', price: 22, icon: '✨' },
    { id: 'pack_20', label: '20 cartes', price: 40, icon: '💌', popular: true },
    { id: 'pack_50', label: '50 cartes', price: 95, icon: '📦' },
    { id: 'pack_100', label: '100 cartes', price: 150, icon: '🚀' },
    { id: 'pack_200', label: '200 cartes', price: 280, icon: '🏆' },
  ]

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-teal-50/40 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600 shrink-0">
            <Sparkles size={18} />
          </div>
          <div>
            <h2 className="font-bold text-stone-800 text-base">Mes crédits</h2>
            <p className="text-xs text-stone-500">
              <span className="font-semibold text-teal-600">{initialCredits}</span> cartes pré-payées disponibles
            </p>
          </div>
        </div>
        <p className="text-xs text-stone-500 sm:max-w-xs">
          Utilisez vos crédits pour publier sans repasser par le paiement.
        </p>
      </div>

      <div className="p-4 sm:p-5">
        {error && (
          <div className="mb-3 p-2.5 bg-rose-50 border border-rose-100 rounded-lg text-xs text-rose-600 font-medium">
            {error}
          </div>
        )}
        <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
          Recharger
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {packs.map((pack) => (
            <button
              key={pack.id}
              disabled={!!loading}
              onClick={() => handlePurchase(pack.id, pack.price)}
              className={cn(
                'flex items-center justify-between gap-2 p-2.5 rounded-lg border transition-all text-left group min-w-0',
                pack.popular
                  ? 'border-teal-200 bg-teal-50/50 hover:bg-teal-50'
                  : 'border-stone-100 hover:border-stone-200 hover:bg-stone-50',
              )}
            >
              <span className="text-base leading-none">{pack.icon}</span>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-stone-800 block truncate">{pack.label}</span>
                <span className="text-xs font-semibold text-stone-600">{pack.price} €</span>
              </div>
              {loading === pack.id ? (
                <Loader2 size={14} className="animate-spin text-teal-600 shrink-0" />
              ) : (
                <CreditCard size={12} className="text-stone-300 group-hover:text-teal-600 shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
