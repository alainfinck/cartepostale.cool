'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  Building2,
  ImageIcon,
  ArrowRight,
  Sparkles,
  Check,
  Globe,
  Star,
  Phone,
  Mail,
  ExternalLink,
  ChevronRight,
  Palette,
  BarChart3,
  QrCode,
  PlayCircle,
  X,
  Send,
  Heart,
  Eye,
  PenLine,
  Stamp,
  Map,
  Camera,
  Layers,
} from 'lucide-react'
import { getOptimizedImageUrl } from '@/lib/image-processing'
import { Button } from '@/components/ui/button'

// ──────────────────────────────────────────────────────────
//  DONNÉES DE DÉMO – Agence "Voyages Lumière"
// ──────────────────────────────────────────────────────────

const AGENCY = {
  name: 'Voyages Lumière',
  tagline: "Évasions d'exception depuis 1998",
  logo: '🧭',
  primaryColor: '#0d9488',
  accentColor: '#f59e0b',
  city: 'Paris, France',
  phone: '+33 1 23 45 67 89',
  email: 'contact@voyages-lumiere.fr',
  website: 'voyages-lumiere.fr',
  description:
    'Agence de voyage haut de gamme spécialisée dans les évasions méditerranéen, tropicales et culturelles. Nos clients reviennent avec des souvenirs inoubliables – et maintenant, avec des cartes postales à leur image.',
}

const GALLERY_CATEGORIES = [
  { id: 'all', name: 'Toutes' },
  { id: 'mer-plages', name: 'Mer & Plages' },
  { id: 'villes-art', name: "Villes d'Art" },
  { id: 'mediterranee', name: 'Méditerranée' },
  { id: 'hotels-resorts', name: 'Hôtels & Resorts' },
]

const GALLERY_IMAGES = [
  {
    id: 1,
    url: 'https://img.cartepostale.cool/demo/photo-1507525428034-b723cf961d3e.jpg',
    title: 'Maldives – Plage paradisiaque',
    caption: 'Les eaux cristallines des Maldives',
    category: 'mer-plages',
    tags: ['tropical', 'luxe'],
    usages: 34,
    views: 142,
  },
  {
    id: 2,
    url: 'https://img.cartepostale.cool/demo/photo-1519046904884-53103b34b206.jpg',
    title: 'Fuerteventura – Plage sauvage',
    caption: "Les plages des Canaries baignées par l'Atlantique",
    category: 'mer-plages',
    tags: ['europe', 'famille'],
    usages: 21,
    views: 98,
  },
  {
    id: 3,
    url: 'https://img.cartepostale.cool/demo/photo-1499856374031-44e31b8f5d63.jpg',
    title: 'Paris – La Ville Lumière',
    caption: 'Paris, capitale du romantisme',
    category: 'villes-art',
    tags: ['europe', 'culture'],
    usages: 56,
    views: 203,
  },
  {
    id: 4,
    url: 'https://img.cartepostale.cool/demo/photo-1467269204594-9661b134dd2b.jpg',
    title: 'Prague – Ville aux Cent Clochers',
    caption: 'La magie médiévale de Prague',
    category: 'villes-art',
    tags: ['europe', 'culture'],
    usages: 18,
    views: 87,
  },
  {
    id: 5,
    url: 'https://img.cartepostale.cool/demo/photo-1570077188670-e3a8d69ac5ff.jpg',
    title: 'Santorin – Coucher de soleil',
    caption: 'Les maisons blanches et dômes bleus iconiques',
    category: 'mediterranee',
    tags: ['europe', 'luxe'],
    usages: 48,
    views: 178,
  },
  {
    id: 6,
    url: 'https://img.cartepostale.cool/demo/photo-1526392060635-9d6019884377.jpg',
    title: 'Marrakech – La Ville Ocre',
    caption: 'Les souks colorés et la magie orientale',
    category: 'villes-art',
    tags: ['culture', 'famille'],
    usages: 29,
    views: 112,
  },
  {
    id: 7,
    url: 'https://img.cartepostale.cool/demo/photo-1582719478250-c89cae4dc85b.jpg',
    title: 'Bora Bora – Overwater Bungalow',
    caption: 'Séjour en bungalow sur pilotis',
    category: 'hotels-resorts',
    tags: ['luxe', 'tropical'],
    usages: 25,
    views: 134,
  },
  {
    id: 8,
    url: 'https://img.cartepostale.cool/demo/photo-1551882547-ff40c63fe2fa.jpg',
    title: 'Resort – Piscine à débordement',
    caption: "Vue sur l'océan depuis le resort",
    category: 'hotels-resorts',
    tags: ['luxe', 'tropical'],
    usages: 19,
    views: 96,
  },
  {
    id: 9,
    url: 'https://img.cartepostale.cool/demo/photo-1488646953014-85cb44e25828.jpg',
    title: 'Voyage en avion – Grand départ',
    caption: 'Chaque aventure commence ici',
    category: 'mer-plages',
    tags: ['famille', 'culture'],
    usages: 41,
    views: 159,
  },
]

