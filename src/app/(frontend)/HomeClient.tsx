'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Postcard } from '@/types'
import { Plus, Compass, ExternalLink, Heart, Library, Instagram, Mail, Sun } from 'lucide-react'
import PostcardView from '@/components/postcard/PostcardView'
import { Button } from '@/components/ui/button'

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

  return (
    <>
      <div className="relative bg-teal-900 h-[500px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
            alt="Ocean background"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-teal-900/90 via-teal-800/80 to-orange-500/40"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center sm:text-left">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-orange-200 text-sm font-semibold mb-6 border border-white/10">
              <Sun size={16} className="text-orange-400" /> Édition Été 2024
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight drop-shadow-lg">
              Envoyez un coin de <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-200 to-amber-200">paradis.</span>
            </h1>
            <p className="text-teal-50 text-xl mb-10 leading-relaxed max-w-lg">
              Le charme d'une carte manuscrite, livrée instantanément. Capturez vos souvenirs de voyage et partagez-les avec style.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/editor">
                <Button
                  className="bg-orange-500 text-white px-8 py-8 rounded-full font-bold text-lg hover:bg-orange-600 transition-all shadow-lg shadow-orange-900/20 inline-flex items-center justify-center gap-2 hover:transform hover:-translate-y-1 h-auto"
                >
                  Commencer <Plus size={20} />
                </Button>
              </Link>
              <Link href="/showcase">
                <Button
                  variant="ghost"
                  className="bg-white/10 backdrop-blur-sm text-white border border-white/20 px-8 py-8 rounded-full font-bold text-lg hover:bg-white/20 transition-all inline-flex items-center justify-center gap-2 h-auto"
                >
                  Comment ça marche <Compass size={20} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

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

              <div className="w-[340px] sm:w-[600px] mt-6 flex justify-between items-center px-4 py-2 bg-white border border-stone-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
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
