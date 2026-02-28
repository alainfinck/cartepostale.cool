'use client'

import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react'
import { Postcard } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  Share2,
  Compass,
  Image as ImageIcon,
  Map as MapIcon,
  Mail,
  X,
  ChevronRight,
  Minus,
  Plus,
} from 'lucide-react'
import ARButton from '@/components/ar/ARButton'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { cn } from '@/lib/utils'

// Helper component for smooth image loading in the gallery
const GalleryImage = ({ item, idx, onClick }: { item: any; idx: number; onClick: () => void }) => {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: (idx % 2) * 0.05 }}
      onClick={onClick}
      className="aspect-square rounded-[2.5rem] relative group cursor-pointer active:scale-95 transition-transform"
    >
      {/* The "Card" container only shows when loaded for maximum fluidity */}
      <div
        className={cn(
          'w-full h-full p-2 bg-white shadow-md border border-stone-200/30 rounded-[2.5rem] transition-opacity duration-500',
          isLoaded ? 'opacity-100' : 'opacity-0',
        )}
      >
        <div className="w-full h-full relative overflow-hidden rounded-[2rem] bg-stone-50/50">
          <Image
            src={item.url}
            alt=""
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className={cn(
              'object-cover transition-all duration-700 ease-out',
              isLoaded ? 'scale-100 opacity-100' : 'scale-110 opacity-0',
            )}
            onLoad={() => setIsLoaded(true)}
          />
        </div>
      </div>
    </motion.div>
  )
}

// Dynamic imports for Map components to avoid SSR issues
const MiniMap = dynamic(() => import('@/components/postcard/MiniMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-stone-100 animate-pulse flex items-center justify-center text-stone-300 font-bold uppercase tracking-widest text-[10px]">
      Chargement de la carte...
    </div>
  ),
})

const MapModal = dynamic(() => import('@/components/ui/MapModal'), {
  ssr: false,
  loading: () => null,
})

interface PostcardScrollFlowProps {
  postcard: Postcard
}

