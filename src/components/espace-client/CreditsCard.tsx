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

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-6 bg-teal-50/50 border-b border-stone-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-teal-600">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="font-bold text-stone-800">Mes Crédits</h2>
            <p className="text-xs text-stone-500 uppercase font-bold tracking-wider">
              Cartes pré-payées
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-3xl font-black text-teal-600">{initialCredits}</span>
          <span className="text-xs text-stone-400 block font-medium">disponibles</span>
        </div>
      </div>

      <div className="p-6 space-y-4 flex-grow">
        <p className="text-sm text-stone-600">
          Utilisez vos crédits pour publier vos cartes instantanément sans repasser par le paiement.
        </p>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-600 font-medium">
            {error}
          </div>
        )}

        <div className="space-y-3 pt-2">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
            Recharger mon compte
          </p>

          <div className="grid grid-cols-1 gap-2">
            {[
              { id: 'pack_5', label: 'Pack 5 cartes', price: 12, icon: '💌' },
              { id: 'pack_10', label: 'Pack 10 cartes', price: 22, icon: '✨' },
              { id: 'pack_20', label: 'Pack 20 cartes', price: 40, icon: '💌', popular: true },
              { id: 'pack_50', label: 'Pack 50 cartes', price: 95, icon: '📦' },
              { id: 'pack_100', label: 'Pack 100 cartes', price: 150, icon: '🚀' },
              { id: 'pack_200', label: 'Pack 200 cartes', price: 280, icon: '🏆' },
            ].map((pack) => (
              <button
                key={pack.id}
                disabled={!!loading}
                onClick={() => handlePurchase(pack.id, pack.price)}
                className={cn(
                  'flex items-center justify-between p-3 rounded-xl border transition-all text-left group',
                  pack.popular
                    ? 'border-teal-200 bg-teal-50/30 hover:bg-teal-50'
                    : 'border-stone-100 hover:border-stone-200 hover:bg-stone-50',
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{pack.icon}</span>
                  <div>
                    <span className="text-sm font-bold text-stone-800">{pack.label}</span>
                    {pack.popular && (
                      <span className="ml-2 py-0.5 px-2 bg-teal-600 text-[8px] font-black text-white uppercase rounded-full">
                        Top
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-stone-900">{pack.price} €</span>
                  {loading === pack.id ? (
                    <Loader2 size={16} className="animate-spin text-teal-600" />
                  ) : (
                    <CreditCard
                      size={14}
                      className="text-stone-300 group-hover:text-teal-600 transition-colors"
                    />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
