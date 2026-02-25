import React from 'react'
import Link from 'next/link'
import {
  Gift,
  Star,
  Heart,
  Briefcase,
  Image as ImageIcon,
  ArrowRight,
  Sparkles,
  Map,
  MessageCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DemoCard } from '@/components/cas-d-usage/DemoCard'
import { demoPostcards } from '@/data/demoPostcards'

const USE_CASES = [
  {
    id: 'anniversaire',
    demoSlug: 'demo-anniv',
    icon: Gift,
    iconBg: 'bg-pink-100 text-pink-600',
    dotColor: 'bg-pink-400',
    title: "Carte d'anniversaire",
    description:
      "Surprenez vos proches avec une carte remplie de photos, d'anecdotes et de mémos vocaux. Vous pouvez même programmer l'envoi pour que la carte arrive pile le jour J à la première heure.",
    bullets: ['Albums partagés', 'Envoi programmé'],
  },
  {
    id: 'naissance',
    demoSlug: 'demo-birth',
    icon: Heart,
    iconBg: 'bg-blue-100 text-blue-600',
    dotColor: 'bg-blue-400',
    title: 'Faire-part de naissance',
    description:
      "Annoncez l'arrivée de votre bébé de manière originale. Intégrez des photos haute qualité sans limite et partagez ce moment unique avec toute votre famille instantanément.",
    bullets: ['Qualité HD', 'Diaporama photo'],
  },
  {
    id: 'voeux',
    demoSlug: 'demo-mothers-day',
    icon: Star,
    iconBg: 'bg-orange-100 text-orange-600',
    dotColor: 'bg-orange-400',
    title: 'Carte de vœux',
    description:
      "Souhaitez la bonne année ou de joyeuses fêtes d'une façon moderne et interactive. Profitez de notre éditeur riche pour insérer vos meilleures rétrospectives en image.",
    bullets: ["Souvenirs de l'année", 'Envoi multiple'],
  },
  {
    id: 'seminaire',
    demoSlug: 'demo-safari',
    icon: Briefcase,
    iconBg: 'bg-teal-100 text-teal-600',
    dotColor: 'bg-teal-400',
    title: 'Invitation séminaire',
    description:
      "Professionnels, invitez vos collaborateurs ou clients à vos événements avec une invitation digitale premium. Intégrez un plan d'accès interactif Google Maps et le planning.",
    bullets: ['Cartographie GPS', 'Statistiques de vue'],
  },
  {
    id: 'remerciement',
    demoSlug: 'demo-wedding',
    icon: MessageCircle,
    iconBg: 'bg-emerald-100 text-emerald-600',
    dotColor: 'bg-emerald-400',
    title: 'Carte de remerciement',
    description:
      "Remerciez vos invités, vos proches ou vos clients après un événement. Une carte personnalisée avec vos plus belles photos et un message sincère, envoyée en un clic à toute votre liste.",
    bullets: ['Message personnalisé', 'Envoi multiple'],
  },
  {
    id: 'exposition',
    demoSlug: 'demo-japan',
    icon: ImageIcon,
    iconBg: 'bg-purple-100 text-purple-600',
    dotColor: 'bg-purple-400',
    title: 'Invitation exposition',
    description:
      "Artistes et galeries d'art, mettez vos œuvres en valeur en amont du vernissage avec une galerie virtuelle immersive directement intégrée à votre faire-part.",
    bullets: ['Design épuré', "Lien d'inscription"],
  },
  {
    id: 'voyage',
    demoSlug: 'demo-ski',
    icon: Map,
    iconBg: 'bg-rose-100 text-rose-600',
    dotColor: 'bg-rose-400',
    title: 'Carnet de voyage',
    description:
      "Créez un journal de bord numérique de vos vacances. Partagez chaque étape de votre aventure, jour après jour, avec géolocalisation et anecdotes pour vos amis restés au pays.",
    bullets: ['Chronologie', 'Suivi géographique'],
  },
] as const

export default function CasDUsagePage() {
  return (
    <div className="bg-[#faf8f5] min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-stone-200 text-stone-600 text-sm font-medium mb-8 shadow-sm">
            <Sparkles size={16} className="text-pink-500" />
            <span>À chaque occasion sa carte</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-stone-800 mb-6 leading-tight">
            Des cas d&apos;utilisation <span className="text-gradient-hero">infinis</span>
          </h1>
          <p className="text-xl text-stone-600 mb-10 leading-relaxed max-w-2xl mx-auto">
            Que ce soit pour un événement personnel inoubliable ou une communication professionnelle
            percutante, notre système de création s&apos;adapte à tous vos besoins.
          </p>
          <Link href="/editor">
            <Button className="bg-stone-900 text-white hover:bg-stone-800 px-8 py-6 rounded-full text-lg font-bold shadow-lg shadow-stone-900/20 transition-all">
              Créer ma carte maintenant
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* One section per use case with demo card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-24">
        {USE_CASES.map((uc, index) => {
          const demo = demoPostcards.find((c) => c.id === uc.demoSlug)
          const Icon = uc.icon
          const demoImage = demo?.frontImage ?? 'https://img.cartepostale.cool/demo/photo-1507525428034-b723cf961d3e.jpg'
          const demoSubtitle = demo ? `De ${demo.senderName} pour ${demo.recipientName}` : undefined
          const isReversed = index % 2 === 1

          return (
            <section
              key={uc.id}
              id={uc.id}
              className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center"
            >
              <div className={isReversed ? 'md:order-2' : ''}>
                <div
                  className={`w-14 h-14 ${uc.iconBg} rounded-2xl flex items-center justify-center mb-6`}
                >
                  <Icon size={28} />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-stone-800 mb-4">{uc.title}</h2>
                <p className="text-stone-600 mb-6 leading-relaxed">{uc.description}</p>
                <ul className="space-y-2 text-sm text-stone-500">
                  {uc.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${uc.dotColor}`} />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={isReversed ? 'md:order-1' : ''}>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
                  Carte démo
                </p>
                <DemoCard
                  slug={uc.demoSlug}
                  imageUrl={demoImage}
                  title={uc.title}
                  subtitle={demoSubtitle}
                  className="max-w-sm mx-auto md:mx-0"
                />
              </div>
            </section>
          )
        })}

        {/* Call to Action */}
        <section className="mt-20 text-center">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-[40px] p-12 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6 relative z-10">
              Une infinité de possibilités
            </h2>
            <p className="text-lg text-pink-50 mb-8 max-w-2xl mx-auto relative z-10">
              La plateforme est conçue pour être la plus souple possible. Laissez parler votre
              créativité, peu importe l&apos;occasion à célébrer.
            </p>
            <Link href="/editor" className="relative z-10">
              <Button className="bg-white text-pink-600 hover:bg-stone-50 px-10 py-7 rounded-full text-xl font-bold shadow-xl transition-all transform hover:scale-105">
                Démarrer une création
                <Sparkles className="ml-2 w-6 h-6" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
