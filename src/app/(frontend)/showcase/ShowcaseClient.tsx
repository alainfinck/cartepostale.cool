'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Plus,
  Camera,
  PenTool,
  Share2,
  Palette,
  MessageCircle,
  BarChart3,
  Globe,
  Heart,
  Sparkles,
  ArrowRight,
  Play,
  Star,
  Send,
  Mail,
  Smartphone,
  Eye,
  Users,
  Compass,
  ChevronRight,
  Quote,
} from 'lucide-react'
import { Postcard } from '@/types'
import PostcardView from '@/components/postcard/PostcardView'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const SHOWCASE_POSTCARDS: Postcard[] = [
  {
    id: 'show-1',
    frontImage:
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    location: 'Grand Canyon, USA',
    message:
      "L'immensité de ce lieu est impossible à décrire. Les couleurs au coucher du soleil sont irréelles. Un souvenir gravé à jamais !",
    recipientName: 'Papa & Maman',
    senderName: 'Sarah',
    stampStyle: 'classic',
    date: '12 Oct 2024',
    isPremium: true,
    coords: { lat: 36.0544, lng: -112.1401 },
    mediaItems: [
      {
        id: 'm1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'm2',
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-grand-canyon-scenery-view-4844-large.mp4',
      },
      {
        id: 'm3',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1527333656061-ca7adf608ae1?auto=format&fit=crop&w=800&q=80',
      },
    ],
  },
  {
    id: 'show-2',
    frontImage:
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    location: 'Kyoto, Japon',
    message:
      "J'ai trouvé le jardin zen le plus paisible au monde. Le matcha ici est une révélation. La bambouseraie d'Arashiyama est magique.",
    recipientName: 'Tom',
    senderName: 'Jen',
    stampStyle: 'airmail',
    date: '05 Nov 2024',
    isPremium: true,
    coords: { lat: 35.0116, lng: 135.7681 },
    mediaItems: [
      {
        id: 'k1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'k2',
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-small-waterfall-in-a-japanese-garden-4268-large.mp4',
      },
    ],
  },
  {
    id: 'show-3',
    frontImage:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    location: 'Côte Amalfitaine, Italie',
    message:
      "Ciao ! La dolce vita pure. Les citrons sont aussi gros que des ballons, la mer est d'un bleu électrique.",
    recipientName: 'Sophie',
    senderName: 'Marc',
    stampStyle: 'classic',
    date: '14 Juil 2024',
    isPremium: false,
    coords: { lat: 40.6333, lng: 14.6002 },
  },
  {
    id: 'show-4',
    frontImage:
      'https://images.unsplash.com/photo-1506929562872-bb421503ef21?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    location: 'Îles Phi Phi, Thaïlande',
    message:
      "Le paradis sur terre. L'eau est si chaude et transparente. On a exploré des lagons secrets ce matin !",
    recipientName: 'La bande',
    senderName: 'Elena',
    stampStyle: 'modern',
    date: '02 Dec 2024',
    isPremium: true,
    coords: { lat: 7.7407, lng: 98.7784 },
    mediaItems: [
      {
        id: 'p1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'p2',
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-tropical-beach-with-palm-trees-from-above-4122-large.mp4',
      },
    ],
  },
  {
    id: 'show-5',
    frontImage:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    location: 'Paris, France',
    message:
      "La ville lumière porte bien son nom. Un croissant au beurre, un café crème et la Tour Eiffel qui scintille... Le bonheur à la française.",
    recipientName: 'Mamie',
    senderName: 'Léa',
    stampStyle: 'classic',
    date: '20 Sep 2024',
    isPremium: false,
    coords: { lat: 48.8566, lng: 2.3522 },
  },
  {
    id: 'show-6',
    frontImage:
      'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    location: 'Tromsø, Norvège',
    message:
      "Les aurores boréales dansent au-dessus de nos têtes chaque soir. C'est le spectacle le plus incroyable que j'aie jamais vu.",
    recipientName: 'Julien & Marie',
    senderName: 'Alex',
    stampStyle: 'airmail',
    date: '18 Jan 2025',
    isPremium: true,
    coords: { lat: 69.6496, lng: 18.956 },
    mediaItems: [
      {
        id: 'n1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'n2',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=800&q=80',
      },
    ],
  },
]

