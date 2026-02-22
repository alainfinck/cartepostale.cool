'use client'

import React from 'react'
import Link from 'next/link'
import { Clock, CreditCard, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PostcardExpiredBannerProps {
  publicId: string
  senderName: string
  expiresAt: string
  isCountdown?: boolean
}

function timeLeft(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return 'Expirée'
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  if (hours > 0) return `${hours}h ${minutes}min`
  return `${minutes} min`
}

export default function PostcardExpiredBanner({
  publicId,
  senderName,
  expiresAt,
  isCountdown,
}: PostcardExpiredBannerProps) {
  const [remaining, setRemaining] = React.useState(() => timeLeft(expiresAt))

  React.useEffect(() => {
    if (!isCountdown) return
    const interval = setInterval(() => setRemaining(timeLeft(expiresAt)), 60_000)
    return () => clearInterval(interval)
  }, [expiresAt, isCountdown])

  if (isCountdown) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 pt-2 pb-1">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 text-amber-700 text-xs sm:text-sm font-bold">
            <Clock size={16} className="shrink-0" />
            <span>Carte démo — expire dans {remaining}</span>
          </div>
          <Link
            href={`/editor?upgrade=${publicId}`}
            className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shrink-0"
          >
            <CreditCard size={14} />
            Passer en permanent — 2,50 €
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md w-full text-center">
      <div className="bg-white rounded-3xl shadow-xl border border-stone-200 p-8 sm:p-12">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock size={40} className="text-amber-500" />
        </div>
        <h2 className="text-2xl font-serif font-black text-stone-900 mb-3">
          Cette carte a expiré
        </h2>
        <p className="text-stone-500 text-sm mb-2 leading-relaxed">
          La carte démo de <strong>{senderName}</strong> était visible pendant 48 h et a expiré.
        </p>
        <p className="text-stone-400 text-xs mb-8">
          L&apos;expéditeur peut la récupérer en la convertissant en carte permanente.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/editor">
            <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-6 text-base rounded-xl shadow-lg shadow-teal-100 transition-all">
              <Sparkles size={18} className="mr-2" />
              Créer ma propre carte
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </Link>
          <Link href="/">
            <Button
              variant="ghost"
              className="w-full text-stone-400 hover:text-stone-600 font-semibold"
            >
              Retour à l&apos;accueil
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
