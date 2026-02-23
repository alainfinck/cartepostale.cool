'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { MediaItem } from '@/types'
import { Camera, ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react'
import { CoolMode } from '@/components/ui/cool-mode'

import ShimmerButton from '@/components/ui/shimmer-button'

interface PhotoAlbumProps {
  mediaItems: MediaItem[]
  senderName: string
}

export default function PhotoAlbum({ mediaItems, senderName }: PhotoAlbumProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

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
      id="photo-album"
      className="w-full max-w-4xl mx-auto mt-12 mb-20 px-4 flex flex-col items-center"
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
                  Afficher l&apos;album photo, cliquez ici
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
          <div className="flex items-center gap-2 mb-8 justify-center md:justify-start">
            <Camera size={24} className="text-teal-600" />
            <h3 className="font-serif text-2xl font-bold text-stone-800">Album de {senderName}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mediaItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                onClick={() => setSelectedIndex(index)}
                className="relative aspect-square rounded-2xl overflow-hidden shadow-lg group cursor-pointer border-4 border-white"
              >
                {item.type === 'video' ? (
                  <div className="w-full h-full relative">
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      playsInline
                      muted
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center">
                        <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <Image
                    src={item.url}
                    alt={`Photo ${index + 1} de ${senderName}`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setSelectedIndex(null)}
          >
            <button
              className="absolute top-6 right-6 text-white/70 hover:text-white p-2 z-50 bg-white/10 rounded-full transition-colors"
              onClick={() => setSelectedIndex(null)}
            >
              <X size={28} />
            </button>

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

            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-5xl h-full max-h-[85vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {mediaItems[selectedIndex].type === 'video' ? (
                <video
                  src={mediaItems[selectedIndex].url}
                  controls
                  autoPlay
                  className="max-w-full max-h-full rounded-lg shadow-2xl"
                />
              ) : (
                <div className="relative w-full h-full">
                  <Image
                    src={mediaItems[selectedIndex].url}
                    alt={`Full photo ${selectedIndex + 1}`}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              )}

              <div className="absolute -bottom-10 left-0 right-0 text-center text-white/50 text-sm font-medium">
                {selectedIndex + 1} / {mediaItems.length}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