const STEPS = [
  {
    icon: Camera,
    title: 'Choisissez votre photo',
    description:
      'Importez vos plus beaux clichés de vacances ou choisissez parmi nos modèles soigneusement sélectionnés.',
    color: 'bg-teal-500',
  },
  {
    icon: PenTool,
    title: 'Écrivez votre message',
    description:
      "Rédigez un message personnel avec notre écriture manuscrite. C'est le coeur de votre carte postale.",
    color: 'bg-orange-500',
  },
  {
    icon: Share2,
    title: 'Partagez instantanément',
    description:
      'Envoyez votre carte par lien unique via email, SMS ou réseaux sociaux. Livraison instantanée !',
    color: 'bg-teal-600',
  },
]

const FEATURES = [
  {
    icon: Palette,
    title: 'Totalement personnalisable',
    description:
      'Choisissez votre modèle, ajoutez vos plus belles photos de vacances, rédigez votre texte et signez. Chaque carte est unique.',
  },
  {
    icon: MessageCircle,
    title: 'Interaction facile',
    description:
      'Vos proches peuvent laisser des commentaires directement sur la carte postale virtuelle et échanger des souvenirs ensemble.',
  },
  {
    icon: BarChart3,
    title: "Suivez l'engagement",
    description:
      'Consultez les statistiques de visite pour savoir qui a ouvert votre carte et quand. Restez connecté.',
  },
  {
    icon: Globe,
    title: 'Carte interactive',
    description:
      'Votre carte affiche une mini-carte du lieu avec les coordonnées GPS. Vos proches voyagent avec vous.',
  },
  {
    icon: Camera,
    title: 'Album photo & vidéo',
    description:
      "Ajoutez un album multimédia Premium avec photos et vidéos. Bien plus qu'une simple carte postale.",
  },
  {
    icon: Smartphone,
    title: 'Mobile first',
    description:
      'Créez et consultez vos cartes depuis votre smartphone. Optimisé pour tous les écrans.',
  },
]

const TESTIMONIALS = [
  {
    name: 'Claire D.',
    location: 'Lyon',
    text: "J'ai envoyé une carte depuis Bali à mes parents. Ma mère m'a rappelée en pleurant de joie. C'est tellement plus personnel qu'un post Instagram !",
    avatar: 'CD',
    color: 'bg-teal-100 text-teal-700',
  },
  {
    name: 'Thomas R.',
    location: 'Bordeaux',
    text: "L'album photo intégré est génial. Mes amis ont pu revivre notre road trip en Islande comme s'ils y étaient. Bravo !",
    avatar: 'TR',
    color: 'bg-orange-100 text-orange-700',
  },
  {
    name: 'Amina K.',
    location: 'Marseille',
    text: "Simple, beau et gratuit. J'en ai envoyé une dizaine depuis mon séjour au Maroc. Toute la famille était ravie.",
    avatar: 'AK',
    color: 'bg-sky-100 text-sky-700',
  },
]

const STATS = [
  { value: '50 000+', label: 'Cartes envoyées' },
  { value: '120+', label: 'Pays couverts' },
  { value: '4.9/5', label: 'Note moyenne' },
  { value: '100%', label: 'Gratuit' },
]

