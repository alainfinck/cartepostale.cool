'use client'

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MediaItem } from '@/types'
import { ChevronLeft, ChevronRight, X, StickyNote, MapPin, RotateCw, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getOptimizedImageUrl, DISPLAY_MAX_WIDTH } from '@/lib/image-processing'

import dynamic from 'next/dynamic'
import { useSessionId } from '@/hooks/useSessionId'
import { getReactions, getUserReactions, toggleReaction } from '@/actions/social-actions'
import { CoolMode } from '@/components/ui/cool-mode'

const MiniMap = dynamic(() => import('@/components/postcard/MiniMap'), { ssr: false })

export interface AlbumPolaroidLightboxProps {
  mediaItems: MediaItem[]
  senderName: string
  initialIndex?: number
  onClose: () => void
  postcardId?: number
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
  postcardId,
  extraTopLeft,
}: AlbumPolaroidLightboxProps) {
  const [selectedIndex, setSelectedIndex] = useState(
    Math.min(initialIndex, Math.max(0, mediaItems.length - 1)),
  )
  const [isFlipped, setIsFlipped] = useState(false)
  const [slideDirection, setSlideDirection] = useState(0)

  const sessionId = useSessionId()
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [userReactions, setUserReactions] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!postcardId || !sessionId) return
    const load = async () => {
      const [reactionsData, userReactionsData] = await Promise.all([
        getReactions(postcardId),
        getUserReactions(postcardId, sessionId),
      ])
      setCounts(reactionsData.counts)
      setUserReactions(userReactionsData)
    }
    load()
  }, [postcardId, sessionId])

  const handleToggleReaction = async (emoji: string) => {
    if (!postcardId || !sessionId) return

    const wasActive = userReactions[emoji]
    const currentCount = counts[emoji] || 0
    const newCount = wasActive ? currentCount - 1 : currentCount + 1

    // Optimistic update
    setCounts((prev) => ({ ...prev, [emoji]: newCount }))
    setUserReactions((prev) => {
      const next = { ...prev }
      if (!wasActive) next[emoji] = true
      else delete next[emoji]
      return next
    })

    try {
      const result = await toggleReaction(postcardId, emoji, sessionId)
      setCounts((prev) => ({ ...prev, [emoji]: result.newCount }))
      setUserReactions((prev) => {
        const next = { ...prev }
        if (result.added) next[emoji] = true
        else delete next[emoji]
        return next
      })
    } catch {
      // Revert
      setCounts((prev) => ({ ...prev, [emoji]: currentCount }))
      setUserReactions((prev) => {
        const next = { ...prev }
        if (wasActive) next[emoji] = true
        else delete next[emoji]
        return next
      })
    }
  }
  const [viewMode, setViewMode] = useState<'diapo' | 'full'>('full')
  const [displayWidth, setDisplayWidth] = useState(DISPLAY_MAX_WIDTH)

  useEffect(() => {
    const updateWidth = () => {
      const w =
        typeof window !== 'undefined'
          ? window.innerWidth * (window.devicePixelRatio || 1)
          : DISPLAY_MAX_WIDTH
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

  useEffect(() => {
    // Preload all images
    sortedMediaItems.forEach((item) => {
      if (item.type !== 'video' && item.url) {
        const img = new Image()
        img.src = getOptimizedImageUrl(item.url, { width: displayWidth })
      }
    })
  }, [sortedMediaItems, displayWidth])

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
            extraTopLeft
              ? 'top-10 left-6 md:top-12 md:left-12 mt-14 md:mt-0 md:left-48'
              : 'top-10 left-6 md:top-12 md:left-12',
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
          viewMode === 'diapo'
            ? 'scale-90 sm:scale-100 max-w-[85vw] sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl'
            : 'max-w-[95vw]',
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
                  ? 'bg-white shadow-2xl rounded-sm p-2.5 sm:p-4 pb-10 sm:pb-16'
                  : 'inline-flex max-h-[85vh] max-w-[95vw] items-center justify-center',
              )}
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                maxHeight: '85vh',
              }}
            >
              {/* FRONT FACE — image */}
              {viewMode === 'diapo' ? (
                <div
                  className="relative overflow-hidden bg-stone-100"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  {current.type === 'video' ? (
                    <video
                      src={current.url}
                      controls
                      playsInline
                      muted
                      autoPlay
                      className="w-full h-auto block"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getOptimizedImageUrl(current.url, { width: displayWidth })}
                      alt={`Photo ${selectedIndex + 1}`}
                      className="w-full h-auto block"
                    />
                  )}
                  {/* Diapo Note Overlay directly on the photo */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                    {current.location && (
                      <div className="flex items-center gap-1.5 text-white/90 text-xs font-semibold mb-2">
                        <MapPin size={12} className="text-teal-400" />
                        <span className="truncate">{current.location}</span>
                      </div>
                    )}
                    {current.note && (
                      <div className="group/note">
                        <p className="text-white text-sm leading-relaxed line-clamp-2 md:line-clamp-3">
                          {current.note}
                        </p>
                        <button
                          onClick={() => setIsFlipped(true)}
                          className="mt-2 flex items-center gap-1 text-teal-300 hover:text-teal-200 text-xs font-bold transition-colors opacity-100"
                        >
                          <RotateCw size={12} />
                          <span>Voir où ça a été pris</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Polaroid Like Button */}
                  <div className="absolute top-4 right-4 z-40">
                    <CoolMode
                      options={{
                        particle: '❤️',
                        size: 32,
                        particleCount: 6,
                        effect: 'balloon',
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleReaction('❤️')
                        }}
                        className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-md shadow-xl border border-white/50 flex items-center justify-center transition-all hover:scale-110 active:scale-90 group/heart"
                      >
                        <Heart
                          size={24}
                          className={cn(
                            'transition-all duration-300',
                            userReactions['❤️']
                              ? 'fill-red-500 text-red-500 scale-110'
                              : 'text-stone-800',
                          )}
                          strokeWidth={userReactions['❤️'] ? 0 : 2}
                        />
                        {counts['❤️'] > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md border border-white">
                            {counts['❤️']}
                          </span>
                        )}
                      </button>
                    </CoolMode>
                  </div>
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
                      playsInline
                      muted
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
                  {/* Entire Photo Note Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                    {current.location && (
                      <div className="flex items-center gap-1.5 text-white/90 text-xs font-semibold mb-2">
                        <MapPin size={12} className="text-teal-400" />
                        <span className="truncate">{current.location}</span>
                      </div>
                    )}
                    {current.note && (
                      <div className="max-w-xl">
                        <p className="text-white text-sm leading-relaxed line-clamp-2 md:line-clamp-3">
                          {current.note}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* FRONT BOTTOM — (diapo only, empty space to allow for authentic look since note is inside) */}
              {viewMode === 'diapo' && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-10 sm:h-16 px-3 sm:px-6 z-10 flex items-center justify-end"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <button
                    onClick={() => setIsFlipped(true)}
                    className="flex-none flex items-center gap-2 px-3 py-1.5 bg-stone-100/50 hover:bg-stone-200 text-stone-600 rounded-full text-[10px] uppercase font-bold tracking-widest transition-all shadow-sm hover:scale-105 active:scale-95 border border-stone-200"
                    title="Voir au dos"
                  >
                    <RotateCw size={12} />
                    <span>Tourner</span>
                  </button>
                </div>
              )}

              {/* BACK FACE — Map / localisation */}
              <div
                className="absolute inset-0 rounded-sm overflow-hidden flex flex-col p-4 bg-[#fdfbf7] shadow-inner"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  background: 'linear-gradient(145deg, #fdfbf7 0%, #f9f6ef 50%, #f4eee2 100%)',
                }}
              >
                <div
                  className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(45deg, #886240 0px, #886240 1px, transparent 1px, transparent 10px)',
                  }}
                />

                {/* Header dos */}
                <div className="w-full flex justify-between items-start mb-4 relative z-10 px-2 pt-2">
                  <div className="flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 flex items-center gap-1.5">
                      <MapPin size={10} className="text-teal-500" />
                      Lieu de prise de vue
                    </p>
                    <h3 className="text-lg md:text-xl font-serif text-stone-800 font-bold leading-tight line-clamp-2">
                      {current.location || 'Localisation inconnue'}
                    </h3>
                  </div>
                  <div className="opacity-40">
                    <div className="w-12 h-14 border-2 border-dashed border-stone-400 rounded-sm flex items-center justify-center bg-[#fdfbf7]">
                      <span className="text-xs uppercase font-bold text-stone-300 transform -rotate-12">
                        POST
                      </span>
                    </div>
                  </div>
                </div>

                {/* Map Container */}
                <div className="flex-1 w-full bg-stone-200 rounded-md overflow-hidden relative border border-stone-300 shadow-inner z-10 flex items-center justify-center">
                  {current.exif &&
                  (current.exif as any).latitude &&
                  (current.exif as any).longitude ? (
                    <div className="absolute inset-0">
                      {/* Using dynamic import or standard MiniMap depending on how Leaflet handles it */}
                      <MiniMap
                        coords={{
                          lat: (current.exif as any).latitude,
                          lng: (current.exif as any).longitude,
                        }}
                        zoom={12}
                      />
                    </div>
                  ) : (
                    <p className="text-stone-500 font-medium text-sm flex flex-col items-center gap-2">
                      <MapPin size={24} className="text-teal-600/50" />
                      <span>Coordonnées GPS absentes</span>
                    </p>
                  )}
                </div>

                {/* Note complete (if it was clamped) */}
                {current.note && (
                  <div className="mt-4 px-2 w-full relative z-10 text-center">
                    <p className="text-sm font-serif text-stone-700 leading-relaxed italic line-clamp-3">
                      &ldquo;{current.note}&rdquo;
                    </p>
                  </div>
                )}

                {/* Return button */}
                <div className="mt-4 flex justify-center pb-2 relative z-10">
                  <button
                    onClick={() => setIsFlipped(false)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-full text-sm font-bold shadow-lg transition-all hover:scale-105 active:scale-95"
                  >
                    <RotateCw size={14} className="transform scale-x-[-1]" />
                    <span>Retourner</span>
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
