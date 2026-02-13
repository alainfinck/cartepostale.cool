'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Postcard } from '@/types'
import { Plus, Compass, ExternalLink, Heart, Library, Instagram, Mail, Sparkles, Zap, Wallet, Share2, Image, Camera, Repeat, MapPin, Check, Maximize2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import PostcardView from '@/components/postcard/PostcardView'
import { Button } from '@/components/ui/button'
import WordRotate from '@/components/ui/word-rotate'
import ComparisonSection from '@/components/home/ComparisonSection'

export default function Home() {
  const [savedPostcards, setSavedPostcards] = useState<Postcard[]>([])
  const [fullScreenPostcard, setFullScreenPostcard] = useState<Postcard | null>(null)

  useEffect(() => {
    setSavedPostcards([
      {
        id: 'demo-ski',
        frontImage: 'https://images.unsplash.com/photo-1486074218988-66a98816c117?auto=format&fit=crop&w=1200&q=80',
        location: 'Courchevel, France',
        message: "Les pistes sont incroyables cette année ! La poudreuse est au rendez-vous. On profite à fond de chaque descente. On se voit bientôt pour une fondue ?",
        recipientName: "La team Ski",
        senderName: "Léo",
        stampStyle: 'modern',
        date: '15 Jan 2025',
        isPremium: true,
        coords: { lat: 45.4147, lng: 6.6342 },
        mediaItems: [
          { id: 's1', type: 'image', url: 'https://images.unsplash.com/photo-1520629411511-eb4407764282?auto=format&fit=crop&w=800&q=80' },
          { id: 's2', type: 'video', url: 'https://assets.mixkit.co/videos/preview/mixkit-skier-going-fast-down-a-snowy-mountain-42621-large.mp4' }
        ]
      },
      {
        id: 'demo-japan',
        frontImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
        location: 'Kyoto, Japon',
        message: "Le calme des temples de Kyoto me ressource tellement. Les cerisiers commencent tout juste à bourgeonner. C'est d'une beauté indescriptible.",
        recipientName: "Anna",
        senderName: "Kévin",
        stampStyle: 'classic',
        date: '28 Mars 2024',
        isPremium: true,
        coords: { lat: 35.0116, lng: 135.7681 },
        mediaItems: [
          { id: 'j1', type: 'image', url: 'https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=800&q=80' }
        ]
      },
      {
        id: 'demo-canada',
        frontImage: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=1200&q=80',
        location: 'Banff, Canada',
        message: "On a vu des ours aujourd'hui ! (De loin, rassurez-vous). Les lacs sont d'un bleu turquoise qu'on ne voit nulle part ailleurs. On explore les Rocheuses en van.",
        recipientName: "Julie",
        senderName: "Thomas",
        stampStyle: 'airmail',
        date: '10 Août 2024',
        isPremium: true,
        coords: { lat: 51.1784, lng: -115.5708 },
        mediaItems: [
          { id: 'c1', type: 'image', url: 'https://images.unsplash.com/photo-1439396087961-99bc12bd8959?auto=format&fit=crop&w=800&q=80' }
        ]
      },
      {
        id: 'demo-anniv',
        frontImage: 'https://images.unsplash.com/photo-1530103043960-ef38714abb15?auto=format&fit=crop&w=1200&q=80',
        location: 'Votre Cœur, Partout',
        message: "Joyeux Anniversaire ! 🎂 Une petite carte pour marquer le coup et te souhaiter le meilleur pour cette nouvelle année. Profite bien de ta journée !",
        recipientName: "Manon",
        senderName: "Maxime",
        stampStyle: 'modern',
        date: '20 Fév 2025',
        isPremium: false,
        coords: { lat: 48.8566, lng: 2.3522 }
      },
      {
        id: 'demo-safari',
        frontImage: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
        location: 'Kruger Park, Afrique du Sud',
        message: "Réveil à 5h pour le game drive ce matin. On a croisé des éléphants et une lionne avec ses petits. L'aventure est exceptionnelle !",
        recipientName: "Les collègues",
        senderName: "Émilie",
        stampStyle: 'classic',
        date: '05 Nov 2024',
        isPremium: true,
        coords: { lat: -23.9884, lng: 31.5594 },
        mediaItems: [
          { id: 'sa1', type: 'image', url: 'https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=800&q=80' }
        ]
      }
    ])
  }, [])

  const demoCard: Postcard = {
    id: 'demo-rv',
    frontImage: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    location: 'Bali, Indonésie',
    message: "Salut la famille !\n\nOn est bien arrivés à Bali. Les paysages sont à couper le souffle, surtout les rizières d'Ubud. Le temps est magnifique et les gens sont d'une gentillesse incroyable. On profite de chaque instant !\n\nGrosses bises à tous,\nJulie & Thomas 🌴☀️",
    recipientName: "Famille Martin",
    senderName: "Julie & Thomas",
    stampStyle: 'classic',
    date: '12 Aout 2024',
    isPremium: false,
    coords: { lat: -8.4095, lng: 115.1889 }
  }

  const heroPostcard: Postcard = {
    id: 'hero-card',
    frontImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
    frontCaption: 'Bonjour de Paris ! 🗼',
    location: 'Paris, France',
    message: 'Salut tout le monde !\n\nUne petite pensée depuis la Ville Lumière. On s\'amuse beaucoup ici ! 🥐✨',
    recipientName: 'La famille',
    senderName: 'Julie',
    stampStyle: 'modern',
    date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
    isPremium: true,
    coords: { lat: 48.8566, lng: 2.3522 },
    mediaItems: [
      { id: 'h1', type: 'image', url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80' },
      { id: 'h2', type: 'image', url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80' },
      { id: 'h3', type: 'video', url: 'https://assets.mixkit.co/videos/preview/mixkit-paris-eiffel-tower-tourist-view-4455-large.mp4' },
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
                postales{' '}
                <span className="text-gradient-hero">magiques</span>
                <br />
                en quelques clics
              </h1>
              <p className="text-stone-600 text-lg md:text-xl leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8">
                Personnalisez votre carte postale virtuelle avec vos photos, vos messages et partagez-la avec vos proches. Simple, fun et coloré !
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
                <span>À partir de 1,99€ par carte</span>
                <span className="text-stone-300">·</span>
                <span>Sans abonnement</span>
              </p>
            </div>

            {/* Droite : carte postale au format recto/verso, clic ou glisser pour retourner */}
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
              <div className="animate-float-3d hover-tilt-3d transition-transform duration-500">
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
              Vos photos sublimes au recto, votre message manuscrit au verso. Une véritable carte postale, sans les délais de la poste.
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

              {/* Bouton Plein Écran sous la démo */}
              <div className="mt-8">
                <Button
                  onClick={() => setFullScreenPostcard(demoCard)}
                  variant="outline"
                  className="bg-white/80 backdrop-blur-sm border-2 border-stone-200 text-stone-600 hover:text-pink-600 hover:border-pink-200 transition-all rounded-full px-6 py-2 h-auto flex items-center gap-2 font-bold uppercase tracking-wider text-[10px] sm:text-xs shadow-sm hover:shadow-md"
                >
                  <Maximize2 size={14} />
                  <span>Voir en plein écran</span>
                </Button>
              </div>
            </div>

            <div className="mt-12 flex flex-col items-center gap-8 max-w-xl text-center">
              <div className="h-px w-24 bg-stone-200" />
              <p className="text-stone-500 italic">
                "Une expérience immersive : touchez la carte pour découvrir son verso et les détails de votre message."
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
      <section id="fonctionnalites" className="relative bg-[#faf8f5] border-b border-stone-100 overflow-hidden">
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
                <Mail className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-3">Carte postale virtuelle</h3>
              <p className="text-stone-600 text-base leading-relaxed">Créez une vraie carte en quelques clics depuis votre téléphone ou ordinateur. Plus besoin de chercher timbre ni boîte aux lettres.</p>
            </div>

            <div className="group flex flex-col p-8 md:p-10 rounded-3xl bg-white border border-stone-100 shadow-lg shadow-stone-200/30 hover:shadow-xl hover:shadow-purple-200/20 hover:border-purple-200/60 transition-all duration-300 hover:-translate-y-1">
              <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-3">Nouveau & innovant</h3>
              <p className="text-stone-600 text-base leading-relaxed">Une façon moderne de garder le charme du papier : message personnel, photos, vidéos et même localisation sur la carte.</p>
            </div>

            <div className="group flex flex-col p-8 md:p-10 rounded-3xl bg-white border border-stone-100 shadow-lg shadow-stone-200/30 hover:shadow-xl hover:shadow-pink-200/20 hover:border-pink-200/60 transition-all duration-300 hover:-translate-y-1">
              <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-100 to-orange-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-3">Instantané</h3>
              <p className="text-stone-600 text-base leading-relaxed">Fini les délais de la poste. Votre carte arrive tout de suite chez vos proches, où qu&apos;ils soient dans le monde.</p>
            </div>

            <div className="group flex flex-col p-8 md:p-10 rounded-3xl bg-white border border-stone-100 shadow-lg shadow-stone-200/30 hover:shadow-xl hover:shadow-purple-200/20 hover:border-purple-200/60 transition-all duration-300 hover:-translate-y-1">
              <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Wallet className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-3">Prix imbattable</h3>
              <p className="text-stone-600 text-base leading-relaxed">Payez 1 seule fois, envoyez à autant de personnes que vous voulez via un lien unique. Beaucoup moins cher que 10 timbres !</p>
            </div>

            <div className="group flex flex-col p-8 md:p-10 rounded-3xl bg-white border border-stone-100 shadow-lg shadow-stone-200/30 hover:shadow-xl hover:shadow-pink-200/20 hover:border-pink-200/60 transition-all duration-300 hover:-translate-y-1">
              <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Share2 className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-3">Vos proches réagissent !</h3>
              <p className="text-stone-600 text-base leading-relaxed">Plus qu'une simple lecture : ils peuvent liker, commenter et signer votre livre d'or. Interactivité garantie.</p>
            </div>

            <div className="group flex flex-col p-8 md:p-10 rounded-3xl bg-white border border-stone-100 shadow-lg shadow-stone-200/30 hover:shadow-xl hover:shadow-purple-200/20 hover:border-purple-200/60 transition-all duration-300 hover:-translate-y-1">
              <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Image className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-3">Vos photos, votre carte</h3>
              <p className="text-stone-600 text-base leading-relaxed">Mettez vos plus belles photos sur la carte, ajoutez un message à la main (style manuscrit) et envoyez. Simple et personnel.</p>
            </div>
          </div>
        </div>
      </section>

      <div id="exemples" className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between mb-16 text-center sm:text-left gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-stone-800">Inspirations Voyage</h2>
            <p className="text-stone-500 mt-2">Découvrez les fonctionnalités Premium (Album & Vidéo) à travers ces exemples.</p>
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

              <div className="w-[340px] sm:w-[600px] mt-4 flex justify-center">
                <button
                  onClick={() => setFullScreenPostcard(card)}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-50 border border-stone-200 text-stone-500 hover:text-teal-600 hover:border-teal-200 hover:bg-white transition-all text-[10px] font-bold uppercase tracking-widest shadow-sm"
                >
                  <Maximize2 size={12} />
                  Plein écran
                </button>
              </div>

              <div className="w-[340px] sm:w-[600px] mt-3 flex justify-between items-center px-4 py-3 bg-white border border-stone-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative">
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1.5 text-stone-400 hover:text-red-500 transition-colors group/btn">
                    <Heart size={18} className="group-hover/btn:fill-red-500 transition-colors" />
                    <span className="text-[10px] font-bold">{Math.floor(Math.random() * 50) + 10}</span>
                  </button>
                  <span className="text-stone-200">|</span>

                  <Link
                    href="/business"
                    className="flex items-center gap-1.5 text-pink-600 hover:text-pink-700 transition-colors text-[10px] font-bold uppercase tracking-wider group/agence"
                  >
                    <Library size={14} className="group-hover/agence:rotate-12 transition-transform" />
                    <span>Photothèque Agence</span>
                    <ExternalLink size={10} className="opacity-40" />
                  </Link>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2.5">
                    <div className="w-7 h-7 rounded-full bg-pink-100 border-2 border-white flex items-center justify-center text-[8px] text-pink-700 font-bold shadow-sm">JD</div>
                    <div className="w-7 h-7 rounded-full bg-purple-100 border-2 border-white flex items-center justify-center text-[8px] text-purple-700 font-bold shadow-sm">AM</div>
                    <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] text-slate-700 font-bold shadow-sm">+8</div>
                  </div>
                  <div className="flex gap-2 border-l border-stone-100 pl-4">
                    <button className="text-stone-300 hover:text-pink-600 transition-colors">
                      <Instagram size={18} />
                    </button>
                    <button className="text-stone-300 hover:text-pink-600 transition-colors">
                      <Mail size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className="bg-[#fefaf4] border-t border-stone-100 py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-pink-50 text-pink-600 text-xs font-bold uppercase tracking-[0.2em] rounded-full shadow-sm mb-4">
            Prix par carte
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4">
            Simple et transparent
          </h2>
          <p className="text-stone-500 text-lg">
            Pas d&apos;abonnement, pas de mauvaise surprise : vous payez uniquement chaque fois que vous envoyez une carte postale réelle.
          </p>
        </div>

        <div className="max-w-md mx-auto px-4 mt-12">
          <div className="relative bg-white border border-pink-100 rounded-[32px] shadow-[0_20px_60px_rgba(240,156,194,0.25)] overflow-hidden">
            <div className="bg-gradient-to-r from-pink-500 to-orange-400 text-white text-center px-10 py-7">
              <div className="text-sm uppercase tracking-[0.4em] font-semibold opacity-90">Prix par carte</div>
              <div className="mt-4 text-5xl font-bold leading-tight">1,99€</div>
              <p className="text-lg opacity-90 mt-2">par carte postale</p>
            </div>
            <div className="px-10 py-8 space-y-4">
              {[
                "Upload de vos propres images",
                "Templates prédéfinis inclus",
                "Texte personnalisable recto & verso",
                "Timbres décoratifs fun",
                "Téléchargement HD (PNG/PDF)",
                "Partage par lien & email",
                "Pas d'abonnement ni engagement",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-stone-600 text-base font-semibold">
                  <Check className="text-emerald-500" size={18} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="px-10 pb-10 pt-1">
              <div className="max-w-xs mx-auto">
                <Link href="/editor" className="w-full">
                  <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full font-bold text-lg py-5 shadow-lg shadow-pink-500/30 border-0">
                    Commencer maintenant 🪄
                  </Button>
                </Link>
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
                  className="max-w-[95vw] max-h-[85vh]"
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
