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
  Camera,
  Map,
  MessageCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

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

      {/* Use cases Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Cas 1: Anniversaire */}
          <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-stone-200/50 border border-stone-100 hover:-translate-y-1 transition-transform duration-300">
            <div className="w-14 h-14 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center mb-6">
              <Gift size={28} />
            </div>
            <h3 className="text-2xl font-bold text-stone-800 mb-4">Carte d&apos;anniversaire</h3>
            <p className="text-stone-600 mb-6 leading-relaxed">
              Surprenez vos proches avec une carte remplie de photos, d&apos;anecdotes et de mémos
              vocaux. Vous pouvez même programmer l&apos;envoi pour que la carte arrive pile le jour
              J à la première heure.
            </p>
            <ul className="space-y-2 mb-8 text-sm text-stone-500">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span> Albums partagés
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span> Envoi programmé
              </li>
            </ul>
          </div>

          {/* Cas 2: Naissance */}
          <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-stone-200/50 border border-stone-100 hover:-translate-y-1 transition-transform duration-300">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <Heart size={28} />
            </div>
            <h3 className="text-2xl font-bold text-stone-800 mb-4">Faire-part de naissance</h3>
            <p className="text-stone-600 mb-6 leading-relaxed">
              Annoncez l&apos;arrivée de votre bébé de manière originale. Intégrez des photos haute
              qualité sans limite et partagez ce moment unique avec toute votre famille
              instantanément.
            </p>
            <ul className="space-y-2 mb-8 text-sm text-stone-500">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> Qualité HD
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> Diaporama photo
              </li>
            </ul>
          </div>

          {/* Cas 3: Vœux */}
          <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-stone-200/50 border border-stone-100 hover:-translate-y-1 transition-transform duration-300">
            <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
              <Star size={28} />
            </div>
            <h3 className="text-2xl font-bold text-stone-800 mb-4">Carte de vœux</h3>
            <p className="text-stone-600 mb-6 leading-relaxed">
              Souhaitez la bonne année ou de joyeuses fêtes d&apos;une façon moderne et interactive.
              Profitez de notre éditeur riche pour insérer vos meilleures rétrospectives en image.
            </p>
            <ul className="space-y-2 mb-8 text-sm text-stone-500">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span> Souvenirs de
                l&apos;année
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span> Envoi multiple
              </li>
            </ul>
          </div>

          {/* Cas 4: Séminaire */}
          <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-stone-200/50 border border-stone-100 hover:-translate-y-1 transition-transform duration-300">
            <div className="w-14 h-14 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mb-6">
              <Briefcase size={28} />
            </div>
            <h3 className="text-2xl font-bold text-stone-800 mb-4">Invitation séminaire</h3>
            <p className="text-stone-600 mb-6 leading-relaxed">
              Professionnels, invitez vos collaborateurs ou clients à vos événements avec une
              invitation digitale premium. Intégrez un plan d&apos;accès interactif Google Maps et
              le planning.
            </p>
            <ul className="space-y-2 mb-8 text-sm text-stone-500">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span> Cartographie GPS
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span> Statistiques de vue
              </li>
            </ul>
          </div>

          {/* Cas 5: Exposition */}
          <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-stone-200/50 border border-stone-100 hover:-translate-y-1 transition-transform duration-300">
            <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
              <ImageIcon size={28} />
            </div>
            <h3 className="text-2xl font-bold text-stone-800 mb-4">Invitation exposition</h3>
            <p className="text-stone-600 mb-6 leading-relaxed">
              Artistes et galeries d&apos;art, mettez vos œuvres en valeur en amont du vernissage
              avec une galerie virtuelle immersive directement intégrée à votre faire-part.
            </p>
            <ul className="space-y-2 mb-8 text-sm text-stone-500">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span> Design épuré
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span> Lien
                d&apos;inscription
              </li>
            </ul>
          </div>

          {/* Cas 6: Voyage */}
          <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-stone-200/50 border border-stone-100 hover:-translate-y-1 transition-transform duration-300">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-6">
              <Map size={28} />
            </div>
            <h3 className="text-2xl font-bold text-stone-800 mb-4">Carnet de voyage</h3>
            <p className="text-stone-600 mb-6 leading-relaxed">
              Créez un journal de bord numérique de vos vacances. Partagez chaque étape de votre
              aventure, jour après jour, avec géolocalisation et anecdotes pour vos amis restés au
              pays.
            </p>
            <ul className="space-y-2 mb-8 text-sm text-stone-500">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span> Chronologie
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span> Suivi géographique
              </li>
            </ul>
          </div>
        </div>

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
