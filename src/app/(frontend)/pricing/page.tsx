import React from 'react'
import { Metadata } from 'next'
import {
  Check,
  X,
  Zap,
  ArrowRight,
  Sparkles,
  Clock,
  Infinity,
  CalendarClock,
  Send,
  BarChart3,
  Video,
  MessageCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { PricingTracking } from '@/components/analytics/PricingTracking'
import { PacksSlider } from '@/components/pricing/PacksSlider'
import { RotatingHeroTitle } from '@/components/pricing/RotatingHeroTitle'

export const metadata: Metadata = {
  title: 'Tarifs — Cartes postales numériques | CartePostale.cool',
  description:
    'Prix unique tout compris : 2,50 €/carte. Photo, vidéo ou message vocal : même prix. Cartes 100 % virtuelles avec statistiques de visite. Carte gratuite 48 h modifiable via le lien reçu par email.',
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
    name: 'Carte gratuite',
    tagline: 'Essayez sans engagement',
    price: 'Gratuit',
    priceNote: 'valable 48 h',
    duration: '48 heures',
    features: [
      '1 carte postale (photo, texte)',
      'Modifiable via le lien reçu par email',
      'Prolongeable en carte payante à tout moment',
    ],
    color: 'stone',
    cta: 'Créer ma carte',
    ctaHref: '/editor',
  },
  {
    id: 'unite',
    emoji: '💌',
    name: 'À l\'unité',
    tagline: 'Prix unique tout compris',
    price: '2,50 €',
    priceNote: 'par carte',
    duration: 'Illimitée',
    features: [
      'Photo, vidéo ou message vocal : même prix',
      'Envoi à un nombre illimité de destinataires par carte',
      'Cartes 100 % virtuelles, avec statistiques de visite',
      'Programmation : envoi le jour de l’anniversaire à 8h00',
      'Modifiable depuis votre compte',
    ],
    color: 'teal',
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

export default function PricingPage() {
  return (
    <div className="bg-[#fdfbf7] min-h-screen">
      <PricingTracking />
      {/* Hero */}
      <div className="relative overflow-hidden">
        {/* Fond stylé : dégradé + motif léger */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-teal-50/80 via-white to-[#fdfbf7]"
          aria-hidden
        />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(20 184 166) 1px, transparent 0)', backgroundSize: '32px 32px' }} aria-hidden />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-14 sm:pt-16 pb-14 text-center">
          <h1 className="sr-only">Cartes postales du futur — Tarifs</h1>
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50/90 px-4 py-2.5 text-teal-700 mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-widest">
              Cartes postales du futur
            </span>
          </div>
          <p className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold text-stone-700 mb-4 min-h-[2.5em] sm:min-h-[2em] flex items-center justify-center">
            <RotatingHeroTitle />
          </p>
          <p className="text-lg text-stone-500 max-w-2xl mx-auto leading-relaxed">
            Photo, vidéo ou message vocal : même tarif. Cartes 100 % virtuelles, avec stats de visite
            — sans timbre ni impression. Jusqu&apos;à 10× moins cher qu&apos;une carte physique.
          </p>

          {/* Message clé + carte gratuite */}
          <div className="mt-7 inline-flex items-start gap-3 bg-teal-600 text-white rounded-2xl px-5 py-4 text-left max-w-xl shadow-lg shadow-teal-900/10">
            <span className="text-xl mt-0.5">💡</span>
            <div>
              <p className="font-bold text-sm">Carte gratuite 48 h</p>
              <p className="text-teal-100 text-xs mt-0.5">
                Créez une carte sans payer. Elle est valable 48 h et modifiable via le lien reçu par
                email — vous pourrez la modifier tant qu&apos;elle est active.
              </p>
            </div>
          </div>
        </div>
        {/* Ligne de transition douce vers le contenu */}
        <div className="h-8 bg-gradient-to-b from-transparent to-[#fdfbf7]" aria-hidden />
      </div>

      {/* Plans Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
          {plans.map((plan) => {
            const c = COLOR_MAP[plan.color]
            return (
              <div
                key={plan.id}
                className={cn(
                  'relative flex flex-col rounded-3xl border-2 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5',
                  plan.popular
                    ? `${c.border} ${c.bg} ring-2 ${c.ring} shadow-lg`
                    : 'border-stone-100 bg-white shadow-sm',
                )}
              >
                {/* Badge */}
                {plan.highlight && (
                  <div
                    className={cn(
                      'absolute top-0 right-0 px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-bl-2xl',
                      c.badge,
                    )}
                  >
                    {plan.highlight}
                  </div>
                )}

                <div className="p-6 flex flex-col h-full">
                  {/* Header */}
                  <div className="mb-5">
                    <span className="text-3xl">{plan.emoji}</span>
                    <h2 className="mt-2 text-lg font-bold text-stone-900 leading-tight">
                      {plan.name}
                    </h2>
                    <p className="text-xs text-stone-400 mt-0.5">{plan.tagline}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-5">
                    <span className={cn('text-3xl font-black', c.price)}>{plan.price}</span>
                    <span className="text-stone-400 text-xs ml-1">{plan.priceNote}</span>
                    <div
                      className={cn(
                        'mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold',
                        plan.popular ? c.price : 'text-stone-500',
                      )}
                    >
                      {durationIcon(plan.duration)}
                      {plan.duration}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex-grow space-y-2 mb-6">
                    {plan.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span
                          className={cn(
                            'mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center',
                            c.check,
                          )}
                        >
                          <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                        </span>
                        <span className="text-stone-700 text-xs leading-snug">{f}</span>
                      </div>
                    ))}

                    {plan.notIncluded && plan.notIncluded.length > 0 ? (
                      <>
                        <div className="h-px bg-stone-100 my-3" />
                        {plan.notIncluded.map((f, i) => (
                          <div key={i} className="flex items-start gap-2 opacity-40">
                            <X className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                            <span className="text-stone-500 text-xs">{f}</span>
                          </div>
                        ))}
                      </>
                    ) : null}
                  </div>

                  {/* CTA */}
                  <Link href={plan.ctaHref} className="mt-auto">
                    <Button
                      className={cn(
                        'w-full py-5 h-auto text-sm font-bold rounded-2xl transition-all flex items-center justify-center gap-2',
                        plan.price === 'Gratuit'
                          ? 'border-2 border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                          : c.btn,
                      )}
                    >
                      {plan.cta}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {/* Section Packs */}
        <div className="mt-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-serif font-bold text-stone-900 mb-3">Packs de Cartes</h2>
            <p className="text-stone-500 text-lg max-w-2xl mx-auto">
              Rechargez vos crédits en avance et profitez de tarifs dégressifs. Un crédit = une
              carte (photo, vidéo ou message vocal). Cartes virtuelles avec stats de visite.
            </p>
          </div>

          <PacksSlider />
        </div>
      </div>

      {/* Comparateur prix : virtuelle vs physique */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-24">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-serif font-bold text-stone-900 mb-3">
            Comparateur de prix
          </h2>
          <p className="text-stone-500 text-lg max-w-2xl mx-auto mb-4">
            Carte virtuelle vs carte papier : le même geste, un coût sans comparaison.
          </p>
          <p className="text-stone-600 text-sm max-w-2xl mx-auto mb-6 p-4 bg-teal-50/70 border border-teal-100 rounded-xl">
            <strong className="text-teal-800">En papier</strong> : chaque destinataire = une carte + un timbre à payer (donc le coût multiplie par le nombre d&apos;envois).{' '}
            <strong className="text-teal-800">Chez nous</strong> : une seule carte peut être envoyée à un nombre illimité de destinataires — vous ne payez qu&apos;une fois par carte.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] border-collapse rounded-2xl overflow-hidden border border-stone-200 bg-white shadow-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="text-left py-4 px-6 font-bold text-stone-800">Nombre d&apos;envois</th>
                <th className="text-center py-4 px-6 font-bold text-stone-600 bg-stone-100">
                  Carte papier (carte + timbre à chaque envoi)
                </th>
                <th className="text-center py-4 px-6 font-bold text-teal-700 bg-teal-50">
                  CartePostale.cool (1 carte = illimité de destinataires)
                </th>
                <th className="text-center py-4 px-6 font-bold text-stone-500 text-sm">
                  Économie
                </th>
              </tr>
            </thead>
            <tbody className="text-stone-700">
              <tr className="border-b border-stone-100">
                <td className="py-3 px-6 font-medium">1 envoi</td>
                <td className="py-3 px-6 text-center">~3,50 € (1 carte + 1 timbre)</td>
                <td className="py-3 px-6 text-center font-bold text-teal-600">2,50 €</td>
                <td className="py-3 px-6 text-center text-green-600 font-semibold">~30 % / 2,50 €</td>
              </tr>
              <tr className="border-b border-stone-100 bg-stone-50/30">
                <td className="py-3 px-6 font-medium">10 destinataires</td>
                <td className="py-3 px-6 text-center">~35 € (10 × carte + timbre)</td>
                <td className="py-3 px-6 text-center font-bold text-teal-600">22 € (pack 10) ou 1 carte réutilisable</td>
                <td className="py-3 px-6 text-center text-green-600 font-semibold">~37 % / 2,50 €</td>
              </tr>
              <tr className="border-b border-stone-100">
                <td className="py-3 px-6 font-medium">20 destinataires</td>
                <td className="py-3 px-6 text-center">~70 € (20 × carte + timbre)</td>
                <td className="py-3 px-6 text-center font-bold text-teal-600">40 € (pack 20) ou 1 carte réutilisable</td>
                <td className="py-3 px-6 text-center text-green-600 font-semibold">~43 % / 2,50 €</td>
              </tr>
              <tr className="border-b border-stone-100 bg-stone-50/30">
                <td className="py-3 px-6 font-medium">50 destinataires</td>
                <td className="py-3 px-6 text-center">~175 € (50 × carte + timbre)</td>
                <td className="py-3 px-6 text-center font-bold text-teal-600">95 € (pack 50) ou 1 carte réutilisable</td>
                <td className="py-3 px-6 text-center text-green-600 font-semibold">~46 % / 2,50 €</td>
              </tr>
              <tr>
                <td className="py-3 px-6 font-medium">100 destinataires</td>
                <td className="py-3 px-6 text-center">~350 € (100 × carte + timbre)</td>
                <td className="py-3 px-6 text-center font-bold text-teal-600">150 € (pack 100) ou 1 carte réutilisable</td>
                <td className="py-3 px-6 text-center text-green-600 font-semibold">~57 % / 2,50 €</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparateur de fonctionnalités */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-24">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-serif font-bold text-stone-900 mb-3">
            Comparateur de fonctionnalités
          </h2>
          <p className="text-stone-500 text-lg max-w-2xl mx-auto">
            Tout ce que la carte physique ne peut pas faire — inclus dans chaque carte virtuelle.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] border-collapse rounded-2xl overflow-hidden border border-stone-200 bg-white shadow-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="text-left py-4 px-6 font-bold text-stone-800">Fonctionnalité</th>
                <th className="text-center py-4 px-6 font-bold text-stone-600 bg-stone-100 w-[40%]">
                  Carte papier
                </th>
                <th className="text-center py-4 px-6 font-bold text-teal-700 bg-teal-50 w-[40%]">
                  CartePostale.cool
                </th>
              </tr>
            </thead>
            <tbody className="text-stone-700">
              <tr className="border-b border-stone-100">
                <td className="py-3 px-6 font-medium">
                  <span className="inline-flex items-center gap-2">
                    <Send className="w-4 h-4 text-stone-400 shrink-0" />
                    Délai d&apos;envoi
                  </span>
                </td>
                <td className="py-3 px-6 text-center">
                  <span className="text-red-600 font-medium">3 à 10 jours</span>
                </td>
                <td className="py-3 px-6 text-center">
                  <span className="text-green-600 font-bold">Instantané</span>
                </td>
              </tr>
              <tr className="border-b border-stone-100 bg-stone-50/30">
                <td className="py-3 px-6 font-medium">
                  <span className="inline-flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-stone-400 shrink-0" />
                    Statistiques de visite
                  </span>
                </td>
                <td className="py-3 px-6 text-center">
                  <X className="w-5 h-5 text-red-400 inline" />
                </td>
                <td className="py-3 px-6 text-center">
                  <Check className="w-5 h-5 text-green-500 inline" /> Savoir quand la carte est ouverte
                </td>
              </tr>
              <tr className="border-b border-stone-100">
                <td className="py-3 px-6 font-medium">
                  <span className="inline-flex items-center gap-2">
                    <Video className="w-4 h-4 text-stone-400 shrink-0" />
                    Vidéo intégrée
                  </span>
                </td>
                <td className="py-3 px-6 text-center">
                  <X className="w-5 h-5 text-red-400 inline" />
                </td>
                <td className="py-3 px-6 text-center">
                  <Check className="w-5 h-5 text-green-500 inline" /> Même prix que la photo
                </td>
              </tr>
              <tr className="border-b border-stone-100 bg-stone-50/30">
                <td className="py-3 px-6 font-medium">
                  <span className="inline-flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-stone-400 shrink-0" />
                    Message vocal
                  </span>
                </td>
                <td className="py-3 px-6 text-center">
                  <X className="w-5 h-5 text-red-400 inline" />
                </td>
                <td className="py-3 px-6 text-center">
                  <Check className="w-5 h-5 text-green-500 inline" /> Inclus
                </td>
              </tr>
              <tr className="border-b border-stone-100 bg-stone-50/30">
                <td className="py-3 px-6 font-medium">Destinataires par carte</td>
                <td className="py-3 px-6 text-center">
                  <span className="text-red-600 font-medium">1 seul</span>
                  <span className="block text-xs text-stone-500 mt-0.5">Chaque envoi = carte + timbre à payer</span>
                </td>
                <td className="py-3 px-6 text-center">
                  <span className="text-green-600 font-bold">Illimité</span>
                  <span className="block text-xs text-teal-700 mt-0.5">Une carte → autant de destinataires que vous voulez, même prix</span>
                </td>
              </tr>
              <tr className="border-b border-stone-100">
                <td className="py-3 px-6 font-medium">Modification après envoi</td>
                <td className="py-3 px-6 text-center">
                  <X className="w-5 h-5 text-red-400 inline" />
                </td>
                <td className="py-3 px-6 text-center">
                  <Check className="w-5 h-5 text-green-500 inline" /> Via le lien reçu par email
                </td>
              </tr>
              <tr className="bg-stone-50/30">
                <td className="py-3 px-6 font-medium">Programmation (anniversaire, etc.)</td>
                <td className="py-3 px-6 text-center">
                  <X className="w-5 h-5 text-red-400 inline" />
                </td>
                <td className="py-3 px-6 text-center">
                  <Check className="w-5 h-5 text-green-500 inline" /> Envoi à la date et l&apos;heure choisies
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature Highlight */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm hover:shadow-md hover:border-teal-200 transition-all">
            <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center mb-4">
              <CalendarClock className="w-6 h-6 text-teal-600" />
            </div>
            <p className="font-bold text-stone-900 mb-2">Programmation</p>
            <p className="text-stone-600 text-sm leading-relaxed">
              Envoyez la carte <strong className="text-teal-600">le jour de l’anniversaire à 8h00</strong> pile.
              Créez à l’avance, on s’occupe de l’envoi au bon moment.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm hover:shadow-md hover:border-teal-200 transition-all">
            <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-teal-600" />
            </div>
            <p className="font-bold text-stone-900 mb-2">Prix unique tout compris</p>
            <p className="text-stone-600 text-sm leading-relaxed">
              Photo, vidéo ou message vocal : <strong className="text-teal-600">même prix</strong>.
              Chaque carte peut être envoyée à un <strong className="text-teal-600">nombre illimité de destinataires</strong>. Cartes 100 % virtuelles, avec statistiques de visite — aucune impression.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm hover:shadow-md hover:border-violet-200 transition-all">
            <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-violet-600" />
            </div>
            <p className="font-bold text-stone-900 mb-2">Carte gratuite 48 h</p>
            <p className="text-stone-600 text-sm leading-relaxed">
              Créez sans payer. Votre carte est modifiable via le lien reçu par email — changez
              photo ou texte tant qu&apos;elle est active, puis prolongez à 2,50 € si vous le
              souhaitez.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm hover:shadow-md hover:border-rose-200 transition-all">
            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-rose-600" />
            </div>
            <p className="font-bold text-stone-900 mb-2">Modifiable depuis votre compte</p>
            <p className="text-stone-600 text-sm leading-relaxed">
              Toutes les cartes payantes restent modifiables : texte, photo, vidéo, destinataire.
            </p>
          </div>
        </div>
      </div>

      {/* Enterprise */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-24">
        <div className="border-2 border-dashed border-stone-200 rounded-3xl p-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-100 text-stone-600 text-xs font-bold uppercase tracking-widest mb-4">
            <Zap className="w-3.5 h-3.5" />
            Pro &amp; Agence
          </div>
          <h2 className="text-2xl font-bold text-stone-800 mb-3">Des volumes importants ?</h2>
          <p className="text-stone-500 mb-6 max-w-xl mx-auto">
            Tarifs dégressifs, API d&apos;envoi automatisé, white-label et support dédié pour vos
            campagnes marketing.
          </p>
          <Link href="/contact">
            <Button className="bg-stone-900 hover:bg-black text-white px-8 py-4 h-auto rounded-2xl font-bold">
              Contacter l&apos;équipe Pro
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* FAQ teaser */}
      <div className="max-w-3xl mx-auto px-4 pb-24 text-center">
        <h2 className="text-xl font-bold text-stone-800 mb-3">Une question ?</h2>
        <p className="text-stone-500 text-sm mb-6">
          Notre support répond généralement en moins d&apos;une heure en semaine.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-stone-200 rounded-full font-bold text-stone-700 hover:bg-stone-50 transition-colors text-sm"
        >
          Contacter le support
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
