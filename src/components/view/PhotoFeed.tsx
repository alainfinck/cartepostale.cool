'use client'

import React, { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { MediaItem } from '@/types'
import { Camera, ChevronLeft, ChevronRight, X, Sparkles, StickyNote } from 'lucide-react'
import { CoolMode } from '@/components/ui/cool-mode'
import ShimmerButton from '@/components/ui/shimmer-button'

interface PhotoFeedProps {
  mediaItems: MediaItem[]
  senderName: string
}

export default function PhotoFeed({ mediaItems, senderName }: PhotoFeedProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isFlipped, setIsFlipped] = useState(false)

  // Reset flip when changing photo
  useEffect(() => {
    setIsFlipped(false)
  }, [selectedIndex])

  // Keyboard navigation
  useEffect(() => {
    if (selectedIndex === null) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedIndex(null)
      } else if (e.key === 'ArrowLeft') {
        setSelectedIndex((prev) =>
          prev !== null ? (prev - 1 + mediaItems.length) % mediaItems.length : null,
        )
      } else if (e.key === 'ArrowRight') {
        setSelectedIndex((prev) => (prev !== null ? (prev + 1) % mediaItems.length : null))
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [selectedIndex, mediaItems.length])

  if (!mediaItems || mediaItems.length === 0) return null

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % mediaItems.length)
    }
  }

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + mediaItems.length) % mediaItems.length)
    }
  }

  return (
    <section
      id="photo-feed"
      className="w-full max-w-xl mx-auto mt-12 mb-20 px-4 flex flex-col items-center"
    >
      {!isVisible ? (
        <div className="text-center py-10">
          <CoolMode>
            <ShimmerButton
              onClick={() => setIsVisible(true)}
              shimmerColor="#ffffff"
              shimmerSize="0.1em"
              shimmerDuration="2.5s"
              borderRadius="16px"
              background="linear-gradient(135deg, #09090b 0%, #18181b 100%)"
              className="bg-stone-950 px-12 py-8 group transition-all hover:scale-105 active:scale-95 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-emerald-400 group-hover:animate-pulse" />
                <span className="text-white font-bold text-lg uppercase tracking-widest">
                  Afficher l'album photo, cliquez ici
                </span>
              </div>
            </ShimmerButton>
          </CoolMode>
          <p className="text-stone-400 mt-6 text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
            Découvrir les souvenirs partagés
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="w-full"
        >
          <div className="flex items-center gap-2 mb-8 justify-center">
            <Camera size={24} className="text-teal-600" />
            <h3 className="font-serif text-2xl font-bold text-stone-800">Album de {senderName}</h3>
          </div>

          {/* Instagram-style vertical feed */}
          <div className="flex flex-col gap-6">
            {mediaItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="relative group cursor-pointer"
                onClick={() => setSelectedIndex(index)}
              >
                {/* Photo container */}
                <div className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-stone-100 bg-white">
                  {item.type === 'video' ? (
                    <div className="w-full aspect-[4/5] relative">
                      <video src={item.url} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="w-14 h-14 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center">
                          <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[16px] border-l-white border-b-[10px] border-b-transparent ml-1" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full aspect-[4/5] relative">
                      <Image
                        src={item.url}
                        alt={`Photo ${index + 1} de ${senderName}`}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                        sizes="(max-width: 768px) 100vw, 576px"
                      />
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Note indicator */}
                  {item.note && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-amber-500/90 backdrop-blur-sm text-white px-2.5 py-1.5 rounded-full shadow-lg text-[11px] font-bold">
                      <StickyNote size={12} />
                      <span>Note</span>
                    </div>
                  )}

                  {/* Photo number */}
                  <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                    {index + 1}/{mediaItems.length}
                  </div>
                </div>

                {/* Caption preview (if note exists) */}
                {item.note && (
                  <div className="mt-2 px-1">
                    <p className="text-sm text-stone-600 line-clamp-2 leading-relaxed">
                      <span className="font-bold text-stone-800">{senderName}</span> {item.note}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Fullscreen Slideshow Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center"
            onClick={() => setSelectedIndex(null)}
          >
            {/* Close button */}
            <button
              className="absolute top-6 right-6 text-white/70 hover:text-white p-2 z-50 bg-white/10 rounded-full transition-colors"
              onClick={() => setSelectedIndex(null)}
            >
              <X size={28} />
            </button>

            {/* Navigation arrows */}
            {mediaItems.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 z-50 transition-colors"
                  onClick={handlePrev}
                >
                  <ChevronLeft size={48} />
                </button>
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 z-50 transition-colors"
                  onClick={handleNext}
                >
                  <ChevronRight size={48} />
                </button>
              </>
            )}

            {/* Flip card container */}
            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-4xl mx-4 flex flex-col items-center justify-center"
              style={{ perspective: '1200px' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Flip card */}
              <div
                className="relative w-full transition-transform duration-700 ease-in-out"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  maxHeight: '80vh',
                  aspectRatio: mediaItems[selectedIndex].type === 'video' ? undefined : '4/5',
                }}
              >
                {/* Front — Photo */}
                <div
                  className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  {mediaItems[selectedIndex].type === 'video' ? (
                    <video
                      src={mediaItems[selectedIndex].url}
                      controls
                      autoPlay
                      className="w-full h-full object-contain bg-black rounded-2xl"
                    />
                  ) : (
                    <Image
                      src={mediaItems[selectedIndex].url}
                      alt={`Full photo ${selectedIndex + 1}`}
                      fill
                      unoptimized
                      className="object-contain bg-black"
                      priority
                    />
                  )}
                </div>

                {/* Back — Note */}
                <div
                  className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center justify-center p-8"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    background:
                      'linear-gradient(145deg, #fef3c7 0%, #fffbeb 30%, #fefce8 60%, #fef9c3 100%)',
                  }}
                >
                  {/* Decorative postal lines */}
                  <div
                    className="absolute inset-0 opacity-[0.06]"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(0deg, transparent, transparent 31px, #92400e 31px, #92400e 32px)',
                    }}
                  />

                  <div className="relative z-10 max-w-md text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 text-amber-600 rounded-full mb-6">
                      <StickyNote size={24} />
                    </div>
                    <p className="text-xl md:text-2xl font-serif text-stone-800 leading-relaxed italic">
                      &ldquo;{mediaItems[selectedIndex].note || 'Pas de note pour cette photo.'}
                      &rdquo;
                    </p>
                    <p className="mt-6 text-sm text-stone-500 font-bold uppercase tracking-wider">
                      — {senderName}
                    </p>
                  </div>

                  {/* Stamp decoration */}
                  <div className="absolute top-4 right-4 opacity-20">
                    <div className="w-16 h-20 border-2 border-dashed border-amber-800 rounded-sm flex items-center justify-center">
                      <span className="text-2xl">📮</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls bar */}
              <div className="mt-6 flex items-center gap-4">
                {/* Counter */}
                <span className="text-white/50 text-sm font-medium">
                  {selectedIndex + 1} / {mediaItems.length}
                </span>

                {/* Flip button (only if note exists) */}
                {mediaItems[selectedIndex].note && (
                  <button
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500/90 hover:bg-amber-500 text-white rounded-full text-sm font-bold shadow-lg transition-all hover:scale-105 active:scale-95"
                  >
                    <StickyNote size={14} />
                    <span>{isFlipped ? 'Voir la photo' : 'Lire la note'}</span>
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
