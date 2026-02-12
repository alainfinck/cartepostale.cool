'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Postcard } from '@/types'
import { Plus, Compass, ExternalLink, Heart, Library, Instagram, Mail, Sun, Sparkles, Zap, Wallet, Share2, Image, Camera, Repeat } from 'lucide-react'
import PostcardView from '@/components/postcard/PostcardView'
import { Button } from '@/components/ui/button'
import WordRotate from '@/components/ui/word-rotate'

export default function Home() {
  const [savedPostcards, setSavedPostcards] = useState<Postcard[]>([])

  useEffect(() => {
    setSavedPostcards([
      {
        id: 'demo-1',
        frontImage: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        location: 'Grand Canyon, USA',
        message: "L'immensité de ce lieu est impossible à décrire. Nous avons marché sur le sentier Bright Angel aujourd'hui. Les couleurs au coucher du soleil sont irréelles. Un souvenir gravé à jamais !",
        recipientName: "Papa & Maman",
        senderName: "Sarah",
        stampStyle: 'classic',
        date: '12 Oct 2024',
        isPremium: true,
        coords: { lat: 36.0544, lng: -112.1401 },
        mediaItems: [
          { id: 'm1', type: 'image', url: 'https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?auto=format&fit=crop&w=800&q=80' },
          { id: 'm2', type: 'video', url: 'https://assets.mixkit.co/videos/preview/mixkit-grand-canyon-scenery-view-4844-large.mp4' },
          { id: 'm3', type: 'image', url: 'https://images.unsplash.com/photo-1527333656061-ca7adf608ae1?auto=format&fit=crop&w=800&q=80' }
        ]
      },
      {
        id: 'demo-2',
        frontImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        location: 'Kyoto, Japon',
        message: "J'ai trouvé le jardin zen le plus paisible au monde. Le matcha ici est une révélation. J'ai pris quelques vidéos de la bambouseraie d'Arashiyama pour vous partager cette ambiance unique.",
        recipientName: "Tom",
        senderName: "Jen",
        stampStyle: 'airmail',
        date: '05 Nov 2024',
        isPremium: true,
        coords: { lat: 35.0116, lng: 135.7681 },
        mediaItems: [
          { id: 'k1', type: 'image', url: 'https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=800&q=80' },
          { id: 'k2', type: 'video', url: 'https://assets.mixkit.co/videos/preview/mixkit-small-waterfall-in-a-japanese-garden-4268-large.mp4' },
          { id: 'k3', type: 'image', url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80' }
        ]
      },
      {
        id: 'demo-3',
        frontImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        location: 'Côte Amalfitaine, Italie',
        message: "Ciao ! La dolce vita pure. Les citrons sont aussi gros que des ballons, la mer est d'un bleu électrique, et je crois que j'ai mangé mon poids en pâtes aux vongole.",
        recipientName: "Sophie",
        senderName: "Marc",
        stampStyle: 'classic',
        date: '14 Juil 2024',
        isPremium: false,
        coords: { lat: 40.6333, lng: 14.6002 }
      },
      {
        id: 'demo-4',
        frontImage: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        location: 'Îles Phi Phi, Thaïlande',
        message: "Le paradis sur terre. L'eau est si chaude et transparente. On a exploré des lagons secrets ce matin. C'est magique !",
        recipientName: "La bande",
        senderName: "Elena",
        stampStyle: 'modern',
        date: '02 Dec 2024',
        isPremium: true,
        coords: { lat: 7.7407, lng: 98.7784 },
        mediaItems: [
          { id: 'p1', type: 'image', url: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80' },
          { id: 'p2', type: 'video', url: 'https://assets.mixkit.co/videos/preview/mixkit-tropical-beach-with-palm-trees-from-above-4122-large.mp4' }
        ]
      }
    ])
  }, [])

  const demoCard: Postcard = {
    id: 'demo-rv',
    frontImage: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    location: 'Bali, Indonésie',
    message: "Un petit coucou de Bali ! Les rizières sont magnifiques et les gens adorables. On a loué un scooter pour explorer l'île. Bises à tous !",
    recipientName: "Famille Martin",
    senderName: "Julie & Thomas",
    stampStyle: 'classic',
    date: '12 Aout 2024',
    isPremium: false,
    coords: { lat: -8.4095, lng: 115.1889 }
  }

  return (
    <>
      <div className="relative bg-teal-900 min-h-[560px] lg:min-h-[520px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            className="w-full h-full object-cover opacity-50 mix-blend-normal"
            alt="Ocean background"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-teal-900/90 via-teal-900/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-teal-950/80" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12 lg:gap-8">
            {/* Contenu à gauche */}
            <div className="max-w-2xl text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-5 leading-tight drop-shadow-lg">
                Envoyez un coin de <br />
                <span className="inline-block relative">
                  <WordRotate
                    words={['paradis.', 'montagne.', 'mer.', 'campagne.', 'ville.']}
                    className="text-orange-200"
                  />
                </span>
              </h1>
              <p className="text-teal-50 text-lg md:text-xl leading-relaxed max-w-lg mx-auto lg:mx-0 drop-shadow-md">
                Le charme d&apos;une carte manuscrite, livrée instantanément. Capturez vos souvenirs de voyage et partagez-les avec style.
              </p>
            </div>

            {/* Boutons à droite */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-4 lg:min-w-[280px] lg:shrink-0 justify-center items-center lg:items-end">
              <Link href="/editor" className="w-full sm:w-auto lg:w-full">
                <Button
                  className="w-full bg-orange-500 text-white px-8 py-7 rounded-2xl font-bold text-lg hover:bg-orange-600 transition-all shadow-xl shadow-orange-900/30 inline-flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] h-auto border-0"
                >
                  Commencer <Plus size={22} strokeWidth={2.5} />
                </Button>
              </Link>
              <Link href="/showcase" className="w-full sm:w-auto lg:w-full">
                <Button
                  variant="ghost"
                  className="w-full bg-white/10 backdrop-blur-sm text-white border-2 border-white/25 px-8 py-7 rounded-2xl font-bold text-lg hover:bg-white/20 hover:border-white/40 transition-all inline-flex items-center justify-center gap-2 h-auto"
                >
                  Comment ça marche <Compass size={22} strokeWidth={2.5} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Section Recto/Verso */}
      <section className="py-16 bg-[#fdfbf7] border-b border-stone-200 overflow-hidden relative">
         {/* Décoration d'arrière-plan */}
         <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-teal-100/30 rounded-full blur-3xl" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-orange-100/30 rounded-full blur-3xl" />
         </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 border border-teal-100 rounded-full text-teal-700 text-xs font-bold uppercase tracking-widest mb-4">
                <Repeat size={12} />
                <span>Double Face</span>
             </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-800 mb-4">
              Recto / Verso : La qualité avant tout
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
                    className="shadow-[0_20px_50px_rgba(0,0,0,0.15)] group-hover:shadow-[0_30px_60px_rgba(0,0,0,0.2)]" 
                  />
               </div>
            </div>
            
            <div className="mt-12 flex flex-col items-center gap-8 max-w-xl text-center">
               <div className="h-px w-24 bg-stone-200" />
               <p className="text-stone-500 italic">
                 "Une expérience immersive : touchez la carte pour découvrir son verso et les détails de votre message."
               </p>
               <Link href="/editor">
                  <Button className="bg-orange-500 text-white hover:bg-orange-600 rounded-full font-bold shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 flex items-center gap-3 px-10 py-7 text-lg transform hover:-translate-y-1 transition-all duration-300 h-auto">
                    <Plus size={24} /> Créer ma carte maintenant
                  </Button>
               </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Arguments : carte virtuelle, innovant, pratique, pas cher, social, partage */}
      <section className="relative bg-gradient-to-b from-stone-50/80 to-[#fdfbf7] border-b border-stone-100 overflow-hidden">
        {/* Fond décoratif */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-0 w-[500px] h-[400px] bg-teal-200/30 rounded-full blur-3xl -translate-x-1/2" />
          <div className="absolute bottom-20 right-0 w-[400px] h-[350px] bg-orange-200/25 rounded-full blur-3xl translate-x-1/3" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-100/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center mb-14 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-stone-800 mb-3">
              La carte postale réinventée
            </h2>
            <p className="text-stone-500 text-lg md:text-xl max-w-2xl mx-auto">
              Moderne, simple, et faite pour partager.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            <div className="group flex flex-col p-8 md:p-10 rounded-3xl bg-white/90 backdrop-blur border border-stone-100 shadow-lg shadow-stone-200/50 hover:shadow-xl hover:shadow-teal-200/30 hover:border-teal-200/60 transition-all duration-300 hover:-translate-y-1">
              <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Mail className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-3 font-serif">Carte postale virtuelle</h3>
              <p className="text-stone-600 text-base leading-relaxed">Créez une vraie carte en quelques clics depuis votre téléphone ou ordinateur. Plus besoin de chercher timbre ni boîte aux lettres.</p>
            </div>

            <div className="group flex flex-col p-8 md:p-10 rounded-3xl bg-white/90 backdrop-blur border border-stone-100 shadow-lg shadow-stone-200/50 hover:shadow-xl hover:shadow-orange-200/30 hover:border-orange-200/60 transition-all duration-300 hover:-translate-y-1">
              <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-3 font-serif">Nouveau & innovant</h3>
              <p className="text-stone-600 text-base leading-relaxed">Une façon moderne de garder le charme du papier : message personnel, photos, vidéos et même localisation sur la carte.</p>
            </div>

            <div className="group flex flex-col p-8 md:p-10 rounded-3xl bg-white/90 backdrop-blur border border-stone-100 shadow-lg shadow-stone-200/50 hover:shadow-xl hover:shadow-teal-200/30 hover:border-teal-200/60 transition-all duration-300 hover:-translate-y-1">
              <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-3 font-serif">Pratique</h3>
              <p className="text-stone-600 text-base leading-relaxed">Envoyez depuis n&apos;importe où, à n&apos;importe quel moment. Idéal en voyage : une connexion suffit pour faire plaisir.</p>
            </div>

            <div className="group flex flex-col p-8 md:p-10 rounded-3xl bg-white/90 backdrop-blur border border-stone-100 shadow-lg shadow-stone-200/50 hover:shadow-xl hover:shadow-orange-200/30 hover:border-orange-200/60 transition-all duration-300 hover:-translate-y-1">
              <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Wallet className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-3 font-serif">Pas cher</h3>
              <p className="text-stone-600 text-base leading-relaxed">Moins coûteux qu&apos;une carte classique + timbre + envoi. Tarifs clairs, sans mauvaise surprise.</p>
            </div>

            <div className="group flex flex-col p-8 md:p-10 rounded-3xl bg-white/90 backdrop-blur border border-stone-100 shadow-lg shadow-stone-200/50 hover:shadow-xl hover:shadow-teal-200/30 hover:border-teal-200/60 transition-all duration-300 hover:-translate-y-1">
              <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Share2 className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-3 font-serif">100 % social</h3>
              <p className="text-stone-600 text-base leading-relaxed">Partagez avec vos proches, gardez le lien. Reliez la carte à vos réseaux ou envoyez un lien pour la consulter en ligne.</p>
            </div>

            <div className="group flex flex-col p-8 md:p-10 rounded-3xl bg-white/90 backdrop-blur border border-stone-100 shadow-lg shadow-stone-200/50 hover:shadow-xl hover:shadow-orange-200/30 hover:border-orange-200/60 transition-all duration-300 hover:-translate-y-1">
              <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Image className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-3 font-serif">Vos photos, votre carte</h3>
              <p className="text-stone-600 text-base leading-relaxed">Mettez vos plus belles photos sur la carte, ajoutez un message à la main (style manuscrit) et envoyez. Simple et personnel.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-[#fdfbf7]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between mb-16 text-center sm:text-left gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-stone-800 font-serif">Inspirations Voyage</h2>
            <p className="text-stone-500 mt-2">Découvrez les fonctionnalités Premium (Album & Vidéo) à travers ces exemples.</p>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-stone-200 shadow-sm text-xs font-bold text-teal-600 uppercase tracking-widest">
              <Compass size={14} className="animate-spin-slow" /> Galerie Mondiale
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-x-12 gap-y-24">
          {savedPostcards.map((card) => (
            <div key={card.id} className="flex flex-col items-center group">
              <PostcardView postcard={card} />
              <div className="w-[340px] sm:w-[600px] mt-6 flex justify-between items-center px-4 py-3 bg-white border border-stone-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative">
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1.5 text-stone-400 hover:text-red-500 transition-colors group/btn">
                    <Heart size={18} className="group-hover/btn:fill-red-500 transition-colors" />
                    <span className="text-[10px] font-bold">{Math.floor(Math.random() * 50) + 10}</span>
                  </button>
                  <span className="text-stone-200">|</span>

                  <Link
                    href="/business"
                    className="flex items-center gap-1.5 text-teal-600 hover:text-teal-700 transition-colors text-[10px] font-bold uppercase tracking-wider group/agence"
                  >
                    <Library size={14} className="group-hover/agence:rotate-12 transition-transform" />
                    <span>Photothèque Agence</span>
                    <ExternalLink size={10} className="opacity-40" />
                  </Link>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2.5">
                    <div className="w-7 h-7 rounded-full bg-teal-100 border-2 border-white flex items-center justify-center text-[8px] text-teal-700 font-bold shadow-sm">JD</div>
                    <div className="w-7 h-7 rounded-full bg-orange-100 border-2 border-white flex items-center justify-center text-[8px] text-orange-700 font-bold shadow-sm">AM</div>
                    <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] text-slate-700 font-bold shadow-sm">+8</div>
                  </div>
                  <div className="flex gap-2 border-l border-stone-100 pl-4">
                    <button className="text-stone-300 hover:text-teal-600 transition-colors">
                      <Instagram size={18} />
                    </button>
                    <button className="text-stone-300 hover:text-teal-600 transition-colors">
                      <Mail size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