const DEMO_POSTCARDS = [
  {
    image: 'https://img.cartepostale.cool/demo/photo-1507525428034-b723cf961d3e.jpg',
    from: 'Sophie & Pierre',
    location: 'Maldives, Atoll de Malé Nord',
    message:
      "Un paradis sur Terre. Les couleurs de l'eau sont incroyables. Merci Voyages Lumière pour ce voyage inoubliable ! 🌊",
    recipient: 'Famille Martin',
    date: '15 jan. 2026',
  },
  {
    image: 'https://img.cartepostale.cool/demo/photo-1570077188670-e3a8d69ac5ff.jpg',
    from: 'Élodie B.',
    location: 'Santorin, Grèce',
    message: "Oia au coucher de soleil... un rêve devenu réalité. Vivement l'année prochaine ici !",
    recipient: 'Maman & Papa',
    date: '3 fév. 2026',
  },
  {
    image: 'https://img.cartepostale.cool/demo/photo-1499856374031-44e31b8f5d63.jpg',
    from: 'Antoine R.',
    location: 'Paris, France',
    message: "Week-end parfait à Paris. La tour Eiffel à l'aube, on en rêvait depuis si longtemps.",
    recipient: 'Chérie 💕',
    date: '10 fév. 2026',
  },
]

const FEATURES_AGENCY = [
  {
    icon: Palette,
    title: 'Logo sur chaque carte',
    desc: 'Le logo Voyages Lumière apparaît sur toutes les cartes créées par vos clients. Une visibilité continue et naturelle.',
    color: 'from-teal-500 to-cyan-500',
  },
  {
    icon: ImageIcon,
    title: 'Galerie de destinations',
    desc: 'Vos clients choisissent parmi vos photos de destinations. Chaque carte renforce votre image de marque.',
    color: 'from-orange-500 to-amber-500',
  },
  {
    icon: BarChart3,
    title: 'Statistiques en temps réel',
    desc: 'Suivez combien de cartes ont été envoyées, vues et partagées par vos clients.',
    color: 'from-purple-500 to-violet-500',
  },
  {
    icon: QrCode,
    title: 'QR code personnalisé',
    desc: 'Un QR code avec votre URL agence pour que les voyageurs accèdent directement à votre galerie.',
    color: 'from-rose-500 to-pink-500',
  },
]

// ──────────────────────────────────────────────────────────