export default function PostcardScrollFlow({ postcard }: PostcardScrollFlowProps) {
  const {
    senderName,
    date,
    frontImage,
    message,
    location,
    mediaItems = [],
    frontCaption,
    coords,
  } = postcard

  const [isFlipped, setIsFlipped] = useState(false)
  const [isMapModalOpen, setIsMapModalOpen] = useState(false)
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null)
  const [direction, setDirection] = useState(0) // -1 for prev, 1 for next
  const [backTextScale, setBackTextScale] = useState(0.9)

  const messageRef = useRef<HTMLDivElement>(null)
  const albumRef = useRef<HTMLDivElement>(null)
  const mapSectionRef = useRef<HTMLDivElement>(null)

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return
    const offset = 20
    const bodyRect = document.body.getBoundingClientRect().top
    const elementRect = ref.current.getBoundingClientRect().top
    const elementPosition = elementRect - bodyRect
    const offsetPosition = elementPosition - offset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    })
  }

  // Calculate photo locations for the map
  const photoLocations = useMemo(() => {
    if (!mediaItems) return []
    const groups: Record<string, any> = {}
    mediaItems.forEach((item: any) => {
      const gps = item.exif?.gps
      if (gps && typeof gps.latitude === 'number' && typeof gps.longitude === 'number') {
        const key = `${gps.latitude.toFixed(4)},${gps.longitude.toFixed(4)}`
        if (!groups[key]) {
          groups[key] = { id: key, lat: gps.latitude, lng: gps.longitude, mediaItems: [] }
        }
        groups[key].mediaItems.push(item)
      }
    })
    return Object.values(groups)
  }, [mediaItems])

  // Preload adjacent images for fluidity
  useEffect(() => {
    if (!mediaItems || mediaItems.length <= 1 || activePhotoIndex === null) return

    const indicesToPreload = [
      (activePhotoIndex + 1) % mediaItems.length,
      (activePhotoIndex + 2) % mediaItems.length,
      (activePhotoIndex - 1 + mediaItems.length) % mediaItems.length,
    ]

    indicesToPreload.forEach((idx) => {
      const item = mediaItems[idx]
      if (item && item.type === 'image' && item.url) {
        const img = new window.Image()
        img.src = item.url
      }
    })
  }, [activePhotoIndex, mediaItems])

  // Navigation handlers for slideshow
  const nextPhoto = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation()
      if (activePhotoIndex === null) return
      setDirection(1)
      setActivePhotoIndex((activePhotoIndex + 1) % mediaItems.length)
    },
    [activePhotoIndex, mediaItems.length],
  )

  const prevPhoto = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation()
      if (activePhotoIndex === null) return
      setDirection(-1)
      setActivePhotoIndex((activePhotoIndex - 1 + mediaItems.length) % mediaItems.length)
    },
    [activePhotoIndex, mediaItems.length],
  )

  // Listen for keyboard arrows
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activePhotoIndex === null) return
      if (e.key === 'ArrowRight') nextPhoto()
      if (e.key === 'ArrowLeft') prevPhoto()
      if (e.key === 'Escape') setActivePhotoIndex(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activePhotoIndex, nextPhoto, prevPhoto])

  return (
    <div className="flex flex-col min-h-screen bg-[#f3f4f6] text-stone-900 pb-40">
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto w-full pt-12 px-4 md:pt-20">
        {/* Navigation Tabs - Removed Redundant header as per user request */}
        <div className="flex justify-center mb-10">
          <div className="flex bg-white rounded-2xl p-1.5 shadow-sm border border-stone-200/50">
            <button className="px-8 py-2.5 rounded-xl bg-teal-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-teal-500/20">
              <Mail size={14} />
              CARTE
            </button>
            <button
              onClick={() => scrollTo(messageRef)}
              className="px-8 py-2.5 rounded-xl text-stone-400 hover:text-stone-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
            >
              <ImageIcon size={14} />
              LECTURE
            </button>
          </div>
        </div>

        {/* Flippable Hero Postcard Section */}
        <section className="relative mb-16" style={{ perspective: '1000px' }}>
          <motion.div
            initial={false}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 1.5, type: 'spring', stiffness: 40, damping: 15 }}
            style={{ transformStyle: 'preserve-3d' }}
            className="relative w-full aspect-[4/3] cursor-pointer group"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            {/* FRONT SIDE */}
            <div
              className="absolute inset-0 w-full h-full z-10"
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
            >
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="relative h-full bg-white p-2 md:p-3 rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.15)] border border-white"
              >
                <div className="w-full h-full overflow-hidden rounded-xl relative bg-stone-100">
                  <Image
                    src={frontImage}
                    alt="Carte Postale Front"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Flip Button Overlay */}
                  <div className="absolute top-4 right-4">
                    <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-white/20">
                      <Compass size={14} className="animate-spin-slow" />
                      Cliquez pour retourner
                    </div>
                  </div>

                  {/* Floating Caption Pill */}
                  {frontCaption && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.6, type: 'spring' }}
                        className="bg-white/95 backdrop-blur-md px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4 border border-white/20 whitespace-nowrap"
                      >
                        <span className="text-3xl leading-none">🌴</span>
                        <span className="font-sans font-bold text-stone-800 text-sm md:text-2xl tracking-tight">
                          {frontCaption}
                        </span>
                      </motion.div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* BACK SIDE (Traditional Postcard) */}
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <div className="h-full bg-[#fdfaf3] p-6 md:p-10 rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.15)] border border-stone-200/50 flex flex-col">
                <div className="flex flex-1 gap-6 md:gap-10 min-h-0">
                  {/* Left Column: Message — placement et style comme sur la carte, avec -/+ et scrollbar */}
                  <div className="flex-1 flex flex-col pt-4 overflow-hidden min-h-0">
                    {/* Boutons − / + pour la taille du texte (mobile et desktop) */}
                    <div
                      className="flex items-center gap-2 shrink-0 mb-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setBackTextScale((s) => Math.max(0.6, Number((s - 0.08).toFixed(2))))
                          }}
                          className="w-9 h-9 flex items-center justify-center hover:bg-stone-50 text-stone-500 hover:text-teal-600 transition-colors border-r border-stone-100"
                          title="Réduire la taille du texte"
                          aria-label="Réduire la taille du texte"
                        >
                          <Minus size={18} strokeWidth={2.5} />
                          <span className="sr-only">−</span>
                        </button>
                        <span className="px-2 text-xs font-bold text-stone-500 select-none">A</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setBackTextScale((s) => Math.min(1.5, Number((s + 0.08).toFixed(2))))
                          }}
                          className="w-9 h-9 flex items-center justify-center hover:bg-stone-50 text-stone-500 hover:text-teal-600 transition-colors border-l border-stone-100"
                          title="Agrandir la taille du texte"
                          aria-label="Agrandir la taille du texte"
                        >
                          <Plus size={18} strokeWidth={2.5} />
                          <span className="sr-only">+</span>
                        </button>
                      </div>
                      <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                        Taille
                      </span>
                    </div>
                    <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar pr-1">
                      <p
                        className="font-handwriting text-stone-700 leading-relaxed italic whitespace-pre-wrap break-words max-w-full"
                        style={{
                          fontSize: `clamp(0.875rem, ${1.15 * backTextScale}rem, 1.75rem)`,
                          fontFamily: "'Dancing Script', cursive",
                        }}
                      >
                        {message}
                      </p>
                    </div>
                    <div className="mt-auto font-handwriting text-2xl md:text-4xl text-teal-700 pt-4 shrink-0">
                      — {senderName}
                    </div>
                  </div>

                  {/* Right Column: Stamp & Address Lines */}
                  <div className="w-[45%] flex flex-col border-l border-stone-200/50 pl-6 md:pl-10 relative h-full">
                    {/* Stamp Area */}
                    <div className="self-end mb-8 group">
                      <div className="relative w-16 h-20 md:w-24 md:h-28 bg-[#fdf5e6] p-1 border-[1.5px] border-orange-300/40 transform rotate-2 shadow-md">
                        <div className="w-full h-full border border-orange-200/50 flex flex-col items-center justify-between p-1 bg-white/40">
                          <span className="text-[6px] md:text-[8px] font-bold text-orange-900/60 uppercase text-center">
                            Digital Poste
                          </span>
                          <div className="flex-1 flex items-center justify-center opacity-40">
                            <Compass size={24} className="text-orange-900" />
                          </div>
                          <span className="text-[6px] md:text-[8px] font-bold text-orange-900/40">
                            2026
                          </span>
                        </div>
                        {/* Stamp sawtooth edges mask simulation */}
                        <div
                          className="absolute inset-0 border-[3px] border-[#fdfaf3] opacity-30 pointer-events-none"
                          style={{
                            mask: 'conic-gradient(from 45deg, transparent 0deg 90deg, black 90deg 360deg) 0 0/8px 8px round',
                          }}
                        />
                      </div>
                    </div>

                    {/* Recipient & Address Lines */}
                    <div className="flex flex-col gap-4 mt-2 mb-6">
                      <div className="font-handwriting text-xl md:text-2xl text-stone-600 border-b border-stone-300/40 pb-1 min-h-[2.5rem] flex items-end">
                        <span className="opacity-40 text-sm mr-2 font-serif uppercase tracking-widest leading-none">
                          À :
                        </span>
                        {postcard.recipientName || 'Un ami proche'}
                      </div>
                      <div className="h-px bg-stone-300/40 w-full" />
                      <div className="h-px bg-stone-300/40 w-full" />
                      <div className="h-px bg-stone-300/40 w-full mt-2" />
                    </div>

                    {/* Back MiniMap in Bottom Right */}
                    <div
                      className="flex-1 w-full min-h-0 rounded-xl overflow-hidden border-4 border-white shadow-xl transform rotate-1 z-20 group/map cursor-pointer relative"
                      onClick={(e) => {
                        e.stopPropagation() // Prevents flipping the card when interacting with the map
                        setIsMapModalOpen(true)
                      }}
                    >
                      {coords && (
                        <div className="w-full h-full relative">
                          <div className="absolute inset-0 bg-black/0 group-hover/map:bg-black/10 transition-colors z-10 flex items-center justify-center pointer-events-none">
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              whileHover={{ opacity: 1, scale: 1 }}
                              className="bg-white/90 p-3 rounded-full shadow-lg text-teal-600"
                            >
                              <MapIcon size={24} />
                            </motion.div>
                          </div>
                          <MiniMap
                            coords={coords}
                            zoom={12}
                            className="w-full h-full grayscale-[0.3]"
                            photoLocations={photoLocations}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Postmark Overlay (Simulated) */}
                <div className="absolute top-10 right-28 opacity-20 pointer-events-none transform -rotate-12">
                  <div className="w-20 h-20 md:w-32 md:h-32 rounded-full border-2 border-stone-800 flex items-center justify-center text-center p-2 font-mono text-[8px] md:text-[10px] font-bold uppercase">
                    POSTE AERIENNE
                    <br />
                    {location || 'INCONNU'}
                    <br />
                    {date}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          {/* Physical shadows */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[95%] h-16 bg-black/10 blur-[60px] rounded-full -z-10" />
        </section>

        {/* Message "Paper" Block */}
        <section ref={messageRef} className="mt-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="bg-[#fefaf3] rounded-[2.5rem] p-10 md:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-stone-200/40 relative overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-10 opacity-40">
              <Mail size={16} className="text-stone-500" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-600">
                Message de {senderName}
              </h2>
            </div>

            {/* Message Body */}
            <div className="font-serif text-2xl md:text-4xl text-stone-700 leading-[1.8] md:leading-[1.9] mb-12 whitespace-pre-wrap italic">
              {message}
            </div>

            {/* Signature */}
            <div className="font-handwriting text-5xl md:text-6xl text-teal-700 mb-20 decoration-teal-500/10">
              — {senderName}
            </div>

            {/* Bottom Metadata */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-stone-200/60 pt-8 gap-6">
              <div className="flex items-center gap-3 text-stone-500 text-[11px] font-bold uppercase tracking-wider">
                <MapPin size={16} className="text-teal-500/60" />
                <span>{location || 'Un bel endroit'}</span>
              </div>
              <div className="text-stone-300 text-[11px] font-black tracking-[0.2em] uppercase">
                {date}
              </div>
            </div>

            {/* Watermark */}
            <div className="mt-14 text-center opacity-60">
              <span className="text-xs md:text-sm font-black tracking-[0.5em] text-stone-500 uppercase">
                CARTEPOSTALE.COOL
              </span>
            </div>
          </motion.div>
        </section>

        {/* Map Section — moins de marge sur mobile pour carte plus grande */}
        {coords && (
          <section ref={mapSectionRef} className="mt-16 overflow-hidden -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex items-center gap-4 mb-6 sm:mb-10 px-0 sm:px-4">
              <div className="w-12 h-px bg-stone-300/50" />
              <h3 className="text-[11px] font-black uppercase tracking-widest text-stone-400">
                Localisation
              </h3>
              <div className="flex-1 h-px bg-stone-300/50" />
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="aspect-[16/9] bg-white p-1 sm:p-2 rounded-xl sm:rounded-[2rem] shadow-xl border border-stone-200/40 relative group"
            >
              <div className="w-full h-full rounded-lg sm:rounded-3xl overflow-hidden grayscale-[0.2] contrast-[1.1]">
                <MiniMap
                  coords={coords}
                  zoom={10}
                  photoLocations={photoLocations}
                  interactive={true}
                />
              </div>
            </motion.div>
          </section>
        )}

        {/* Media Album Section */}
        {mediaItems.length > 0 && (
          <section ref={albumRef} className="mt-16 mb-24">
            <div className="flex items-center gap-4 mb-10 px-4">
              <div className="w-12 h-px bg-stone-300/50" />
              <h3 className="text-[11px] font-black uppercase tracking-widest text-stone-400">
                L&apos;album souvenirs
              </h3>
              <div className="flex-1 h-px bg-stone-300/50" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mediaItems.map((item, idx) => (
                <GalleryImage
                  key={item.id || idx}
                  item={item}
                  idx={idx}
                  onClick={() => setActivePhotoIndex(idx)}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Barre fixe compacte en bas */}
      <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-md z-50">
        <div className="bg-white/98 backdrop-blur-xl rounded-2xl py-2 px-2 flex items-center justify-around shadow-lg border border-stone-200/60">
          <button
            onClick={() => scrollTo(messageRef)}
            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all hover:bg-stone-50 active:scale-90 group"
          >
            <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
              <Mail size={16} className="stroke-[2.5]" />
            </div>
            <span className="text-[8px] font-bold uppercase tracking-wider text-stone-500">
              Carte
            </span>
          </button>

          <ARButton
            postcard={postcard}
            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all hover:bg-stone-50 active:scale-90 group"
          />

          <button
            onClick={() => (coords ? scrollTo(mapSectionRef) : setIsMapModalOpen(true))}
            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all hover:bg-stone-50 active:scale-90 group"
          >
            <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
              <MapIcon size={16} className="stroke-[2.5]" />
            </div>
            <span className="text-[8px] font-bold uppercase tracking-wider text-stone-500">
              Carte
            </span>
          </button>

          <button
            onClick={() => scrollTo(albumRef)}
            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all hover:bg-stone-50 active:scale-90 group"
          >
            <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
              <ImageIcon size={16} className="stroke-[2.5]" />
            </div>
            <span className="text-[8px] font-bold uppercase tracking-wider text-stone-500">
              Album
            </span>
          </button>

          <button className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all hover:bg-stone-50 active:scale-90 group">
            <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
              <Share2 size={16} className="stroke-[2.5]" />
            </div>
            <span className="text-[8px] font-bold uppercase tracking-wider text-stone-500">
              Partage
            </span>
          </button>
        </div>
      </nav>

      {/* Map Modal */}
      <AnimatePresence>
        {isMapModalOpen && coords && (
          <MapModal
            coords={coords}
            isOpen={isMapModalOpen}
            onClose={() => setIsMapModalOpen(false)}
            location={location || ''}
            image={frontImage}
          />
        )}
      </AnimatePresence>

      {/* Album Slideshow Modal */}
      <AnimatePresence>
        {activePhotoIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/95 backdrop-blur-lg p-4 md:p-8"
            onClick={() => setActivePhotoIndex(null)}
          >
            {/* Close Button */}
            <button
              className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-[110]"
              onClick={() => setActivePhotoIndex(null)}
            >
              <X size={32} />
            </button>

            {/* Main Interactive Slide Container */}
            <div
              className="relative w-full max-w-4xl max-h-[85vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Previous Button */}
              {/* Photo with Adaptive White Border Effect */}
              <div className="relative w-full h-[70dvh] md:h-[80dvh] flex items-center justify-center pointer-events-none">
                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                  <motion.div
                    key={activePhotoIndex}
                    custom={direction}
                    variants={{
                      enter: (direction: number) => ({
                        x: direction > 0 ? 600 : -600,
                        rotate: direction > 0 ? 15 : -15,
                        opacity: 0,
                        scale: 0.8,
                      }),
                      center: {
                        zIndex: 1,
                        x: 0,
                        rotate: 0,
                        opacity: 1,
                        scale: 1,
                      },
                      exit: (direction: number) => ({
                        zIndex: 0,
                        x: direction < 0 ? 600 : -600,
                        rotate: direction < 0 ? 15 : -15,
                        opacity: 0,
                        scale: 0.8,
                      }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: 'spring', stiffness: 60, damping: 20 },
                      rotate: { type: 'spring', stiffness: 60, damping: 20 },
                      opacity: { duration: 0.6 },
                      scale: { duration: 0.6 },
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    onDragEnd={(e, { offset, velocity }) => {
                      const swipe = Math.abs(offset.x) > 50 && Math.abs(velocity.x) > 500
                      if (swipe) {
                        if (offset.x > 0) {
                          prevPhoto()
                        } else {
                          nextPhoto()
                        }
                      }
                    }}
                    className="relative bg-white p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] shadow-2xl flex flex-col items-center pointer-events-auto touch-none"
                  >
                    <div className="overflow-hidden rounded-xl md:rounded-[2rem] bg-stone-100 relative">
                      {mediaItems[activePhotoIndex].type === 'video' ? (
                        <video
                          src={mediaItems[activePhotoIndex].url}
                          controls
                          playsInline
                          className="max-h-[60dvh] md:max-h-[70dvh] w-auto h-auto block"
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={mediaItems[activePhotoIndex].url}
                          alt=""
                          className="max-h-[60dvh] md:max-h-[70dvh] w-auto h-auto block object-contain"
                        />
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Slide Context */}
              <div className="absolute -bottom-16 left-0 right-0 flex items-center justify-between w-full px-6 md:px-12 pointer-events-none">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50 bg-black/20 backdrop-blur-sm px-4 py-1.5 rounded-full">
                  {activePhotoIndex + 1} / {mediaItems.length}
                </span>
                {(mediaItems[activePhotoIndex] as any).exif?.gps?.city && (
                  <span className="text-[11px] font-bold text-teal-400 flex items-center gap-2 bg-black/20 backdrop-blur-sm px-4 py-1.5 rounded-full">
                    <MapPin size={14} />
                    {(mediaItems[activePhotoIndex] as any).exif.gps.city}
                  </span>
                )}
              </div>

              {/* Next Button */}
              <button
                onClick={nextPhoto}
                className="absolute right-0 md:-right-20 text-white/40 hover:text-white transition-colors p-4 rounded-full hover:bg-white/5 z-[110]"
              >
                <ChevronRight size={48} strokeWidth={1.5} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
