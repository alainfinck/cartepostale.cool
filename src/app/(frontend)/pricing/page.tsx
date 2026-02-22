import React from 'react'
import { Metadata } from 'next'
import { Check, X, Zap, ArrowRight, Sparkles, Users, Clock, Infinity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { PricingTracking } from '@/components/analytics/PricingTracking'
import { PricingPageClient } from './PricingPageClient'

export const metadata: Metadata = {
  title: 'Tarifs — Cartes postales numériques | CartePostale.cool',
  description:
    'Découvrez nos tarifs : Éphémère (gratuit), Classique (1,99 €), Album S (2,99 €) ou Album M (4,99 €). Options Audio, Vidéo et Multi-destinataires disponibles.',
}

type PlanColor = 'stone' | 'teal' | 'indigo' | 'violet' | 'amber' | 'rose' | 'orange'

type PricingPlan = {
  id: string
  emoji: string
  name: string
  tagline: string
  price: string
  priceNote: string
  duration: string
  features: string[]
  notIncluded?: string[]
  color: PlanColor
  highlight?: string
  cta: string
  ctaHref: string
  popular?: boolean
}

const COLOR_MAP: Record<
  PlanColor,
  {
    ring: string
    border: string
    bg: string
    badge: string
    check: string
    price: string
    btn: string
  }
> = {
  stone: {
    ring: 'ring-stone-300',
    border: 'border-stone-200',
    bg: 'bg-stone-50',
    badge: 'bg-stone-200 text-stone-700',
    check: 'bg-stone-500',
    price: 'text-stone-800',
    btn: 'border-2 border-stone-200 text-stone-700 hover:bg-stone-100',
  },
  teal: {
    ring: 'ring-teal-400',
    border: 'border-teal-300',
    bg: 'bg-teal-50',
    badge: 'bg-teal-100 text-teal-800',
    check: 'bg-teal-500',
    price: 'text-teal-700',
    btn: 'bg-teal-500 hover:bg-teal-600 text-white shadow-lg shadow-teal-100',
  },
  indigo: {
    ring: 'ring-indigo-400',
    border: 'border-indigo-300',
    bg: 'bg-indigo-50',
    badge: 'bg-indigo-100 text-indigo-800',
    check: 'bg-indigo-500',
    price: 'text-indigo-700',
    btn: 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-100',
  },
  violet: {
    ring: 'ring-violet-400',
    border: 'border-violet-300',
    bg: 'bg-violet-50',
    badge: 'bg-violet-100 text-violet-800',
    check: 'bg-violet-500',
    price: 'text-violet-700',
    btn: 'bg-violet-500 hover:bg-violet-600 text-white shadow-lg shadow-violet-100',
  },
  amber: {
    ring: 'ring-amber-400',
    border: 'border-amber-300',
    bg: 'bg-amber-50',
    badge: 'bg-amber-100 text-amber-800',
    check: 'bg-amber-500',
    price: 'text-amber-700',
    btn: 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-100',
  },
  rose: {
    ring: 'ring-rose-400',
    border: 'border-rose-300',
    bg: 'bg-rose-50',
    badge: 'bg-rose-100 text-rose-800',
    check: 'bg-rose-500',
    price: 'text-rose-700',
    btn: 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-100',
  },
  orange: {
    ring: 'ring-orange-400',
    border: 'border-orange-300',
    bg: 'bg-orange-50',
    badge: 'bg-orange-100 text-orange-800',
    check: 'bg-orange-500',
    price: 'text-orange-700',
    btn: 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-100',
  },
}

const plans: PricingPlan[] = [
  {
    id: 'ephemere',
    emoji: '🌸',
    name: 'Éphémère',
    tagline: 'Essayez sans engagement',
    price: 'Gratuit',
    priceNote: 'pour toujours',
    duration: '48 heures',
    features: [
      '1 photo',
      'Mise en page carte postale',
      'Prolongeable en carte payante à tout moment',
      'Modifiable depuis votre compte',
    ],
    notIncluded: ['Album multi-photos', 'Audio ou vidéo'],
    color: 'stone',
    cta: 'Créer ma carte',
    ctaHref: '/editor',
  },
  {
    id: 'classique',
    emoji: '📬',
    name: 'Classique',
    tagline: 'Le souvenir qui dure',
    price: '1,99 €',
    priceNote: 'par carte',
    duration: '1 an',
    features: [
      "Jusqu'à 5 photos",
      'Mise en page pêle-mêle',
      'Carte conservée 1 an',
      'Modifiable depuis votre compte',
    ],
    notIncluded: ['Audio ou vidéo'],
    color: 'teal',
    cta: 'Créer ma carte',
    ctaHref: '/editor',
  },
  {
    id: 'album_s',
    emoji: '🖼️',
    name: 'Album S',
    tagline: 'Un pêle-mêle intime',
    price: '2,99 €',
    priceNote: 'par carte',
    duration: '1 an',
    features: [
      "Jusqu'à 10 photos",
      'Message vocal inclus',
      'Mise en page pêle-mêle',
      'Carte conservée 1 an',
      'Modifiable depuis votre compte',
    ],
    notIncluded: ['Vidéo'],
    color: 'indigo',
    cta: 'Créer ma carte',
    ctaHref: '/editor',
  },
  {
    id: 'album_m',
    emoji: '📸',
    name: 'Album M',
    tagline: 'Racontez votre voyage',
    price: '4,99 €',
    priceNote: 'par carte',
    duration: 'Illimitée',
    features: [
      "Jusqu'à 50 photos",
      'Vidéos incluses',
      'Mise en page pêle-mêle',
      'Durée de vie illimitée',
      'Modifiable depuis votre compte',
    ],
    color: 'violet',
    highlight: '⭐ Populaire',
    popular: true,
    cta: 'Créer ma carte',
    ctaHref: '/editor',
  },
]

const durationIcon = (duration: string) => {
  if (duration === '48 heures') return <Clock className="w-3.5 h-3.5" />
  if (duration === 'Illimitée') return <Infinity className="w-3.5 h-3.5" />
  return null
}

export default async function PricingPage() {
  const user = await getCurrentUser()

  return (
    <div className="bg-[#fdfbf7] min-h-screen">
      <PricingTracking />
      <PricingPageClient user={user} plans={plans} colorMap={COLOR_MAP} />
    </div>
  )
}
