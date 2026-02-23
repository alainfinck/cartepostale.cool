'use client'

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MediaItem } from '@/types'
import { ChevronLeft, ChevronRight, X, StickyNote } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getOptimizedImageUrl, DISPLAY_MAX_WIDTH } from '@/lib/image-processing'

export interface AlbumPolaroidLightboxProps {
  mediaItems: MediaItem[]
  senderName: string
  initialIndex?: number
  onClose: () => void
  /** Contenu optionnel en haut à gauche (ex. bouton "Ajouter une photo") */
  extraTopLeft?: React.ReactNode
}

const polaroidVariants = {
  enter: (dir: number) => ({
    x: dir >= 0 ? 500 : -500,
    rotate: dir >= 0 ? 12 : -12,
    opacity: 0,
    scale: 0.85,
  }),
  center: {
    x: 0,
    rotate: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (dir: number) => ({
    x: dir >= 0 ? -500 : 500,
    rotate: dir >= 0 ? -12 : 12,
    opacity: 0,
    scale: 0.85,
  }),
}

export default function AlbumPolaroidLightbox({
  mediaItems,
  senderName,
  initialIndex = 0,
  onClose,
  extraTopLeft,
}: AlbumPolaroidLightboxProps) {
  const [selectedIndex, setSelectedIndex] = useState(
    Math.min(initialIndex, Math.max(0, mediaItems.length - 1)),
  )
  const [isFlipped, setIsFlipped] = useState(false)
  const [slideDirection, setSlideDirection] = useState(0)
  const [viewMode, setViewMode] = useState<'diapo' | 'full'>('diapo')
  const [displayWidth, setDisplayWidth] = useState(DISPLAY_MAX_WIDTH)

  useEffect(() => {
    const updateWidth = () => {
      const w = typeof window !== 'undefined' ? window.innerWidth * (window.devicePixelRatio || 1) : DISPLAY_MAX_WIDTH
      setDisplayWidth(Math.min(DISPLAY_MAX_WIDTH, Math.round(w)))
    }
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  const sortedMediaItems = useMemo(() => {
    const items = [...mediaItems]
    const hasAnyDates = items.some((item) => item.exif?.dateTime)
    if (hasAnyDates) {
      items.sort((a, b) => {
        const dateA = a.exif?.dateTime ? new Date(a.exif.dateTime).getTime() : 0
        const dateB = b.exif?.dateTime ? new Date(b.exif.dateTime).getTime() : 0
        return dateA - dateB
      })
    }
    return items
  }, [mediaItems])

  useEffect(() => {
    setIsFlipped(false)
  }, [selectedIndex])

  const paginate = useCallback(
    (direction: number) => {
      setSlideDirection(direction)
      setIsFlipped(false)
      setSelectedIndex((prev) =>
        direction === 1
          ? (prev + 1) % sortedMediaItems.length
          : (prev - 1 + sortedMediaItems.length) % sortedMediaItems.length,
      )
    },
    [sortedMediaItems.length],
  )

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft') {
        paginate(-1)
      } else if (e.key === 'ArrowRight') {
        paginate(1)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, paginate])

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    paginate(-1)
  }

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    paginate(1)
  }

  if (sortedMediaItems.length === 0) return null

  const current = sortedMediaItems[selectedIndex]

  return (
    <motion.div
      key="album-polaroid-lightbox"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      className="fixed inset-0 z-[99999] bg-black/98 backdrop-blur-2xl flex flex-col items-center justify-center overflow-hidden min-h-screen"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        type="button"
        aria-label="Fermer (Échap)"
        className="absolute top-10 right-6 md:top-12 md:right-12 z-[100001] p-3 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white border border-white/20 transition-all shadow-2xl backdrop-blur-md"
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
      >
        <X size={32} strokeWidth={2} />
      </button>

      {/* Extra top left (e.g. contribution) */}
      {extraTopLeft && (
        <div className="absolute top-10 left-6 md:top-12 md:left-12 z-[100001] flex gap-2">
          {extraTopLeft}
        </div>
      )}

      {/* Toggle Pola / Photo entière */}
      {current?.type !== 'video' && (
        <div
          role="group"
          aria-label="Mode d'affichage"
          className={cn(
            'absolute z-[100001] flex rounded-full bg-black/40 backdrop-blur-md border border-white/20 p-1 shadow-xl',
            extraTopLeft ? 'top-10 left-6 md:top-12 md:left-12 mt-14 md:mt-0 md:left-48' : 'top-10 left-6 md:top-12 md:left-12',
          )}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setViewMode('diapo')
            }}
            className={cn(
              'px-4 py-2.5 rounded-full text-sm font-bold transition-all',
              viewMode === 'diapo'
                ? 'bg-white/25 text-white shadow-inner'
                : 'text-white/70 hover:text-white',
            )}
          >
            Pola
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setViewMode('full')
            }}
            className={cn(
              'px-4 py-2.5 rounded-full text-sm font-bold transition-all',
              viewMode === 'full'
                ? 'bg-white/25 text-white shadow-inner'
                : 'text-white/70 hover:text-white',
            )}
          >
            Photo entière
          </button>
        </div>
      )}

      {/* Nav arrows */}
      {sortedMediaItems.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Photo précédente"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 p-3 z-[100001] transition-colors"
            onClick={handlePrev}
          >
            <ChevronLeft size={40} />
          </button>
          <button
            type="button"
            aria-label="Photo suivante"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 p-3 z-[100001] transition-colors"
            onClick={handleNext}
          >
            <ChevronRight size={40} />
          </button>
        </>
      )}

      {/* Polaroid card container (plus large en mode photo entière) */}
      <div
        className={cn(
          'relative flex-1 w-full flex items-center justify-center min-h-0 overflow-hidden px-4',
          viewMode === 'diapo' ? 'max-w-md md:max-w-lg lg:max-w-xl' : 'max-w-[95vw]',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence initial={false} custom={slideDirection} mode="popLayout">
          <motion.div
            key={selectedIndex}
            custom={slideDirection}
            variants={polaroidVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 180, damping: 26 }}
            drag={!isFlipped && sortedMediaItems.length > 1 ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={(_, info) => {
              const power = Math.abs(info.offset.x) * Math.abs(info.velocity.x)
              if (power > 5000 || Math.abs(info.offset.x) > 80) {
                paginate(info.offset.x > 0 ? -1 : 1)
              }
            }}
            className={cn(
              'w-full cursor-grab active:cursor-grabbing select-none flex items-center justify-center',
              viewMode === 'full' ? 'max-w-[95vw]' : '',
            )}
            style={{ maxHeight: '85vh' }}
          >
            <div
              className={cn(
                'relative w-full transition-transform duration-700 ease-in-out',
                viewMode === 'diapo'
                  ? 'bg-white shadow-2xl rounded-sm p-3 sm:p-4 pb-16 sm:pb-20'
                  : 'inline-flex max-h-[85vh] max-w-[95vw] items-center justify-center',
              )}
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                maxHeight: '85vh',
                ...(viewMode === 'diapo'
                  ? { aspectRatio: '4/5' }
                  : {}),
              }}
            >
              {/* FRONT FACE — image */}
              {viewMode === 'diapo' ? (
                <div
                  className="absolute overflow-hidden bg-stone-100 top-3 left-3 right-3 bottom-16 sm:top-4 sm:left-4 sm:right-4 sm:bottom-20"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  {current.type === 'video' ? (
                    <video
                      src={current.url}
                      controls
                      autoPlay
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getOptimizedImageUrl(current.url, { width: displayWidth })}
                      alt={`Photo ${selectedIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              ) : (
                /* Mode photo entière : bordure blanche épaisse uniquement autour de la photo */
                <div
                  className="relative rounded-sm border-[10px] border-white bg-white shadow-2xl inline-block max-h-[85vh] max-w-[95vw] overflow-hidden"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  {current.type === 'video' ? (
                    <video
                      src={current.url}
                      controls
                      autoPlay
                      className="block max-h-[85vh] max-w-[95vw] object-contain"
                      style={{ maxHeight: 'calc(85vh - 20px)', maxWidth: 'calc(95vw - 20px)' }}
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getOptimizedImageUrl(current.url, { width: displayWidth })}
                      alt={`Photo ${selectedIndex + 1}`}
                      className="block max-h-[85vh] max-w-[95vw] object-contain"
                      style={{ maxHeight: 'calc(85vh - 20px)', maxWidth: 'calc(95vw - 20px)' }}
                    />
                  )}
                  {current.note && (
                    <div className="absolute bottom-3 right-3 z-10">
                      <button
                        onClick={() => setIsFlipped(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-black/60 hover:bg-black/80 text-white rounded-full text-xs font-bold transition-all backdrop-blur-sm border border-white/20"
                      >
                        <StickyNote size={14} />
                        <span>Lire la note</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* FRONT BOTTOM — Lire la note (diapo only) */}
              {viewMode === 'diapo' && current.note && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 px-4 sm:px-6 z-10 flex items-center justify-end"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <button
                    onClick={() => setIsFlipped(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-full text-xs font-bold transition-all shadow-sm hover:scale-105 active:scale-95"
                  >
                    <StickyNote size={14} />
                    <span>Lire la note</span>
                  </button>
                </div>
              )}

              {/* BACK FACE — note */}
              <div
                className="absolute inset-0 rounded-sm overflow-hidden flex flex-col items-center justify-center p-8 shadow-inner"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  background:
                    'linear-gradient(145deg, #fef3c7 0%, #fffbeb 30%, #fefce8 60%, #fef9c3 100%)',
                }}
              >
                <div
                  className="absolute inset-0 opacity-[0.06]"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(0deg, transparent, transparent 31px, #92400e 31px, #92400e 32px)',
                  }}
                />
                <div className="relative z-10 max-w-md text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 text-amber-600 rounded-full mb-6 shadow-sm">
                    <StickyNote size={24} />
                  </div>
                  <p className="text-xl md:text-2xl font-serif text-stone-800 leading-relaxed italic">
                    &ldquo;
                    {current.note || 'Pas de note pour cette photo.'}
                    &rdquo;
                  </p>
                  <p className="mt-6 text-sm text-stone-500 font-bold uppercase tracking-wider">
                    — {senderName}
                  </p>
                </div>
                <div className="absolute top-4 right-4 opacity-20">
                  <div className="w-16 h-20 border-2 border-dashed border-amber-800 rounded-sm flex items-center justify-center">
                    <span className="text-2xl">📮</span>
                  </div>
                </div>
                <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 flex justify-center z-20">
                  <button
                    onClick={() => setIsFlipped(false)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-full text-sm font-bold shadow-lg transition-all hover:scale-105 active:scale-95"
                  >
                    <StickyNote size={14} />
                    <span>Voir la photo</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Swipe hint */}
      {sortedMediaItems.length > 1 && (
        <motion.p
          initial={{ opacity: 0.7 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-20 text-white/40 text-xs font-medium md:hidden pointer-events-none"
        >
          ← Glissez pour naviguer →
        </motion.p>
      )}
    </motion.div>
  )
}
