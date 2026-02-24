'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Postcard } from '@/types'
import { demoPostcards } from '@/data/demoPostcards'
import {
  Plus,
  Compass,
  Sparkles,
  Share2,
  Repeat,
  X,
  Building2,
  BarChart3,
  Palette,
  ArrowRight,
  BookOpen,
  Video,
  Mic,
  Map,
  Smartphone,
  Heart,
  Eye,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import PostcardView from '@/components/postcard/PostcardView'
import { Button } from '@/components/ui/button'

import ComparisonSection from '@/components/home/ComparisonSection'
import ShareHomeButtons from '@/components/social/ShareHomeButtons'

export default function Home() {
  const savedPostcards = demoPostcards
  const [fullScreenPostcard, setFullScreenPostcard] = useState<Postcard | null>(null)

  const demoCard: Postcard = {
    id: 'demo-rv',
    frontImage: 'https://img.cartepostale.cool/demo/photo-1596394516093-501ba68a0ba6.jpg',
    frontCaption: 'Salut de Bali ! 🌴',
    location: 'Bali, Indonésie',
    message:
      "Salut la famille !\n\nOn est bien arrivés à Bali. Les paysages sont à couper le souffle, surtout les rizières d'Ubud. Le temps est magnifique et les gens sont d'une gentillesse incroyable. On profite de chaque instant !\n\nGrosses bises à tous,\nJulie & Thomas 🌴☀️",
    recipientName: 'Famille Martin',
    senderName: 'Julie & Thomas',
    stampStyle: 'classic',
    date: '12 Aout 2024',
    isPremium: false,
    coords: { lat: -8.4095, lng: 115.1889 },
  }

  const heroPostcard: Postcard = {
    id: 'hero-card',
    frontImage: 'https://img.cartepostale.cool/demo/photo-1502602898657-3e91760cbb34.jpg',
    frontCaption: 'Bonjour de Paris ! 🗼',
    location: 'Paris, France',
    message:
      "Salut tout le monde !\n\nUne petite pensée depuis la Ville Lumière. On s'amuse beaucoup ici ! 🥐✨",
    recipientName: 'La famille',
    senderName: 'Julie',
    stampStyle: 'modern',
    date: '15 févr. 2025', // fixed for SSR/client hydration match (no Date.now/toLocale)
    isPremium: true,
    coords: { lat: 48.8566, lng: 2.3522 },
    mediaItems: [
      {
        id: 'h1',
        type: 'image',
        url: 'https://img.cartepostale.cool/demo/photo-1502602898657-3e91760cbb34.jpg',
      },
      {
        id: 'h2',
        type: 'image',
        url: 'https://img.cartepostale.cool/demo/photo-1499856871958-5b9627545d1a.jpg',
      },
    ],
  }

  return (
    <>
      {/* Hero — fond clair, deux colonnes, style PostCard */}
      <div className="relative bg-[#faf8f5] min-h-[90vh] flex items-center overflow-hidden py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Gauche : texte + CTA */}
            <div className="order-2 lg:order-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-100 to-orange-100 text-pink-700 text-sm font-bold mb-6">
                <Sparkles size={14} />
                <span>Créez des souvenirs uniques</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-stone-800 mb-6 leading-tight tracking-tight">
                Des cartes <br />
                postales <span className="text-gradient-hero">magiques</span>
                <br />
                en quelques clics
              </h1>
              <p className="text-stone-600 text-lg md:text-xl leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8">
                Personnalisez votre carte postale virtuelle avec vos photos, vos messages et
                partagez-la avec vos proches. Simple, fun et coloré !
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6">
                <Link href="/editor" className="inline-flex">
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-95 text-white px-8 py-6 rounded-2xl font-bold text-lg shadow-lg shadow-pink-500/25 border-0 inline-flex items-center justify-center gap-2 transition-all">
                    Créer ma carte <span className="opacity-90">→</span>
                  </Button>
                </Link>
                <Link href="#exemples" className="inline-flex">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto bg-white border-2 border-stone-300 text-stone-700 px-8 py-6 rounded-2xl font-bold text-lg hover:bg-stone-50 hover:border-stone-400 transition-all"
                  >
                    Voir des exemples
                  </Button>
                </Link>
              </div>
              <p className="text-stone-500 text-sm flex items-center justify-center lg:justify-start gap-2">
                <span>À partir de 0€ par carte</span>
                <span className="text-stone-300">·</span>
                <span>Sans abonnement</span>
              </p>
            </div>

            {/* Droite : carte postale au format recto/verso, clic ou glisser pour retourner */}
            <div className="order-1 lg:order-2 flex justify-center min-w-0 w-full">
              <div className="animate-float-3d hover-tilt-3d transition-transform duration-500 w-full max-w-full">
                <PostcardView
                  postcard={heroPostcard}
                  isPreview
                  isLarge={false}
                  className="rounded-3xl shadow-xl shadow-stone-200/40"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Recto/Verso */}
      <section className="py-16 bg-white border-b border-stone-100 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-pink-100/30 rounded-full blur-3xl" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-100/30 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-pink-50 border border-pink-100 rounded-full text-pink-700 text-xs font-bold uppercase tracking-widest mb-4">
              <Repeat size={12} />
              <span>Double Face</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4">
              L&apos;émotion d&apos;une vraie carte, la magie du numérique
            </h2>
            <p className="text-stone-500 text-lg max-w-2xl mx-auto">
              Vos photos sublimes au recto, votre message manuscrit au verso. Une véritable carte
              postale 100% virtuelle, sans les délais de la poste.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center">
            {/* Carte Postale Interactive à Effet Rotatif */}
            <div className="relative perspective-1000 group">
              {/* Bulle d'indication avec un style plus premium */}
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
                <div className="bg-stone-800 text-white text-[10px] uppercase tracking-widest font-bold px-4 py-2 rounded-full shadow-2xl flex items-center gap-2">
                  <Repeat size={12} className="animate-spin-slow" />
                  CLIQUEZ OU GLISSEZ POUR TOURNER
                </div>
                <div className="w-px h-4 bg-stone-300" />
              </div>

              <div className="animate-float-3d hover-tilt-3d transition-all duration-500">
                <PostcardView
                  postcard={demoCard}
                  isPreview={true}
                  isLarge={true}
                  className="shadow-[0_20px_50px_rgba(0,0,0,0.15)] group-hover:shadow-[0_30px_60px_rgba(0,0,0,0.2)] max-w-[95vw] md:max-w-5xl lg:max-w-7xl mx-auto"
                />
              </div>
            </div>

            <div className="mt-12 flex flex-col items-center gap-8 max-w-xl text-center">
              <div className="h-px w-24 bg-stone-200" />
              <p className="text-stone-500 italic">
                &quot;Une expérience immersive : touchez la carte pour découvrir son verso et les
                détails de votre message.&quot;
              </p>
              <Link href="/editor">
                <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-95 text-white rounded-full font-bold shadow-lg shadow-pink-500/25 flex items-center gap-3 px-10 py-7 text-lg transition-all duration-300 h-auto border-0">
                  <Plus size={24} /> Créer ma carte maintenant
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <ComparisonSection />

      {/* Arguments : carte virtuelle, innovant, pratique, pas cher, social, partage */}
      <section
        id="fonctionnalites"
        className="relative bg-[#faf8f5] border-b border-stone-100 overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-0 w-[500px] h-[400px] bg-pink-200/20 rounded-full blur-3xl -translate-x-1/2" />
          <div className="absolute bottom-20 right-0 w-[400px] h-[350px] bg-purple-200/20 rounded-full blur-3xl translate-x-1/3" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center mb-14 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-stone-800 mb-3">
              Tout pour créer la carte <span className="text-gradient-cta">parfaite</span>
            </h2>
            <p className="text-stone-500 text-lg md:text-xl max-w-2xl mx-auto">
              Des outils simples et puissants pour donner vie à vos cartes postales virtuelles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            <div className="group flex flex-col p-8 md:p-10 rounded-3xl bg-white border border-stone-100 shadow-lg shadow-stone-200/30 hover:shadow-xl hover:shadow-pink-200/20 hover:border-pink-200/60 transition-all duration-300 hover:-translate-y-1">
              <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-3">Carnet de Voyage</h3>
              <p className="text-stone-600 text-base leading-relaxed">
                Plus qu&apos;une simple image. Ajoutez des notes détaillées à chaque photo pour
                raconter l&apos;histoire complète de votre voyage.
              </p>
            </div>

            <div className="group flex flex-col p-8 md:p-10 rounded-3xl bg-white border border-stone-100 shadow-lg shadow-stone-200/30 hover:shadow-xl hover:shadow-purple-200/20 hover:border-purple-200/60 transition-all duration-300 hover:-translate-y-1">
              <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Smartphone className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-3">Vue Mobile & Flux</h3>
              <p className="text-stone-600 text-base leading-relaxed">
                Une expérience de lecture fluide sur mobile. Basculez instantanément entre la carte
                classique et un flux vertical moderne.
              </p>
            </div>

            <div className="group flex flex-col p-8 md:p-10 rounded-3xl bg-white border border-stone-100 shadow-lg shadow-stone-200/30 hover:shadow-xl hover:shadow-pink-200/20 hover:border-pink-200/60 transition-all duration-300 hover:-translate-y-1">
              <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-100 to-orange-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Video className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-3">Vidéos immersives</h3>
              <p className="text-stone-600 text-base leading-relaxed">
                Ne figez pas le temps, capturez-le ! Intégrez vos vidéos directement dans la carte
                pour partager l&apos;ambiance réelle du moment.
              </p>
            </div>

            <div className="group flex flex-col p-8 md:p-10 rounded-3xl bg-white border border-stone-100 shadow-lg shadow-stone-200/30 hover:shadow-xl hover:shadow-purple-200/20 hover:border-purple-200/60 transition-all duration-300 hover:-translate-y-1">
              <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Mic className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-3">Message Audio</h3>
              <p className="text-stone-600 text-base leading-relaxed">
                Faites entendre votre voix. Enregistrez un message audio personnel qui touchera vos
                proches bien plus qu&apos;un simple texte.
              </p>
            </div>

            <div className="group flex flex-col p-8 md:p-10 rounded-3xl bg-white border border-stone-100 shadow-lg shadow-stone-200/30 hover:shadow-xl hover:shadow-pink-200/20 hover:border-pink-200/60 transition-all duration-300 hover:-translate-y-1">
              <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Map className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-3">Carte Interactive</h3>
              <p className="text-stone-600 text-base leading-relaxed">
                Vos photos se positionnent automatiquement sur la carte. Vos proches visualisent
                votre parcours et chaque étape de votre voyage.
              </p>
            </div>

            <div className="group flex flex-col p-8 md:p-10 rounded-3xl bg-white border border-stone-100 shadow-lg shadow-stone-200/30 hover:shadow-xl hover:shadow-purple-200/20 hover:border-purple-200/60 transition-all duration-300 hover:-translate-y-1">
              <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Heart className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-3">Réactions & Livre d&apos;Or</h3>
              <p className="text-stone-600 text-base leading-relaxed">
                Créez le lien. Vos amis peuvent laisser des J&apos;aime, signer le livre d&apos;or
                et répondre à votre carte instantanément.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div id="exemples" className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between mb-16 text-center sm:text-left gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-stone-800">Inspirations Voyage</h2>
            <p className="text-stone-500 mt-2">
              Découvrez les fonctionnalités Premium (Album & Vidéo) à travers ces exemples.
            </p>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-pink-50 rounded-full border border-pink-100 shadow-sm text-xs font-bold text-pink-600 uppercase tracking-widest">
              <Compass size={14} className="animate-spin-slow" /> Galerie Mondiale
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-x-12 gap-y-24">
          {savedPostcards.map((card) => (
            <div key={card.id} className="flex flex-col items-center group">
              <PostcardView postcard={card} />
              <div className="mt-4 text-center">
                <p className="text-stone-500 text-sm">
                  par <span className="text-stone-600 font-semibold">{card.senderName}</span>
                </p>

                {/* Boutons de démo */}
                <div className="mt-4 flex flex-col sm:flex-row gap-2 w-full max-w-[340px] sm:max-w-[600px]">
                  <Button
                    asChild
                    variant="outline"
                    className="flex-1 rounded-xl bg-white border-stone-200 text-stone-600 hover:bg-stone-50 text-[10px] sm:text-xs font-bold py-2 h-auto"
                  >
                    <Link href={`/carte/${card.id}`}>
                      <Eye size={14} className="mr-1.5 text-teal-500" />
                      Voir comme un destinataire
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="flex-1 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-[10px] sm:text-xs font-bold py-2 h-auto"
                  >
                    <Link href="/editor">Créer une carte identique</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section Partage social — accroche + image + partage */}
      <section
        id="partage-social"
        className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-[#faf8f5] via-pink-50/40 to-purple-50/50 border-y border-stone-100"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-72 h-72 bg-pink-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200/25 rounded-full blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-center lg:text-left order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur border border-pink-200/60 text-pink-700 text-sm font-bold mb-6 shadow-sm">
                <Share2 size={16} />
                <span>Partagez l&apos;aventure</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-stone-800 mb-5 leading-tight">
                Une carte, un sourire, un souvenir&nbsp;! ✨
              </h2>
              <p className="text-stone-600 text-lg md:text-xl leading-relaxed mb-6 max-w-xl mx-auto lg:mx-0">
                Vous aimez CartePostale.cool ? Parlez-en autour de vous&nbsp;! 📮 Faites découvrir à
                vos proches la magie des cartes postales virtuelles — rapides, personnelles et
                pleines d&apos;émotions. 💌
              </p>
              <p className="text-stone-500 text-base mb-8 max-w-lg mx-auto lg:mx-0">
                Un clic pour créer, un clic pour partager. C&apos;est ça, la vie cool. 🌍❤️
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <ShareHomeButtons />
              </div>
            </div>
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-pink-400/20 to-purple-400/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                <img
                  src="/media/image1-cartepostale.cool.jpeg"
                  alt="CartePostale.cool - Créez et partagez vos cartes postales virtuelles"
                  className="relative w-full max-w-md rounded-2xl shadow-xl shadow-stone-300/40 border border-stone-200/80 object-cover aspect-[4/3] group-hover:scale-[1.02] transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business / Pro Section */}
      <section className="py-24 bg-[#061e1e] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/ui/grid.svg')] opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white/5 backdrop-blur-2xl rounded-[48px] border border-white/10 p-8 md:p-16 flex flex-col lg:flex-row items-center gap-16 shadow-3xl">
            <div className="flex-1 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 px-4 py-2 rounded-full text-sm font-black uppercase tracking-widest border border-teal-500/30">
                <Building2 size={16} /> Solutions pour Professionnels
              </div>
              <h2 className="text-4xl md:text-6xl font-serif font-bold text-white leading-tight">
                Faites rayonner <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-200 via-amber-200 to-teal-200">
                  votre marque.
                </span>
              </h2>
              <p className="text-xl text-teal-100/70 leading-relaxed max-w-2xl font-light">
                Agences de tourisme, hôtels, restaurants ou entreprises : offrez une expérience
                mémorable à vos clients tout en boostant votre visibilité organique.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 text-left">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400">
                    <Palette size={20} />
                  </div>
                  <div>
                    <div className="text-white font-bold">Co-Branding</div>
                    <div className="text-teal-100/50 text-xs">Votre logo sur chaque carte.</div>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="p-2 bg-teal-500/20 rounded-lg text-teal-400">
                    <BarChart3 size={20} />
                  </div>
                  <div>
                    <div className="text-white font-bold">Analytics</div>
                    <div className="text-teal-100/50 text-xs">Mesurez votre impact réel.</div>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <Link href="/business">
                  <Button className="bg-white text-teal-950 hover:bg-teal-50 px-10 py-7 rounded-2xl font-bold text-lg shadow-xl shadow-teal-950/20 border-0 flex items-center gap-3 transition-all h-auto">
                    Découvrir l&apos;Espace Business{' '}
                    <ArrowRight size={20} className="text-teal-600" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex-1 relative w-full lg:w-auto">
              {/* Decorative element for the visual side */}
              <div className="absolute -inset-4 bg-teal-500/20 rounded-[40px] rotate-2 -z-10 blur-3xl opacity-50"></div>
              <div className="bg-stone-900 rounded-[40px] p-2 shadow-2xl overflow-hidden border border-white/10 group">
                <img
                  src="https://img.cartepostale.cool/demo/photo-1486406146926-c627a92ad1ab.jpg"
                  alt="Business Dashboard Preview"
                  className="rounded-[38px] w-full opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                />
                <div className="absolute inset-0 flex items-center justify-center p-12">
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl text-center max-w-sm">
                    <div className="w-16 h-16 bg-white rounded-2xl mb-4 mx-auto flex items-center justify-center">
                      <span className="text-teal-900 font-serif font-black text-xl">PRO</span>
                    </div>
                    <h3 className="text-white text-xl font-bold mb-2">Signature Visuelle</h3>
                    <p className="text-teal-100/60 text-sm">
                      Intégrez votre identité sur chaque souvenir partagé.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal Plein Écran */}
      <AnimatePresence>
        {fullScreenPostcard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-stone-900/98 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-12 overflow-hidden"
          >
            <button
              onClick={() => setFullScreenPostcard(null)}
              className="absolute top-6 right-6 z-[210] p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border border-white/10 hover:border-white/20"
            >
              <X size={32} />
            </button>

            <div className="w-full h-full flex items-center justify-center">
              <div className="w-fit h-fit max-w-full max-h-full flex flex-col items-center gap-8">
                <PostcardView
                  postcard={fullScreenPostcard}
                  isLarge={true}
                  width="min(95vw, 1200px)"
                  height="min(63.3vw, 800px)"
                  className="shadow-[0_20px_60px_rgba(0,0,0,0.15)]"
                />

                <div className="bg-white/5 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 flex items-center gap-4 text-white/60">
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                    Utilisez les contrôles sur la carte au verso pour ajuster la taille du texte
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
