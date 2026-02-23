'use client'

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { MediaItem } from '@/types'
import {
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  StickyNote,
  User,
  Heart,
  Send,
  Bookmark,
  MoreHorizontal,
  Flag,
  Share2,
  Link2,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { CoolMode } from '@/components/ui/cool-mode'
import ShimmerButton from '@/components/ui/shimmer-button'
import { useSessionId } from '@/hooks/useSessionId'
import { getReactions, getUserReactions, toggleReaction } from '@/actions/social-actions'
import { cn } from '@/lib/utils'

interface PhotoFeedProps {
  mediaItems: MediaItem[]
  senderName: string
  postcardId?: number
  postcardDate?: string
}

const InstaCard = ({
  item,
  index,
  totalCount,
  senderName,
  postcardId,
  sessionId,
  canShowReactions,
  counts,
  userReactions,
  onReactionUpdate,
  onImageClick,
}: {
  item: MediaItem
  index: number
  totalCount: number
  senderName: string
  postcardId?: number
  sessionId?: string
  canShowReactions: boolean
  counts: Record<string, number>
  userReactions: Record<string, boolean>
  onReactionUpdate: (emoji: string, added: boolean, newCount: number) => void
  onImageClick: () => void
}) => {
  const [lastClick, setLastClick] = useState(0)
  const [moreOpen, setMoreOpen] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false)
      }
    }
    if (moreOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [moreOpen])

  const handleCopyLink = () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    navigator.clipboard?.writeText(url).then(() => setMoreOpen(false))
  }

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Carte postale',
          url: window.location.href,
          text: `Photo de ${senderName}`,
        })
        setMoreOpen(false)
      } catch {
        handleCopyLink()
      }
    } else {
      handleCopyLink()
    }
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    const now = Date.now()
    if (now - lastClick < 300) {
      if (!userReactions['❤️']) {
        handleToggleReaction('❤️')
      }
    }
    setLastClick(now)
  }

  const handleToggleReaction = async (emoji: string) => {
    if (!postcardId || !sessionId) return

    const wasActive = userReactions[emoji]
    const currentCount = counts[emoji] || 0
    onReactionUpdate(emoji, !wasActive, wasActive ? currentCount - 1 : currentCount + 1)

    try {
      const result = await toggleReaction(postcardId, emoji, sessionId)
      onReactionUpdate(emoji, result.added, result.newCount)
    } catch {
      onReactionUpdate(emoji, wasActive, currentCount)
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex flex-col bg-white border border-stone-200 rounded-lg overflow-hidden shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-amber-400 to-fuchsia-600">
            <div className="w-full h-full rounded-full bg-white p-[1.5px]">
              <div className="w-full h-full rounded-full bg-stone-100 flex items-center justify-center overflow-hidden">
                <User size={16} className="text-stone-400" />
              </div>
            </div>
          </div>
          <span className="font-semibold text-sm text-stone-900">{senderName}</span>
        </div>
        <div className="relative" ref={moreRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setMoreOpen((v) => !v)
            }}
            className="text-stone-900 p-1 rounded hover:bg-stone-100 transition-colors"
            aria-label="Plus d'options"
          >
            <MoreHorizontal size={20} />
          </button>
          <AnimatePresence>
            {moreOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-1 py-1 min-w-[180px] bg-white border border-stone-200 rounded-lg shadow-lg z-50"
              >
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50"
                >
                  <Share2 size={16} />
                  Partager
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50"
                >
                  <Link2 size={16} />
                  Copier le lien
                </button>
                <button
                  type="button"
                  onClick={() => setMoreOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-stone-500 hover:bg-stone-50"
                >
                  <Flag size={16} />
                  Signaler
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Image */}
      <div
        className="relative w-full aspect-square bg-stone-100 cursor-pointer"
        onClick={onImageClick}
        onDoubleClick={handleDoubleClick}
      >
        {item.type === 'video' ? (
          <video
            src={item.url}
            className="w-full h-full object-cover"
            playsInline
            muted
            preload="metadata"
          />
        ) : (
          <Image
            src={item.url}
            alt={`Photo ${index + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 470px) 100vw, 470px"
          />
        )}
      </div>

      {/* Actions + reactions */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3 flex-wrap">
            <CoolMode
              options={{
                particle: '❤️',
                size: 24,
                loop: false,
                speed: 0.25,
                gravity: 0.1,
                particleCount: 3,
                effect: 'balloon',
              }}
            >
              <button
                onClick={() => handleToggleReaction('❤️')}
                className="flex items-center gap-1.5 transition-transform duration-300 ease-out hover:scale-110 active:scale-95"
              >
                <Heart
                  size={24}
                  className={cn(
                    'transition-all duration-500 ease-out shrink-0',
                    userReactions['❤️'] ? 'fill-red-500 text-red-500 scale-110' : 'text-stone-900',
                  )}
                  strokeWidth={userReactions['❤️'] ? 0 : 2}
                />
                {canShowReactions && (counts['❤️'] ?? 0) > 0 && (
                  <span className="text-sm font-semibold text-stone-700 tabular-nums">
                    {counts['❤️']}
                  </span>
                )}
              </button>
            </CoolMode>
            <button
              className="hover:text-stone-600 transition-colors"
              type="button"
              aria-label="Envoyer"
            >
              <Send size={24} className="text-stone-900 -mt-1 rotate-12" />
            </button>
            {canShowReactions &&
              ['🔥', '😂', '😮'].map((emoji) => {
                const n = counts[emoji] ?? 0
                return (
                  <CoolMode
                    key={emoji}
                    options={{
                      particle: emoji,
                      loop: false,
                      speed: 0.25,
                      gravity: 0.1,
                      particleCount: 2,
                      effect: 'balloon',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleReaction(emoji)}
                      className={cn(
                        'flex items-center gap-1.5 text-lg transition-all duration-300 ease-out hover:scale-110 active:scale-95 opacity-70 hover:opacity-100',
                        userReactions[emoji] && 'opacity-100 scale-110',
                      )}
                    >
                      <span>{emoji}</span>
                      {n > 0 && (
                        <span className="text-sm font-semibold text-stone-700 tabular-nums">
                          {n}
                        </span>
                      )}
                    </button>
                  </CoolMode>
                )
              })}
          </div>
          <button
            type="button"
            className="hover:text-stone-600 transition-colors"
            aria-label="Enregistrer"
          >
            <Bookmark size={24} className="text-stone-900" />
          </button>
        </div>

        {item.note != null && String(item.note).trim() !== '' && (
          <div className="mb-2">
            <span className="font-semibold text-stone-900 text-sm mr-2">{senderName}</span>
            <span className="text-stone-700 text-sm">{String(item.note).trim()}</span>
          </div>
        )}

        <div className="text-sm font-semibold text-stone-900 mb-1">
          {(counts['❤️'] || 0) + (counts['🔥'] || 0) + (counts['😂'] || 0) > 0 ? (
            <span>{Object.values(counts).reduce((a, b) => a + b, 0)} J&apos;aime</span>
          ) : (
            <span className="text-stone-500 font-normal">Soyez le premier à aimer</span>
          )}
        </div>

        <div className="text-[10px] uppercase text-stone-500 font-medium mt-1">
          Photo {index + 1} sur {totalCount}
          {item.exif?.dateTime && (
            <>
              {' • '}
              {new Date(item.exif.dateTime).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </>
          )}
        </div>
      </div>
    </motion.article>
  )
}

export default function PhotoFeed({
  mediaItems,
  senderName,
  postcardId,
  postcardDate,
}: PhotoFeedProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isFlipped, setIsFlipped] = useState(false)
  const [slideDirection, setSlideDirection] = useState(0)
  const [viewMode, setViewMode] = useState<'diapo' | 'full'>('diapo')

  const sessionId = useSessionId()
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [userReactions, setUserReactions] = useState<Record<string, boolean>>({})
  const [reactionsLoaded, setReactionsLoaded] = useState(false)

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
    if (!postcardId || !sessionId) return
    const load = async () => {
      const [reactionsData, userReactionsData] = await Promise.all([
        getReactions(postcardId),
        getUserReactions(postcardId, sessionId),
      ])
      setCounts(reactionsData.counts)
      setUserReactions(userReactionsData)
      setReactionsLoaded(true)
    }
    load()
  }, [postcardId, sessionId])

  const handleReactionUpdate = useCallback((emoji: string, added: boolean, newCount: number) => {
    setCounts((prev) => ({ ...prev, [emoji]: newCount }))
    setUserReactions((prev) => {
      const next = { ...prev }
      if (added) next[emoji] = true
      else delete next[emoji]
      return next
    })
  }, [])

  useEffect(() => {
    setIsFlipped(false)
  }, [selectedIndex])

  const paginate = useCallback(
    (direction: number) => {
      setSlideDirection(direction)
      setIsFlipped(false)
      setSelectedIndex((prev) => {
        if (prev === null) return null
        return direction === 1
          ? (prev + 1) % sortedMediaItems.length
          : (prev - 1 + sortedMediaItems.length) % sortedMediaItems.length
      })
    },
    [sortedMediaItems.length],
  )

  useEffect(() => {
    if (selectedIndex === null) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedIndex(null)
      } else if (e.key === 'ArrowLeft') {
        paginate(-1)
      } else if (e.key === 'ArrowRight') {
        paginate(1)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [selectedIndex, paginate])

  if (!sortedMediaItems || sortedMediaItems.length === 0) return null

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    paginate(1)
  }

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    paginate(-1)
  }

  const canShowReactions = Boolean(postcardId && sessionId && reactionsLoaded)

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

  return (
    <section
      id="photo-feed"
      aria-labelledby="photo-feed-heading"
      className="w-full max-w-xl mx-auto mt-12 mb-20 px-3 sm:px-4 flex flex-col items-center overflow-x-hidden min-w-0"
    >
      <h2
        id="photo-feed-heading"
        className="w-full max-w-[470px] mx-auto mb-6 text-center text-stone-700 font-serif text-xl sm:text-2xl font-bold"
      >
        Album photo{senderName ? ` de ${senderName}` : ''}
      </h2>
      {!isVisible ? (
        <div className="text-center py-10 w-full max-w-full min-w-0">
          <CoolMode>
            <ShimmerButton
              onClick={() => {
                setIsVisible(true)
                requestAnimationFrame(() => {
                  requestAnimationFrame(() => {
                    document.getElementById('photo-feed')?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                    })
                  })
                })
              }}
              shimmerColor="#ffffff"
              shimmerSize="0.1em"
              shimmerDuration="2.5s"
              borderRadius="16px"
              background="linear-gradient(135deg, #09090b 0%, #18181b 100%)"
              className="w-full max-w-full min-w-0 bg-stone-950 px-4 py-6 sm:px-12 sm:py-8 group transition-all hover:scale-105 active:scale-95 shadow-2xl"
            >
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                <Sparkles className="w-5 h-5 text-emerald-400 group-hover:animate-pulse shrink-0" />
                <span className="text-white font-bold text-sm sm:text-lg uppercase tracking-widest whitespace-normal text-center">
                  Afficher l&apos;album photo, cliquez ici
                </span>
              </div>
            </ShimmerButton>
          </CoolMode>
          <p className="text-stone-400 mt-6 text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 break-words px-1">
            Découvrir les souvenirs partagés
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="w-full flex flex-col gap-6"
        >
          {/* Timeline Layout */}
          <div className="relative w-full max-w-[470px] mx-auto">
            {/* Timeline date header */}
            {postcardDate && (
              <div className="flex items-center gap-3 mb-8 pl-0.5">
                <div className="w-3.5 h-3.5 rounded-full bg-teal-500 shadow-sm shadow-teal-200 ring-4 ring-teal-50 shrink-0" />
                <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                  {postcardDate}
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-teal-200 to-transparent" />
              </div>
            )}

            {/* Timeline items */}
            <div className="relative pl-7">
              {/* Vertical timeline line */}
              <div className="absolute left-[6px] top-0 bottom-0 w-px bg-gradient-to-b from-teal-200 via-stone-200 to-transparent" />

              <div className="flex flex-col gap-10">
                {sortedMediaItems.map((item, index) => (
                  <div key={item.id} className="relative">
                    {/* Timeline dot */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.2, type: 'spring', stiffness: 300 }}
                      className="absolute -left-7 top-5 w-[13px] h-[13px] rounded-full bg-white border-2 border-teal-300 shadow-sm z-10"
                    />

                    {/* Date/label for this item */}
                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      {item.exif?.dateTime ? (
                        <span className="text-teal-600">
                          {new Date(item.exif.dateTime).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      ) : (
                        <span>Souvenir {index + 1}</span>
                      )}
                    </div>

                    <InstaCard
                      item={item}
                      index={index}
                      totalCount={sortedMediaItems.length}
                      senderName={senderName}
                      postcardId={postcardId}
                      sessionId={sessionId}
                      canShowReactions={canShowReactions}
                      counts={counts}
                      userReactions={userReactions}
                      onReactionUpdate={handleReactionUpdate}
                      onImageClick={() => setSelectedIndex(index)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline end dot */}
            <div className="flex items-center gap-3 mt-8 pl-0.5">
              <div className="w-2.5 h-2.5 rounded-full bg-stone-300 shrink-0" />
              <span className="text-[10px] font-medium text-stone-400 uppercase tracking-wider">
                Fin de l&apos;album
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Fullscreen Polaroid Lightbox with swipe — rendered in portal so backdrop covers navbar & scroll-to-top */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {selectedIndex !== null && (
              <motion.div
                key="lightbox-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[99999] bg-black/98 backdrop-blur-2xl flex flex-col items-center justify-center overflow-hidden min-h-screen"
                onClick={() => setSelectedIndex(null)}
              >
                {/* Close button */}
                <button
                  type="button"
                  aria-label="Fermer (Échap)"
                  className="absolute top-10 right-6 md:top-12 md:right-12 z-[100001] p-3 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white border border-white/20 transition-all shadow-2xl backdrop-blur-md"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedIndex(null)
                  }}
                >
                  <X size={32} strokeWidth={2} />
                </button>

                {/* Toggle diapo / image entière */}
                {sortedMediaItems[selectedIndex]?.type !== 'video' && (
                  <button
                    type="button"
                    aria-label={viewMode === 'diapo' ? 'Afficher image entière' : 'Afficher en diapo'}
                    className="absolute top-10 left-6 md:top-12 md:left-12 z-[100001] p-3 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white border border-white/20 transition-all shadow-2xl backdrop-blur-md flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      setViewMode((m) => (m === 'diapo' ? 'full' : 'diapo'))
                    }}
                  >
                    {viewMode === 'diapo' ? (
                      <>
                        <Maximize2 size={24} />
                        <span className="text-sm font-medium hidden sm:inline">Image entière</span>
                      </>
                    ) : (
                      <>
                        <Minimize2 size={24} />
                        <span className="text-sm font-medium hidden sm:inline">Diapo</span>
                      </>
                    )}
                  </button>
                )}

                {/* Nav arrows (side only, no dots) */}
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

                {/* Polaroid card container — centered vertically */}
                <div
                  className="relative flex-1 w-full max-w-md md:max-w-lg lg:max-w-xl flex items-center justify-center min-h-0 overflow-hidden px-4"
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
                        viewMode === 'full' && 'max-w-2xl',
                      )}
                      style={{ maxHeight: '85vh' }}
                    >
                      {/* Polaroid frame — diapo: crop 4/5 + bande basse; full: marge blanche uniforme */}
                      <div
                        className={cn(
                          'relative w-full transition-transform duration-700 ease-in-out bg-white shadow-2xl rounded-sm',
                          viewMode === 'diapo' ? 'p-3 sm:p-4 pb-16 sm:pb-20' : 'p-6 sm:p-8',
                        )}
                        style={{
                          transformStyle: 'preserve-3d',
                          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                          maxHeight: '85vh',
                          ...(viewMode === 'diapo'
                            ? { aspectRatio: '4/5' }
                            : {
                                maxWidth: 'min(90vw, 900px)',
                                minHeight: '70vh',
                                height: '85vh',
                              }),
                        }}
                      >
                        {/* FRONT FACE — image : diapo = zone 4/5, full = marge uniforme */}
                        <div
                          className={cn(
                            'absolute overflow-hidden',
                            viewMode === 'diapo' ? 'bg-stone-100' : 'bg-white',
                            viewMode === 'diapo'
                              ? 'top-3 left-3 right-3 bottom-16 sm:top-4 sm:left-4 sm:right-4 sm:bottom-20'
                              : 'top-6 left-6 right-6 bottom-6 sm:top-8 sm:left-8 sm:right-8 sm:bottom-8',
                          )}
                          style={{ backfaceVisibility: 'hidden' }}
                        >
                          {sortedMediaItems[selectedIndex].type === 'video' ? (
                            <video
                              src={sortedMediaItems[selectedIndex].url}
                              controls
                              autoPlay
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Image
                              src={sortedMediaItems[selectedIndex].url}
                              alt={`Full photo ${selectedIndex + 1}`}
                              fill
                              className={viewMode === 'diapo' ? 'object-cover' : 'object-contain'}
                              priority
                            />
                          )}
                        </div>

                        {/* FRONT BOTTOM CONTROLS — diapo: barre en bas; full: bouton flottant sur la marge */}
                        {sortedMediaItems[selectedIndex].note && (
                          <div
                            className={cn(
                              'absolute z-10 flex items-center justify-end',
                              viewMode === 'diapo'
                                ? 'bottom-0 left-0 right-0 h-16 sm:h-20 px-4 sm:px-6'
                                : 'bottom-6 right-6 sm:bottom-8 sm:right-8',
                            )}
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

                    {/* BACK FACE */}
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
                          {sortedMediaItems[selectedIndex].note || 'Pas de note pour cette photo.'}
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

            {/* Swipe hint (mobile only, first time) */}
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
        )}
      </AnimatePresence>,
          document.body,
        )}
    </section>
  )
}