export default function AgenceDemoClient() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedImage, setSelectedImage] = useState<(typeof GALLERY_IMAGES)[0] | null>(null)
  const [activePostcard, setActivePostcard] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  const filteredImages =
    activeCategory === 'all'
      ? GALLERY_IMAGES
      : GALLERY_IMAGES.filter((img) => img.category === activeCategory)

  return (
    <div className="min-h-screen bg-[#fdfbf7] font-sans">
      {/* ── HERO AGENCY BANNER ─────────────────────────────── */}
      <section
        className="relative min-h-[88vh] flex items-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' }}
      >
        {/* Background parallax image */}
        <div className="absolute inset-0">
          <img
            src={getOptimizedImageUrl(
              'https://img.cartepostale.cool/demo/photo-1488646953014-85cb44e25828.jpg',
              { width: 1920 },
            )}
            alt="Voyage"
            className="w-full h-full object-cover opacity-20 scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f2027]/60 via-[#203a43]/70 to-[#0f2027]/90" />
        </div>

        {/* Agency badge */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-black/30 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                style={{ background: AGENCY.primaryColor }}
              >
                🧭
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-none">{AGENCY.name}</p>
                <p className="text-white/60 text-xs">{AGENCY.tagline}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:flex items-center gap-1.5 bg-teal-500/20 text-teal-300 px-3 py-1 rounded-full text-xs font-semibold border border-teal-500/30">
                <Sparkles size={12} /> Page de démonstration agence
              </span>
              <Link href="/contact">
                <Button
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600 text-white border-0 text-xs"
                >
                  Créer votre espace agence
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Main hero content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pt-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[70vh]">
            {/* Left: Agency presentation */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 bg-amber-500/20 backdrop-blur-sm px-4 py-2 rounded-full text-amber-300 text-sm font-semibold mb-8 border border-amber-500/30">
                <Star size={14} className="fill-amber-400" /> EXEMPLE CONCRET – AGENCE DE VOYAGE
              </div>

              <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-4 leading-[1.05]">
                {AGENCY.name}
              </h1>
              <p className="text-amber-200/80 text-xl mb-6 font-light italic">{AGENCY.tagline}</p>
              <p className="text-white/70 text-lg leading-relaxed mb-10 max-w-lg">
                {AGENCY.description}
              </p>

              {/* Agency contact info */}
              <div className="flex flex-wrap gap-4 mb-10 text-sm text-white/60">
                <span className="flex items-center gap-2">
                  <MapPin size={14} className="text-teal-400" /> {AGENCY.city}
                </span>
                <span className="flex items-center gap-2">
                  <Globe size={14} className="text-teal-400" /> {AGENCY.website}
                </span>
                <span className="flex items-center gap-2">
                  <Phone size={14} className="text-teal-400" /> {AGENCY.phone}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 to-teal-500 text-white px-8 py-6 rounded-2xl text-base font-bold shadow-xl border-0"
                  onClick={() =>
                    document.getElementById('galerie-demo')?.scrollIntoView({ behavior: 'smooth' })
                  }
                >
                  <Camera size={18} className="mr-2" />
                  Voir la galerie de destinations
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-8 py-6 rounded-2xl text-base font-bold"
                >
                  <Link href="/agences">
                    <Building2 size={18} className="mr-2" />
                    Créer votre agence
                  </Link>
                </Button>
              </div>
            </motion.div>

            {/* Right: Live Postcard Preview */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:flex justify-center"
            >
              <PostcardCarousel
                postcards={DEMO_POSTCARDS}
                active={activePostcard}
                isFlipped={isFlipped}
                onSelect={setActivePostcard}
                onFlip={() => setIsFlipped(!isFlipped)}
              />
            </motion.div>
          </div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-3 gap-4 py-8 border-t border-white/10 mt-8"
          >
            {[
              { value: '847', label: 'Cartes envoyées', icon: Send },
              { value: '11', label: 'Photos en galerie', icon: ImageIcon },
              { value: '4 cats.', label: 'Destinations', icon: MapPin },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <stat.icon size={20} className="text-teal-400 mx-auto mb-2 opacity-80" />
                <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-white/50 text-xs font-medium uppercase tracking-wider mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CONCEPT SECTION: COMMENT ÇA MARCHE ─────────────── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-600 px-4 py-2 rounded-full text-sm font-black uppercase tracking-widest mb-6">
              <Layers size={16} /> Comment ça marche
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-stone-900 mb-4">
              Vos clients créent des cartes postales
              <br className="hidden md:block" />
              <span className="text-teal-600"> à votre image</span>
            </h2>
            <p className="text-stone-600 text-lg max-w-2xl mx-auto">
              Voyages Lumière propose à ses voyageurs de créer des cartes postales avec les photos
              de leurs destinations. Chaque carte porte le logo de l'agence — une pub naturelle et
              émotionnelle.
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                icon: QrCode,
                title: 'Scanner le QR code',
                desc: "L'agence affiche un QR code dans son agence ou en brochure. Le client le scanne.",
                color: 'bg-teal-50 text-teal-600',
              },
              {
                step: '02',
                icon: Camera,
                title: 'Choisir une photo',
                desc: "Il accède à la galerie de destinations de l'agence et choisit sa photo préférée.",
                color: 'bg-orange-50 text-orange-600',
              },
              {
                step: '03',
                icon: PenLine,
                title: 'Écrire son message',
                desc: 'Il personnalise sa carte : message, lieu, photo GPS optionnelle, dédicace.',
                color: 'bg-purple-50 text-purple-600',
              },
              {
                step: '04',
                icon: Send,
                title: 'Envoyer & partager',
                desc: "La carte part avec le logo de l'agence. La famille reçoit un souvenir de voyage.",
                color: 'bg-rose-50 text-rose-600',
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 left-full w-full z-10">
                    <ChevronRight className="text-stone-300 w-6 h-6" />
                  </div>
                )}
                <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all group">
                  <div className="text-5xl font-black text-stone-200 group-hover:text-teal-200 transition-colors mb-4 leading-none">
                    {step.step}
                  </div>
                  <div
                    className={`w-12 h-12 rounded-xl ${step.color} flex items-center justify-center mb-4`}
                  >
                    <step.icon size={22} />
                  </div>
                  <h3 className="font-bold text-stone-900 mb-2">{step.title}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GALLERY DEMO ────────────────────────────────────── */}
      <section id="galerie-demo" className="py-24 px-4 bg-[#fdfbf7]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-2 rounded-full text-sm font-black uppercase tracking-widest mb-4">
                <ImageIcon size={16} /> Galerie de Voyages Lumière
              </div>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-stone-900">
                Les destinations de l'agence
              </h2>
              <p className="text-stone-600 mt-2">
                Ces photos sont proposées aux clients lors de la création de leur carte postale.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {GALLERY_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    activeCategory === cat.id
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Masonry-style gallery grid */}
          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {filteredImages.map((img, i) => (
                <motion.div
                  key={img.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className={`relative group cursor-pointer rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all ${
                    i === 0 || i === 4 ? 'md:col-span-2 md:row-span-2' : ''
                  }`}
                  style={{ aspectRatio: i === 0 || i === 4 ? '16/10' : '4/3' }}
                  onClick={() => setSelectedImage(img)}
                >
                  <img
                    src={getOptimizedImageUrl(img.url, { width: 600 })}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Agency logo watermark */}
                  <div
                    className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold shadow-md transition-opacity opacity-0 group-hover:opacity-100"
                    style={{ color: AGENCY.primaryColor }}
                  >
                    <span>🧭</span>
                    <span>{AGENCY.name}</span>
                  </div>

                  {/* Stats & title on hover */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="font-bold text-sm truncate">{img.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-white/80">
                      <span className="flex items-center gap-1">
                        <Heart size={11} fill="white" /> {img.usages} cartes
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye size={11} /> {img.views} vues
                      </span>
                    </div>
                  </div>

                  {/* Category tag */}
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/90 backdrop-blur text-stone-700 text-xs font-semibold px-2.5 py-1 rounded-full shadow">
                      {GALLERY_CATEGORIES.find((c) => c.id === img.category)?.name || img.category}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ── POSTCARD EXAMPLES ────────────────────────────────── */}
      <section className="py-24 px-4 bg-stone-900 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/10 text-amber-300 px-4 py-2 rounded-full text-sm font-black uppercase tracking-widest mb-6">
              <Stamp size={16} /> Cartes postales envoyées par vos clients
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">
              Voyez le résultat final
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Voici des exemples de cartes créées par les clients de Voyages Lumière. Chaque carte
              porte votre marque et renforce votre notoriété.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {DEMO_POSTCARDS.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`group cursor-pointer transition-all hover:-translate-y-2 ${
                  i === 1 ? 'md:mt-8' : ''
                }`}
                onClick={() => {
                  setActivePostcard(i)
                  setIsFlipped(false)
                }}
              >
                {/* Postcard front */}
                <div className="rounded-2xl overflow-hidden shadow-2xl bg-white">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={getOptimizedImageUrl(card.image, { width: 600 })}
                      alt={card.location}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Agency logo overlay */}
                    <div
                      className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shadow-lg"
                      style={{ background: AGENCY.primaryColor, color: 'white' }}
                    >
                      <span>🧭</span>
                      <span>{AGENCY.name}</span>
                    </div>
                    {/* Location stamp */}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 text-stone-700 shadow">
                      <MapPin size={11} className="text-teal-600" />
                      {card.location}
                    </div>
                  </div>
                  {/* Message area */}
                  <div className="p-4 bg-[#fdf8f0]" style={{ fontFamily: 'Georgia, serif' }}>
                    <p className="text-stone-700 text-sm leading-relaxed italic line-clamp-3">
                      "{card.message}"
                    </p>
                    <div className="flex justify-between items-center mt-3 text-xs text-stone-400">
                      <span className="font-semibold text-stone-600">— {card.from}</span>
                      <span>{card.date}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/editor">
              <Button className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white px-10 py-6 rounded-2xl text-lg font-bold border-0 shadow-xl">
                <PenLine size={20} className="mr-2" />
                Créer une carte maintenant
                <ArrowRight size={20} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── AGENCE FEATURES (marque blanche) ─────────────────── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-600 px-4 py-2 rounded-full text-sm font-black uppercase tracking-widest mb-6">
              <Sparkles size={16} /> Ce que Voyages Lumière obtient
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-stone-900 mb-4">
              Votre marque sur chaque carte
            </h2>
            <p className="text-stone-600 text-lg max-w-2xl mx-auto">
              En quelques heures, Voyages Lumière a configuré son espace agence, uploadé ses photos
              de destinations et commence à proposer les cartes à ses clients.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {FEATURES_AGENCY.map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="relative bg-gradient-to-br from-stone-50 to-white rounded-2xl p-6 border border-stone-100 hover:border-teal-200 hover:shadow-lg transition-all group"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center text-white mb-5 shadow-md`}
                >
                  <feat.icon size={22} />
                </div>
                <h3 className="font-bold text-stone-900 mb-2">{feat.title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Testimonial / Agency quote */}
          <div
            className="rounded-3xl p-8 md:p-12 text-white relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, #0d9488 0%, #0f766e 100%)` }}
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white/30" />
              <div className="absolute bottom-4 left-8 w-60 h-60 rounded-full bg-white/20" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl bg-white/20 backdrop-blur shrink-0 shadow-lg">
                🧭
              </div>
              <div className="flex-1">
                <p className="text-2xl font-serif italic text-white/90 mb-4 leading-relaxed">
                  "Nos clients repartent avec des cartes postales qui portent notre nom. C'est la
                  meilleure publicité qu'on ait jamais faite — et les clients adorent."
                </p>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-bold text-white">Sophie Martin</p>
                    <p className="text-white/70 text-sm">Directrice, Voyages Lumière</p>
                  </div>
                  <div className="flex gap-1 ml-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={18} className="fill-amber-300 text-amber-300" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TYPES D'AGENCES ──────────────────────────────────── */}
      <section className="py-24 px-4 bg-[#fdfbf7]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-3">
              Idéal pour tout type d'acteur touristique
            </h2>
            <p className="text-stone-600 text-lg">
              Comme Voyages Lumière, créez votre propre espace en quelques minutes.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                emoji: '✈️',
                type: 'Agences de voyage',
                example: 'Voyages Lumière (démo)',
                desc: 'Proposez les cartes lors du debrief voyage ou en agence physique via QR code.',
                isDemo: true,
              },
              {
                emoji: '🏨',
                type: 'Hôtels & Resorts',
                example: 'Hôtel Le Grand Panorama',
                desc: 'Placez le QR code à la réception. Vos hôtes partagent leur séjour avec votre marque.',
              },
              {
                emoji: '🏛️',
                type: 'Offices du tourisme',
                example: "OT Côte d'Azur",
                desc: 'Vos visiteurs créent des cartes avec les photos de la destination. Promotion naturelle.',
              },
              {
                emoji: '🚢',
                type: 'Croisières & Clubs',
                example: 'Club Med, MSC ...',
                desc: 'Chaque escale devient une photo. Les passagers créent des cartes des destinations.',
              },
              {
                emoji: '🏕️',
                type: 'Campings & Villages',
                example: 'Camping Les Pins',
                desc: 'Les familles envoient des cartes depuis votre camping. Gardez le contact avec eux.',
              },
              {
                emoji: '🎭',
                type: 'Régions & Communes',
                example: "Mairie d'Honfleur",
                desc: 'Promouvoir la région à travers les cartes envoyées par les visiteurs.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className={`rounded-2xl p-6 border transition-all ${
                  item.isDemo
                    ? 'bg-teal-50 border-teal-200 ring-2 ring-teal-400 ring-offset-2'
                    : 'bg-white border-stone-100 hover:border-teal-200 hover:shadow-md'
                }`}
              >
                <div className="text-3xl mb-3">{item.emoji}</div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-stone-900">{item.type}</h3>
                  {item.isDemo && (
                    <span className="bg-teal-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      DÉMO
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-400 italic mb-3">ex: {item.example}</p>
                <p className="text-stone-600 text-sm leading-relaxed">{item.desc}</p>
                {item.isDemo && (
                  <div className="mt-4 flex items-center gap-1.5 text-teal-600 text-sm font-semibold">
                    <Check size={16} /> Vous êtes sur la démo de cette agence !
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section
        className="py-28 px-4 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f2027 0%, #203a43 60%, #2c5364 100%)' }}
      >
        <div className="absolute inset-0">
          <img
            src={getOptimizedImageUrl(
              'https://img.cartepostale.cool/demo/photo-1519046904884-53103b34b206.jpg',
              { width: 1200 },
            )}
            alt="Fond"
            className="w-full h-full object-cover opacity-10"
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 text-amber-300 px-4 py-2 rounded-full text-sm font-black uppercase tracking-widest mb-8">
              <Sparkles size={16} /> Prêt à créer votre espace agence ?
            </div>
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 leading-[1.1]">
              Rejoignez les agences qui{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-amber-200">
                transforment leurs voyages
              </span>{' '}
              en cartes postales
            </h2>
            <p className="text-white/70 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
              Configuration en moins de 30 minutes. Galerie prête. Vos clients créent leurs cartes
              dès le lendemain.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                asChild
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white px-10 py-7 rounded-2xl text-lg font-bold shadow-2xl border-0"
              >
                <Link href="/contact?sujet=agence">
                  <Mail size={20} className="mr-2" />
                  Demander une démo personnalisée
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="bg-transparent border-white/30 text-white hover:bg-white/10 px-10 py-7 rounded-2xl text-lg font-bold"
              >
                <Link href="/agences">
                  Voir tous les tarifs agences
                  <ArrowRight size={20} className="ml-2" />
                </Link>
              </Button>
            </div>

            {/* Trust elements */}
            <div className="flex flex-wrap justify-center gap-6 mt-10 text-white/50 text-sm">
              {[
                '✓ Sans engagement',
                '✓ Réponse sous 24h',
                '✓ Démo gratuite',
                '✓ Support en français',
              ].map((item, i) => (
                <span key={i} className="font-medium">
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── IMAGE LIGHTBOX ───────────────────────────────────── */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.92)' }}
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-[16/9]">
                <img
                  src={getOptimizedImageUrl(selectedImage.url, { width: 1200 })}
                  alt={selectedImage.title}
                  className="w-full h-full object-cover"
                />
                {/* Agency logo */}
                <div
                  className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold shadow-lg"
                  style={{ background: AGENCY.primaryColor, color: 'white' }}
                >
                  🧭 {AGENCY.name}
                </div>
              </div>
              <div className="p-6 flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-stone-900">{selectedImage.title}</h3>
                  <p className="text-stone-500 mt-1">{selectedImage.caption}</p>
                  <div className="flex gap-4 mt-3 text-sm text-stone-400">
                    <span className="flex items-center gap-1.5">
                      <Heart size={14} className="text-rose-400" fill="#f43f5e" />
                      {selectedImage.usages} cartes créées avec cette image
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Eye size={14} className="text-teal-500" />
                      {selectedImage.views} vues galerie
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors"
                >
                  <X size={20} className="text-stone-600" />
                </button>
              </div>
              <div className="px-6 pb-6">
                <Link href="/editor">
                  <Button
                    className="w-full py-5 rounded-xl text-base font-bold"
                    style={{ background: AGENCY.primaryColor }}
                  >
                    <PenLine size={18} className="mr-2" />
                    Créer une carte avec cette photo →
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ──────────────────────────────────────────────────────────
//  Sub-component: Interactive Postcard Carousel
// ──────────────────────────────────────────────────────────

function PostcardCarousel({
  postcards,
  active,
  isFlipped,
  onSelect,
  onFlip,
}: {
  postcards: typeof DEMO_POSTCARDS
  active: number
  isFlipped: boolean
  onSelect: (i: number) => void
  onFlip: () => void
}) {
  const card = postcards[active]

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Postcard */}
      <div className="relative" style={{ perspective: '1200px', width: 340, height: 230 }}>
        <motion.div
          style={{
            transformStyle: 'preserve-3d',
            width: '100%',
            height: '100%',
            position: 'relative',
          }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl backface-hidden cursor-pointer"
            style={{ backfaceVisibility: 'hidden' }}
            onClick={onFlip}
          >
            <img
              src={getOptimizedImageUrl(card.image, { width: 700 })}
              alt={card.location}
              className="w-full h-full object-cover"
            />
            <div
              className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shadow-lg"
              style={{ background: '#0d9488', color: 'white' }}
            >
              🧭 Voyages Lumière
            </div>
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 text-stone-700">
              <MapPin size={10} className="text-teal-600" />
              {card.location}
            </div>
            <div className="absolute bottom-3 left-3 bg-white/20 backdrop-blur text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <PlayCircle size={12} /> Cliquez pour retourner
            </div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-2xl shadow-2xl cursor-pointer overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: '#fdf8f0',
              fontFamily: 'Georgia, serif',
            }}
            onClick={onFlip}
          >
            {/* Lines decoration */}
            <div className="absolute inset-0 p-4 flex">
              <div className="flex-1 pr-4 border-r-2 border-stone-200">
                <p className="text-stone-500 text-[9px] font-sans uppercase tracking-widest mb-3">
                  Message
                </p>
                <p className="text-stone-800 text-xs leading-relaxed italic">{card.message}</p>
                <p className="text-stone-600 text-xs mt-4 font-semibold">— {card.from}</p>
              </div>
              <div className="w-28 pl-3 flex flex-col justify-between">
                <div>
                  <div
                    className="w-10 h-10 mb-2 rounded-md flex items-center justify-center text-sm text-white font-bold shadow-md"
                    style={{ background: '#0d9488' }}
                  >
                    <Stamp size={18} />
                  </div>
                  <p className="text-[8px] text-stone-400 font-sans uppercase tracking-wider">
                    CartePostale.cool
                    <br />
                    by Voyages Lumière
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-stone-400 font-sans uppercase tracking-wider mb-1">
                    Pour :
                  </p>
                  <p className="text-xs font-bold text-stone-800">{card.recipient}</p>
                  <p className="text-[9px] text-stone-400 mt-1">{card.date}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Selectors */}
      <div className="flex gap-2">
        {postcards.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              onSelect(i)
            }}
            className={`w-2 h-2 rounded-full transition-all ${
              active === i ? 'bg-teal-400 w-6' : 'bg-white/30'
            }`}
          />
        ))}
      </div>
      <p className="text-white/50 text-xs text-center">Cliquez sur la carte pour la retourner ↩️</p>
    </div>
  )
}
