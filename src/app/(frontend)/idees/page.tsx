import React from 'react'
import Link from 'next/link'
import {
  BookOpen,
  Smartphone,
  Video,
  Mic,
  Map,
  Heart,
  Share2,
  ArrowRight,
  Sparkles,
  Globe,
  MessageCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function IdeasPage() {
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
            <span>Découvrez tout le potentiel</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-stone-800 mb-6 leading-tight">
            Plus qu&apos;une simple <span className="text-gradient-hero">carte postale</span>
          </h1>
          <p className="text-xl text-stone-600 mb-10 leading-relaxed max-w-2xl mx-auto">
            Explorez toutes les façons de rendre vos souvenirs inoubliables. Une expérience complète
            pour partager vos aventures comme jamais auparavant.
          </p>
          <Link href="/editor">
            <Button className="bg-stone-900 text-white hover:bg-stone-800 px-8 py-6 rounded-full text-lg font-bold shadow-lg shadow-stone-900/20 transition-all">
              Commencer à créer
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-24">
        {/* Section 1: Carnet de Voyage */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-stone-200/50 border border-stone-100 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex gap-4">
                  <div className="w-full h-48 bg-stone-100 rounded-2xl overflow-hidden">
                    {/* Placeholder image or abstract representation */}
                    <div className="w-full h-full bg-stone-200 animate-pulse" />
                  </div>
                  <div className="w-full h-48 bg-stone-100 rounded-2xl overflow-hidden mt-8">
                    <div className="w-full h-full bg-stone-200 animate-pulse" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-stone-100 rounded w-3/4" />
                  <div className="h-4 bg-stone-100 rounded w-full" />
                  <div className="h-4 bg-stone-100 rounded w-5/6" />
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
              <BookOpen size={32} />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-6">
              Le Carnet de Voyage
            </h2>
            <p className="text-lg text-stone-600 mb-6 leading-relaxed">
              Ne vous limitez pas à une seule photo. Racontez votre histoire en détail. Chaque image
              peut être accompagnée de ses propres notes, anecdotes et dates.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3 text-stone-600">
                <div className="mt-1 w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                  ✓
                </div>
                <span>Ajoutez des légendes détaillées pour chaque étape</span>
              </li>
              <li className="flex items-start gap-3 text-stone-600">
                <div className="mt-1 w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                  ✓
                </div>
                <span>Créez un véritable journal de bord numérique</span>
              </li>
              <li className="flex items-start gap-3 text-stone-600">
                <div className="mt-1 w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                  ✓
                </div>
                <span>Mise en page automatique et élégante</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Section 2: Multimedia (Video & Audio) */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center mb-6">
              <Video size={32} />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-6">Immersion Totale</h2>
            <p className="text-lg text-stone-600 mb-6 leading-relaxed">
              Certains moments méritent plus qu&apos;une image fixe. Intégrez des vidéos pour
              partager l&apos;ambiance, les sons et le mouvement de vos découvertes.
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-stone-100 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Mic size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-stone-800">Message Audio</h4>
                  <p className="text-sm text-stone-500">
                    Enregistrez votre voix pour un message personnel
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-stone-100 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center">
                  <Video size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-stone-800">Vidéo Intégrée</h4>
                  <p className="text-sm text-stone-500">Vos clips lus directement dans la carte</p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-stone-200/50 border border-stone-100 relative overflow-hidden">
              <div className="aspect-video bg-stone-900 rounded-2xl flex items-center justify-center relative overflow-hidden group cursor-pointer">
                <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1" />
                </div>
              </div>
              <div className="mt-6 flex items-center gap-4">
                <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div className="w-1/3 h-full bg-pink-500" />
                </div>
                <span className="text-xs text-stone-400 font-mono">00:34 / 01:20</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Carte & Localisation */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <div className="bg-white p-4 rounded-[40px] shadow-xl shadow-stone-200/50 border border-stone-100 relative overflow-hidden min-h-[400px]">
              <div className="absolute inset-0 bg-stone-100 m-4 rounded-[32px] overflow-hidden">
                {/* Map placeholder pattern */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center" />

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-blue-500/20 rounded-full animate-ping" />
                    <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
                  </div>
                </div>
                <div className="absolute bottom-1/4 right-1/3">
                  <div className="w-3 h-3 bg-stone-400 rounded-full border border-white" />
                </div>
                <div className="absolute top-1/3 left-1/4">
                  <div className="w-3 h-3 bg-stone-400 rounded-full border border-white" />
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <Map size={32} />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-6">
              Géolocalisation Automatique
            </h2>
            <p className="text-lg text-stone-600 mb-6 leading-relaxed">
              Vos photos contiennent souvent des données GPS. Nous les utilisons pour placer
              automatiquement vos souvenirs sur une carte interactive.
            </p>
            <p className="text-stone-600 mb-8">
              Vos proches peuvent visualiser votre parcours exact et découvrir les lieux que vous
              avez visités, étape par étape.
            </p>
            <Button
              variant="outline"
              className="rounded-full border-stone-200 text-stone-600 hover:bg-stone-50"
            >
              <Globe size={18} className="mr-2" />
              Voir un exemple
            </Button>
          </div>
        </section>

        {/* Section 4: Social & Mobile */}
        <section className="bg-white rounded-[40px] p-8 md:p-16 text-center border border-stone-100 shadow-xl shadow-stone-200/30">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl mb-8">
              <Smartphone size={32} />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-stone-800 mb-6">
              Pensé pour le Mobile
            </h2>
            <p className="text-xl text-stone-600 mb-12 leading-relaxed">
              Vos destinataires reçoivent un lien magique. Pas d&apos;application à installer. Juste
              une expérience fluide, belle et interactive, directement dans leur navigateur.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
              <div className="p-6 rounded-3xl bg-stone-50 hover:bg-purple-50 transition-colors group">
                <Heart className="w-8 h-8 text-stone-400 group-hover:text-purple-500 mb-4 transition-colors" />
                <h3 className="font-bold text-stone-800 mb-2">Réactions</h3>
                <p className="text-sm text-stone-500">
                  Un double-tap pour aimer, comme sur vos réseaux préférés.
                </p>
              </div>
              <div className="p-6 rounded-3xl bg-stone-50 hover:bg-purple-50 transition-colors group">
                <MessageCircle className="w-8 h-8 text-stone-400 group-hover:text-purple-500 mb-4 transition-colors" />
                <h3 className="font-bold text-stone-800 mb-2">Commentaires</h3>
                <p className="text-sm text-stone-500">
                  Discutez en privé ou en public directement sur la carte.
                </p>
              </div>
              <div className="p-6 rounded-3xl bg-stone-50 hover:bg-purple-50 transition-colors group">
                <Share2 className="w-8 h-8 text-stone-400 group-hover:text-purple-500 mb-4 transition-colors" />
                <h3 className="font-bold text-stone-800 mb-2">Partage Facile</h3>
                <p className="text-sm text-stone-500">
                  WhatsApp, SMS, Email ou réseaux sociaux en un clic.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-8">
            Prêt à raconter votre histoire ?
          </h2>
          <Link href="/editor">
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-95 text-white px-10 py-8 rounded-full text-xl font-bold shadow-xl shadow-pink-500/30 transition-all transform hover:scale-105">
              Créer ma première carte
              <Sparkles className="ml-2 w-6 h-6" />
            </Button>
          </Link>
          <p className="mt-6 text-stone-500">Aucune inscription requise pour commencer</p>
        </section>
      </div>
    </div>
  )
}
