'use client'

import React, { useState } from 'react'
import {
  Sparkles,
  Loader2,
  CreditCard,
  Gift,
  Rocket,
  Zap,
  Trophy,
  Package,
  Star,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { redeemPromoCodeForCredits } from '@/actions/leads-actions'

type CreditsCardProps = {
  initialCredits: number
  userId: string | number
  userEmail?: string | null
}

export function CreditsCard({ initialCredits, userId, userEmail }: CreditsCardProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Promo code state
  const [promoCode, setPromoCode] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoMessage, setPromoMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

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

  const handleRedeemPromo = async () => {
    if (!promoCode || promoLoading) return
    setPromoLoading(true)
    setPromoMessage(null)

    try {
      const res = await redeemPromoCodeForCredits(promoCode)
      if (res.success) {
        setPromoMessage({ type: 'success', text: 'Succès ! 1 crédit a été ajouté à votre compte.' })
        setPromoCode('')
        // Optionally refresh page or update local state if we had a setCredits
        setTimeout(() => window.location.reload(), 2000)
      } else {
        setPromoMessage({ type: 'error', text: res.error || 'Code invalide ou déjà utilisé' })
      }
    } catch (err) {
      setPromoMessage({ type: 'error', text: 'Une erreur est survenue' })
    } finally {
      setPromoLoading(false)
    }
  }

  const packs = [
    {
      id: 'pack_5',
      label: 'DÉCOUVERTE',
      count: 5,
      price: 12,
      icon: Sparkles,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      id: 'pack_10',
      label: 'ESSENTIEL',
      count: 10,
      price: 22,
      icon: Zap,
      color: 'text-amber-500',
      bg: 'bg-amber-50',
    },
    {
      id: 'pack_20',
      label: 'POPULAIRE',
      count: 20,
      price: 40,
      icon: Star,
      color: 'text-teal-500',
      bg: 'bg-teal-50',
      popular: true,
    },
    {
      id: 'pack_50',
      label: 'AVENTURE',
      count: 50,
      price: 95,
      icon: Package,
      color: 'text-indigo-500',
      bg: 'bg-indigo-50',
    },
    {
      id: 'pack_100',
      label: 'PRO',
      count: 100,
      price: 150,
      icon: Rocket,
      color: 'text-purple-500',
      bg: 'bg-purple-50',
    },
    {
      id: 'pack_200',
      label: 'ILLIMITÉ',
      count: 200,
      price: 280,
      icon: Trophy,
      color: 'text-rose-500',
      bg: 'bg-rose-50',
      bestValue: true,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Balance Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-teal-800/80 to-emerald-600/60 rounded-3xl p-8 text-slate-50 shadow-2xl shadow-teal-400/40">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Sparkles size={120} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <p className="text-slate-200 font-medium tracking-widest text-xs uppercase mb-2">
              Solde actuel
            </p>
            <div className="flex items-baseline gap-3">
              <span className="text-6xl font-serif font-bold text-emerald-300">{initialCredits}</span>
              <span className="text-xl text-slate-200 font-medium">
                crédit{initialCredits > 1 ? 's' : ''}
              </span>
            </div>
            <p className="mt-4 text-slate-200/80 text-sm max-w-sm">
              Chaque crédit vous permet de publier une carte postale virtuelle de manière
              permanente.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg shadow-white/20 text-white">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0 shadow-inner shadow-white/30">
              <CreditCard size={24} />
            </div>
            <div>
              <p className="font-bold text-sm text-white">Paiement Sécurisé</p>
              <p className="text-xs text-white/70">Via Revolut Pay</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Packs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-stone-800 tracking-tight">
            Recharger votre compte
          </h2>
          <span className="text-xs font-medium text-stone-500 bg-stone-100 px-2 py-1 rounded-full uppercase tracking-wider">
            TVA Incluse
          </span>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-sm text-rose-600 font-medium flex items-center gap-2">
            <span className="w-2 h-2 bg-rose-600 rounded-full animate-pulse" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {packs.map((pack) => (
            <div
              key={pack.id}
              className={cn(
                'relative group flex flex-col p-6 rounded-3xl border transition-all duration-300',
                pack.popular
                  ? 'border-teal-200 bg-teal-50/30 shadow-lg shadow-teal-500/5 ring-1 ring-teal-500/10'
                  : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-xl hover:shadow-stone-200/50',
              )}
            >
              {pack.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
                  LE PLUS POPULAIRE
                </div>
              )}
              {pack.bestValue && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-rose-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
                  MEILLEURE OFFRE
                </div>
              )}

              <div className="flex items-center justify-between mb-6">
                <div
                  className={cn(
                    'w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110',
                    pack.bg,
                    pack.color,
                  )}
                >
                  <pack.icon size={24} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-stone-400 tracking-widest uppercase">
                    {pack.label}
                  </p>
                  <p className="text-2xl font-bold text-stone-800 tracking-tight">{pack.price}€</p>
                </div>
              </div>

              <div className="flex-1 space-y-4 mb-8">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-teal-500 shrink-0" />
                  <span className="text-stone-700 font-medium">{pack.count} crédits cartes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-teal-500 shrink-0" />
                  <span className="text-stone-500 text-sm">Sans date d'expiration</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-teal-500 shrink-0" />
                  <span className="text-stone-500 text-sm">Prêt à l'emploi</span>
                </div>
              </div>

              <Button
                disabled={!!loading}
                onClick={() => handlePurchase(pack.id, pack.price)}
                className={cn(
                  'w-full h-12 rounded-2xl font-bold transition-all gap-2',
                  pack.popular
                    ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/20'
                    : 'bg-stone-900 hover:bg-black text-white',
                )}
              >
                {loading === pack.id ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    <CreditCard size={18} />
                    Commander
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Promo Code Section */}
      <div className="bg-stone-50 rounded-3xl border border-stone-200/60 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
              <Gift size={20} className="text-teal-600" />
              Vous avez un code promo ?
            </h3>
            <p className="text-sm text-stone-500">
              Saisissez votre code pour profiter de crédits offerts.
            </p>
          </div>

          <div className="w-full md:w-auto min-w-[300px] flex flex-col gap-2">
            <div className="flex gap-2">
              <Input
                placeholder="Ex: BIENVENUE"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                className="h-12 bg-white rounded-xl border-stone-200 focus:border-teal-500 focus:ring-teal-500 uppercase font-mono tracking-widest text-center"
              />
              <Button
                onClick={handleRedeemPromo}
                disabled={!promoCode || promoLoading}
                className="h-12 px-6 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shrink-0"
              >
                {promoLoading ? <Loader2 size={18} className="animate-spin" /> : 'Activer'}
              </Button>
            </div>
            {promoMessage && (
              <p
                className={cn(
                  'text-xs font-semibold px-2 py-1 rounded-md animate-in fade-in slide-in-from-top-1',
                  promoMessage.type === 'success'
                    ? 'text-teal-700 bg-teal-50'
                    : 'text-rose-700 bg-rose-50',
                )}
              >
                {promoMessage.text}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="flex items-start gap-4 p-6 bg-blue-50/30 border border-blue-100 rounded-3xl">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
          <Sparkles size={20} />
        </div>
        <div>
          <h4 className="font-bold text-blue-900 text-sm mb-1">Comment utiliser vos crédits ?</h4>
          <p className="text-xs text-blue-800/70 leading-relaxed">
            Une fois vos crédits achetés, vous pouvez créer une nouvelle carte postale depuis
            l'éditeur. Au moment de la publication, si vous avez des crédits, ils seront utilisés
            automatiquement sans vous demander de paiement supplémentaire. 1 crédit = 1 carte
            publiée à vie.
          </p>
        </div>
      </div>
    </div>
  )
}
