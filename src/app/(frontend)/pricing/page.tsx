import React from 'react'
import { Metadata } from 'next'
import { Check, X, Zap, ArrowRight, Sparkles, Users, Clock, Infinity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { PricingTracking } from '@/components/analytics/PricingTracking'

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
      '1 photo, mise en page carte postale',
      'Partage par lien',
      'Carte disponible 48 h',
      'Modifiable depuis votre compte',
    ],
    notIncluded: ['Sans filigrane', 'Album multi-photos', 'Audio ou vidéo'],
    color: 'stone',
    cta: 'Essayer gratuitement',
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
      '1 photo, mise en page carte postale',
      'Sans filigrane',
      'Carte conservée 1 an',
      'Modifiable depuis votre compte',
    ],
    notIncluded: ['Album multi-photos', 'Audio ou vidéo'],
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
      "Jusqu'à 5 photos",
      'Mise en page pêle-mêle',
      'Carte conservée 1 an',
      'Modifiable depuis votre compte',
    ],
    notIncluded: ['Audio ou vidéo'],
    color: 'indigo',
    cta: 'Créer mon album',
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
      "Jusqu'à 30 photos",
      'Mise en page pêle-mêle',
      'Durée de vie illimitée',
      'Option Audio & Vidéo disponible',
      'Modifiable depuis votre compte',
    ],
    color: 'violet',
    highlight: '⭐ Populaire',
    popular: true,
    cta: 'Créer mon album',
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-20 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-widest mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          Simple &amp; Transparent
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-800 mb-5">
          Des souvenirs, <span className="text-teal-500">au juste prix</span>
        </h1>
        <p className="text-lg text-stone-500 max-w-2xl mx-auto leading-relaxed">
          Commencez gratuitement, passez au premium en un clic. Chaque carte reste modifiable depuis
          votre compte, quelle que soit la formule.
        </p>

        {/* Quick tip */}
        <div className="mt-8 inline-flex items-start gap-3 bg-teal-600 text-white rounded-2xl px-5 py-4 text-left max-w-xl">
          <span className="text-xl mt-0.5">💡</span>
          <div>
            <p className="font-bold text-sm">Le conseil Gemini</p>
            <p className="text-teal-100 text-xs mt-0.5">
              L&apos;option <strong>Multi-destinataires (+4,99 €)</strong> est disponible sur tous
              les plans ! C&apos;est la solution idéale pour envoyer vos vœux à toute la famille en
              une seule fois.
            </p>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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

                    {plan.notIncluded && plan.notIncluded.length > 0 && (
                      <>
                        <div className="h-px bg-stone-100 my-3" />
                        {plan.notIncluded.map((f, i) => (
                          <div key={i} className="flex items-start gap-2 opacity-40">
                            <X className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                            <span className="text-stone-500 text-xs">{f}</span>
                          </div>
                        ))}
                      </>
                    )}
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

        {/* Options Section */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-serif font-bold text-stone-800">
              Personnalisez votre envoi
            </h2>
            <p className="text-stone-500 text-sm mt-2">
              Des options puissantes pour rendre votre carte inoubliable
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-xl">
                  🎙️
                </div>
                <div>
                  <h3 className="font-bold text-stone-800">Message Audio</h3>
                  <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">
                    Dès l&apos;Album M
                  </p>
                </div>
              </div>
              <p className="text-xs text-stone-500 mb-6 flex-grow">
                Enregistrez votre voix ou téléchargez un fichier audio. Votre message se lancera
                automatiquement dès que votre proche retournera la carte.
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-stone-800">+4,99 €</span>
                <span className="text-[10px] text-stone-400">/ carte</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-xl">
                  🎬
                </div>
                <div>
                  <h3 className="font-bold text-stone-800">Vidéo Premium</h3>
                  <p className="text-[10px] text-rose-600 font-bold uppercase tracking-wider">
                    Dès l&apos;Album M
                  </p>
                </div>
              </div>
              <p className="text-xs text-stone-500 mb-6 flex-grow">
                Donnez vie à vos souvenirs. Intégrez une vidéo qu&apos;on lance au retournement.
                L&apos;expérience ultime du numérique.
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-stone-800">+9,99 €</span>
                <span className="text-[10px] text-stone-400">/ carte</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-xl">
                  🚀
                </div>
                <div>
                  <h3 className="font-bold text-stone-800">Multi-destinataires</h3>
                  <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">
                    Tous les plans
                  </p>
                </div>
              </div>
              <p className="text-xs text-stone-500 mb-6 flex-grow">
                Envoyez la même carte (avec textes personnalisés) à jusqu&apos;à 5 proches en une
                seule fois. Idéal pour les vœux.
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-stone-800">+4,99 €</span>
                <span className="text-[10px] text-stone-400">/ envoi groupé</span>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison note */}
        <p className="text-center text-xs text-stone-400 mt-8">
          Paiement sécurisé via Revolut · CB, Apple Pay, Google Pay · Aucun abonnement requis
        </p>
      </div>

      {/* Feature Highlight — Upsell row */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-20">
        <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl" />
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex flex-col items-center md:items-start gap-3">
              <div className="w-12 h-12 bg-teal-500/20 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-teal-400" />
              </div>
              <p className="font-bold text-white">Pack Multi-destinataires</p>
              <p className="text-stone-400 text-sm">
                Envoyez la même carte à 5 proches pour{' '}
                <strong className="text-teal-400">4,99 €</strong> au lieu de 5 × 1,99 € = 9,95 €.
                Économisez 50 % !
              </p>
            </div>
            <div className="flex flex-col items-center md:items-start gap-3">
              <div className="w-12 h-12 bg-violet-500/20 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-violet-400" />
              </div>
              <p className="font-bold text-white">Upsell intelligent</p>
              <p className="text-stone-400 text-sm">
                Créez votre carte gratuite (48h), puis convertissez-la en{' '}
                <strong className="text-violet-400">Classique à 1,99 €</strong> avant expiration.
                Votre travail n&apos;est jamais perdu.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-start gap-3">
              <div className="w-12 h-12 bg-rose-500/20 rounded-2xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-rose-400" />
              </div>
              <p className="font-bold text-white">Modifiable à vie</p>
              <p className="text-stone-400 text-sm">
                Tous les plans permettent de modifier votre carte depuis votre compte : texte,
                photo, destinataire.
              </p>
            </div>
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