export default function ShowcasePage() {
  const [postcards, setPostcards] = useState<Postcard[]>([])
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'premium' | 'classic'>('all')

  useEffect(() => {
    setPostcards(SHOWCASE_POSTCARDS)
  }, [])

  const filteredPostcards =
    selectedFilter === 'all'
      ? postcards
      : selectedFilter === 'premium'
        ? postcards.filter((p) => p.isPremium)
        : postcards.filter((p) => !p.isPremium)

  return (
    <>
      {/* Hero */}
      <div className="relative bg-stone-900 h-[420px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            className="w-full h-full object-cover opacity-30"
            alt="Travel background"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-teal-900/90 via-stone-900/80 to-orange-900/50" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-orange-200 text-sm font-semibold mb-6 border border-white/10">
            <Compass size={16} className="text-orange-400" /> Découvrir CartePostale.cool
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight">
            Facile, rapide, gratuit,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-amber-200">
              social.
            </span>
          </h1>
          <p className="text-stone-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Transformez vos plus belles photos de vacances en cartes postales virtuelles
            personnalisées. Plus personnel qu'un post, plus rapide qu'un courrier.
          </p>
        </div>
      </div>

      {/* How it works */}
      <section className="bg-white py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-xs font-bold text-teal-600 uppercase tracking-widest mb-4">
              <Sparkles size={14} /> Comment ça marche
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-800">
              Créez votre carte en 3 étapes
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className="text-center group">
                  <div className="relative inline-flex mb-6">
                    <div
                      className={cn(
                        'w-20 h-20 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:-translate-y-1 group-hover:shadow-xl',
                        step.color
                      )}
                    >
                      <Icon size={32} />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white border-2 border-stone-200 flex items-center justify-center text-sm font-bold text-stone-500 shadow-sm">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-stone-800 mb-3">{step.title}</h3>
                  <p className="text-stone-500 leading-relaxed max-w-xs mx-auto">
                    {step.description}
                  </p>
                </div>
              )
            })}
          </div>

          <div className="text-center mt-14">
            <Link href="/editor">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold text-lg px-8 py-6 h-auto shadow-lg shadow-orange-200 inline-flex items-center gap-3 transition-all hover:-translate-y-0.5">
                Créer ma carte postale <ArrowRight size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-[#fdfbf7] py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-xs font-bold text-orange-500 uppercase tracking-widest mb-4">
              <Star size={14} /> Fonctionnalités
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-800">
              Bien plus qu'une carte postale
            </h2>
            <p className="text-stone-500 mt-4 max-w-xl mx-auto">
              Chaque fonctionnalité a été pensée pour rendre vos souvenirs de voyage inoubliables.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm hover:shadow-md hover:border-stone-200 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mb-4 group-hover:bg-teal-100 transition-colors">
                    <Icon size={22} className="text-teal-600" />
                  </div>
                  <h3 className="text-lg font-bold text-stone-800 mb-2">{feature.title}</h3>
                  <p className="text-stone-500 text-sm leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats banner */}
      <section className="bg-teal-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-teal-100 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="bg-[#fdfbf7] py-20 sm:py-28">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between mb-12 text-center sm:text-left gap-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-bold text-teal-600 uppercase tracking-widest mb-2">
                <Globe size={14} /> Galerie mondiale
              </span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-800">
                Inspirations Voyage
              </h2>
              <p className="text-stone-500 mt-2">
                Découvrez de vraies cartes envoyées par notre communauté.
              </p>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              {(
                [
                  { key: 'all', label: 'Toutes' },
                  { key: 'premium', label: 'Premium' },
                  { key: 'classic', label: 'Classique' },
                ] as const
              ).map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setSelectedFilter(filter.key)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-bold transition-all',
                    selectedFilter === filter.key
                      ? 'bg-teal-500 text-white shadow-sm'
                      : 'bg-white text-stone-500 border border-stone-200 hover:border-stone-300'
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-x-12 gap-y-24">
            {filteredPostcards.map((card) => (
              <div key={card.id} className="flex flex-col items-center">
                <PostcardView postcard={card} />
                <div className="w-[340px] sm:w-[600px] mt-6 flex justify-between items-center px-4 py-3 bg-white border border-stone-100 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-3">
                    <Heart
                      size={16}
                      className="text-stone-300 hover:text-red-500 cursor-pointer transition-colors"
                    />
                    <span className="text-stone-400 text-xs">|</span>
                    <span className="text-xs font-semibold text-stone-500">
                      {card.location}
                    </span>
                    {card.isPremium && (
                      <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Premium
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-stone-400 font-medium">
                    par <span className="text-stone-600 font-semibold">{card.senderName}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-xs font-bold text-teal-600 uppercase tracking-widest mb-4">
              <Heart size={14} /> Témoignages
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-800">
              Ils ont envoyé des sourires
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <div
                key={index}
                className="bg-[#fdfbf7] rounded-2xl p-8 border border-stone-100 relative"
              >
                <Quote size={32} className="text-stone-200 mb-4" />
                <p className="text-stone-600 leading-relaxed mb-6 italic">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold',
                      testimonial.color
                    )}
                  >
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-stone-800 text-sm">{testimonial.name}</p>
                    <p className="text-stone-400 text-xs">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative bg-teal-900 py-20 sm:py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            className="w-full h-full object-cover opacity-20 mix-blend-overlay"
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-br from-teal-900/95 via-teal-800/90 to-orange-900/60" />
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight">
            Prêt à envoyer un coin de{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-amber-200">
              paradis ?
            </span>
          </h2>
          <p className="text-teal-100 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Créez votre première carte postale en moins de 2 minutes. C'est gratuit, c'est beau,
            et ça fait plaisir.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/editor">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold text-lg px-8 py-6 h-auto shadow-lg shadow-orange-900/30 inline-flex items-center gap-3 transition-all hover:-translate-y-0.5">
                Créer ma carte postale <Plus size={20} />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                variant="ghost"
                className="bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-full font-bold text-lg px-8 py-6 h-auto hover:bg-white/20 inline-flex items-center gap-3 transition-all"
              >
                Voir les tarifs <ChevronRight size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
