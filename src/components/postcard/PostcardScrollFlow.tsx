'use client'

import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react'
import { useDragControls } from 'framer-motion'
import { createPortal } from 'react-dom'
import { Postcard } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  Share2,
  Compass,
  Image as ImageIcon,
  Images,
  Map as MapIcon,
  Mail,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  RotateCw,
  Heart,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  CalendarDays,
} from 'lucide-react'
import ARButton from '@/components/ar/ARButton'
import FlipCard from '@/components/ui/FlipCard'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { cn, isCoordinate } from '@/lib/utils'
import { getOptimizedImageUrl } from '@/lib/image-processing'
import {
  getCaptionStyle,
  getCaptionBgColor,
  getCaptionExtraStyle,
  captionPresetHidesBg,
} from '@/lib/caption-style'
import { CoolMode } from '@/components/ui/cool-mode'
import { useSessionId } from '@/hooks/useSessionId'
import { getReactions, getUserReactions, toggleReaction } from '@/actions/social-actions'

// Helper component for smooth image loading in the gallery
const GalleryImage = ({
  item,
  idx,
  onClick,
  onLike,
  isLiked,
  likeCount,
  postcardViews,
}: {
  item: any
  idx: number
  onClick: () => void
  onLike: (e: React.MouseEvent) => void
  isLiked: boolean
  likeCount: number
  postcardViews?: number
}) => {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: (idx % 2) * 0.05 }}
      className="flex flex-col gap-3 group cursor-pointer"
    >
      {/* The "Card" container with metadata below */}
      <div className="flex flex-col gap-2">
        <div
          onClick={onClick}
          className={cn(
            'aspect-square w-full p-1 bg-white shadow-md border border-stone-200/30 rounded-3xl transition-all duration-500 active:scale-95 hover:shadow-xl',
            isLoaded ? 'opacity-100' : 'opacity-0',
          )}
        >
          <div className="w-full h-full relative overflow-hidden rounded-2xl bg-stone-50/50">
            <Image
              src={getOptimizedImageUrl(item.url, { width: 400, fit: 'cover' })}
              alt=""
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className={cn(
                'object-cover transition-all duration-700 ease-out',
                isLoaded ? 'scale-100 opacity-100' : 'scale-110 opacity-0',
              )}
              onLoad={() => setIsLoaded(true)}
            />

            {/* Bouton like en bas à droite, toujours visible, rond plus petit */}
            <div className="absolute bottom-2 right-2 z-10">
              <CoolMode
                options={{
                  particle: '❤️',
                  size: 14,
                  particleCount: 4,
                  effect: 'balloon',
                  loop: false,
                }}
              >
                <button
                  onClick={onLike}
                  className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center transition-all hover:scale-110 active:scale-90"
                >
                  <Heart
                    size={20}
                    className={cn(
                      'transition-all duration-300',
                      isLiked ? 'fill-red-500 text-red-500 scale-110' : 'text-stone-400',
                    )}
                    strokeWidth={isLiked ? 0 : 2.5}
                  />
                  {likeCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[7px] font-bold min-w-[14px] h-3.5 px-0.5 rounded-full flex items-center justify-center shadow-sm border border-white">
                      {likeCount}
                    </span>
                  )}
                </button>
              </CoolMode>
            </div>
          </div>
        </div>

        {/* Description uniquement si présente */}
        {item.note && (
          <div className="px-5 flex flex-col gap-1.5 transition-all duration-500 group-hover:translate-x-1">
            <p className="text-xs font-handwriting text-stone-600 leading-tight italic line-clamp-2">
              {item.note}
            </p>
          </div>
        )}

        {/* Ligne unique : lieu · vues · date */}
        {(item.location || (postcardViews != null && postcardViews > 0) || item.exif?.dateTime) && (
          <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-stone-50/90 border border-stone-200/40 text-[10px] text-stone-600 flex-wrap min-h-0">
            {item.location && (
              <span className="inline-flex items-center gap-1 truncate max-w-full font-medium">
                <MapPin size={10} className="shrink-0 text-teal-500" />
                <span className="truncate">{String(item.location).trim()}</span>
              </span>
            )}
            {item.location && (postcardViews != null || item.exif?.dateTime) && (
              <span className="text-stone-300 select-none font-light">·</span>
            )}
            {postcardViews != null && postcardViews > 0 && (
              <span className="inline-flex items-center gap-1 shrink-0">
                <Eye size={10} className="text-amber-600/90 shrink-0" />
                <span className="font-medium">
                  {postcardViews} {postcardViews === 1 ? 'vue' : 'vues'}
                </span>
              </span>
            )}
            {postcardViews != null && postcardViews > 0 && item.exif?.dateTime && (
              <span className="text-stone-300 select-none font-light">·</span>
            )}
            {item.exif?.dateTime && (
              <span className="inline-flex items-center gap-1 shrink-0">
                <CalendarDays size={10} className="text-stone-500 shrink-0" />
                <span className="font-medium">
                  {new Date(item.exif.dateTime).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </span>
            )}
          </div>
        )}
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

/** Polices disponibles pour le message au verso */
const BACK_MESSAGE_FONTS = [
  {
    id: 'dancing' as const,
    name: 'Dancing Script',
    fontFamily: "'Dancing Script', cursive",
    className: 'font-handwriting',
  },
  {
    id: 'greatVibes' as const,
    name: 'Great Vibes',
    fontFamily: "'Great Vibes', cursive",
    className: 'font-handwriting-greatvibes',
  },
  {
    id: 'parisienne' as const,
    name: 'Parisienne',
    fontFamily: "'Parisienne', cursive",
    className: 'font-handwriting-parisienne',
  },
  {
    id: 'sans' as const,
    name: 'Standard (Sans)',
    fontFamily: 'var(--font-sans), system-ui, sans-serif',
    className: 'font-sans',
  },
  {
    id: 'serif' as const,
    name: 'Classique (Serif)',
    fontFamily: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
    className: 'font-serif',
  },
  {
    id: 'indieFlower' as const,
    name: 'Indie Flower',
    fontFamily: "'Indie Flower', cursive",
    className: 'font-handwriting-indieflower',
  },
  {
    id: 'gochiHand' as const,
    name: 'Gochi Hand',
    fontFamily: "'Gochi Hand', cursive",
    className: 'font-handwriting-gochihand',
  },
]

interface PostcardScrollFlowProps {
  postcard: Postcard
  postcardId?: number
}

export default function PostcardScrollFlow({ postcard, postcardId }: PostcardScrollFlowProps) {
  const {
    senderName,
    date,
    frontImage,
    message,
    location,
    mediaItems = [],
    frontCaption,
    frontCaptionPosition,
    frontEmoji,
    coords,
  } = postcard
  const captionStyle = getCaptionStyle(postcard)
  const captionBgColor = captionPresetHidesBg(postcard.frontCaptionPreset)
    ? 'transparent'
    : getCaptionBgColor(postcard)
  const captionExtraStyle = getCaptionExtraStyle(postcard.frontCaptionPreset)

  const sessionId = useSessionId()
  const [counts, setCounts] = useState<Record<string, number>>({}) // Key: "emoji" or "emoji_mediaItemId"
  const [userReactions, setUserReactions] = useState<Record<string, boolean>>({}) // Key: "emoji" or "emoji_mediaItemId"

  useEffect(() => {
    if (!postcardId || !sessionId) return
    const load = async () => {
      // Load postcard-level reactions
      const [reactionsData, userReactionsData] = await Promise.all([
        getReactions(postcardId),
        getUserReactions(postcardId, sessionId),
      ])

      const newCounts = { ...reactionsData.counts }
      const newUserReactions = { ...userReactionsData }

      // Load reactions for each media item
      if (mediaItems.length > 0) {
        const mediaReactions = await Promise.all(
          mediaItems.map((item) =>
            Promise.all([
              getReactions(postcardId, item.id),
              getUserReactions(postcardId, sessionId, item.id),
            ]),
          ),
        )

        mediaItems.forEach((item, idx) => {
          const [rData, urData] = mediaReactions[idx]
          Object.entries(rData.counts).forEach(([emoji, count]) => {
            newCounts[`${emoji}_${item.id}`] = count
          })
          Object.entries(urData).forEach(([emoji, active]) => {
            newUserReactions[`${emoji}_${item.id}`] = active
          })
        })
      }

      setCounts(newCounts)
      setUserReactions(newUserReactions)
    }
    load()
  }, [postcardId, sessionId, mediaItems])

  const handleToggleReaction = async (emoji: string, mediaItemId?: string) => {
    if (!postcardId || !sessionId) return

    const key = mediaItemId ? `${emoji}_${mediaItemId}` : emoji
    const wasActive = userReactions[key]
    const currentCount = counts[key] || 0
    const newCount = wasActive ? currentCount - 1 : currentCount + 1

    // Optimistic update
    setCounts((prev) => ({ ...prev, [key]: newCount }))
    setUserReactions((prev) => {
      const next = { ...prev }
      if (!wasActive) next[key] = true
      else delete next[key]
      return next
    })

    try {
      const result = await toggleReaction(postcardId, emoji, sessionId, mediaItemId)
      setCounts((prev) => ({ ...prev, [key]: result.newCount }))
      setUserReactions((prev) => {
        const next = { ...prev }
        if (result.added) next[key] = true
        else delete next[key]
        return next
      })
    } catch {
      // Revert on error
      setCounts((prev) => ({ ...prev, [key]: currentCount }))
      setUserReactions((prev) => {
        const next = { ...prev }
        if (wasActive) next[key] = true
        else delete next[key]
        return next
      })
    }
  }

  const [isFlipped, setIsFlipped] = useState(false)
  const [isFrontImageZoomOpen, setIsFrontImageZoomOpen] = useState(false)
  const [isMapModalOpen, setIsMapModalOpen] = useState(false)
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null)
  const [direction, setDirection] = useState(0) // -1 for prev, 1 for next
  const [backTextScale, setBackTextScale] = useState(0.9)
  const [backMessageFont, setBackMessageFont] = useState<
    'dancing' | 'greatVibes' | 'parisienne' | 'sans' | 'serif' | 'indieFlower' | 'gochiHand'
  >('dancing')
  const [isFontMenuOpen, setIsFontMenuOpen] = useState(false)
  const [fontMenuRect, setFontMenuRect] = useState<DOMRect | null>(null)
  const fontMenuAnchorRef = useRef<HTMLDivElement>(null)
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null)
  useEffect(() => {
    setPortalRoot(typeof document !== 'undefined' ? document.body : null)
  }, [])
  useEffect(() => {
    if (!isFrontImageZoomOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFrontImageZoomOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isFrontImageZoomOpen])

  // Position du dropdown polices (pour le portal) et fermeture au clic extérieur
  useEffect(() => {
    if (!isFontMenuOpen) {
      setFontMenuRect(null)
      return
    }
    const el = fontMenuAnchorRef.current
    if (el) setFontMenuRect(el.getBoundingClientRect())
    const onScrollOrResize = () => {
      if (fontMenuAnchorRef.current)
        setFontMenuRect(fontMenuAnchorRef.current.getBoundingClientRect())
    }
    window.addEventListener('scroll', onScrollOrResize, true)
    window.addEventListener('resize', onScrollOrResize)
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true)
      window.removeEventListener('resize', onScrollOrResize)
    }
  }, [isFontMenuOpen])
  useEffect(() => {
    if (!isFontMenuOpen) return
    const onPointerDown = (e: MouseEvent) => {
      const anchor = fontMenuAnchorRef.current
      const target = e.target as Node
      if (anchor?.contains(target)) return
      if (document.querySelector('[data-font-dropdown]')?.contains(target)) return
      setIsFontMenuOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [isFontMenuOpen])
  const [belowMessageFont, setBelowMessageFont] = useState<
    'dancing' | 'greatVibes' | 'parisienne' | 'sans' | 'serif' | 'indieFlower' | 'gochiHand'
  >('dancing')
  const [isBelowFontMenuOpen, setIsBelowFontMenuOpen] = useState(false)
  const [showMapPhotos, setShowMapPhotos] = useState(true)

  const dragControls = useDragControls()
  const messageRef = useRef<HTMLDivElement>(null)
  const albumRef = useRef<HTMLDivElement>(null)
  const mapSectionRef = useRef<HTMLDivElement>(null)
  const socialRef = useRef<HTMLDivElement>(null)

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null> | string) => {
    if (typeof ref === 'string') {
      const el = document.getElementById(ref)
      if (el) {
        const offset = 20
        const bodyRect = document.body.getBoundingClientRect().top
        const elementRect = el.getBoundingClientRect().top
        const elementPosition = elementRect - bodyRect
        const offsetPosition = elementPosition - offset
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
      }
      return
    }
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

  // Listen for keyboard arrows and lock body scroll when slideshow/lightbox is open
  useEffect(() => {
    const isAnyModalOpen = activePhotoIndex !== null || isFrontImageZoomOpen

    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden'
      document.body.classList.add('slideshow-open')
    } else {
      document.body.style.overflow = ''
      document.body.classList.remove('slideshow-open')
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (activePhotoIndex !== null) {
        if (e.key === 'ArrowRight') nextPhoto()
        if (e.key === 'ArrowLeft') prevPhoto()
        if (e.key === 'Escape') setActivePhotoIndex(null)
      } else if (isFrontImageZoomOpen) {
        if (e.key === 'Escape') setIsFrontImageZoomOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (isAnyModalOpen) {
        document.body.style.overflow = ''
        document.body.classList.remove('slideshow-open')
      }
    }
  }, [activePhotoIndex, isFrontImageZoomOpen, nextPhoto, prevPhoto])

  return (
    <div className="flex flex-col min-h-screen bg-transparent text-stone-900 pb-40">
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
      <div className="max-w-5xl mx-auto w-full pt-12 px-2.5 sm:px-4 md:pt-20">
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
        {/* Flippable Hero Postcard Section - Now using the reusable FlipCard component */}
        <section className="relative mb-16" style={{ perspective: '1000px' }}>
          <FlipCard
            isFlipped={isFlipped}
            className="w-full aspect-[4/3] cursor-pointer group"
            innerClassName="rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.15)]"
            springConfig={{ stiffness: 40, damping: 15 }}
            onClick={() => setIsFlipped(!isFlipped)}
            front={
              <div className="relative h-full w-full bg-white p-1.5 md:p-2.5 rounded-2xl border border-white">
                <div className="w-full h-full overflow-hidden rounded-xl relative bg-stone-100">
                  <Image
                    src={getOptimizedImageUrl(frontImage, { width: 1200 })}
                    alt="Postcard Front"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Flip Button Overlay — en haut à droite */}
                  <div className="absolute top-4 right-4 z-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsFlipped(!isFlipped)
                      }}
                      className="bg-black/60 hover:bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-white/20 transition-all active:scale-95 group/btn shadow-xl"
                    >
                      <RotateCw
                        size={14}
                        className="group-hover/btn:rotate-180 transition-transform duration-500"
                      />
                      <span>Retourner la photo</span>
                    </button>
                  </div>

                  {/* Titre à la position encodée pour la carte (pas de message en bas à droite) */}
                  {frontCaption?.trim() && frontCaptionPosition != null && (
                    <div
                      className="absolute z-10 pointer-events-none w-fit max-w-[calc(100%-2rem)] px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-white/40 shadow-lg"
                      style={{
                        left: `${frontCaptionPosition.x}%`,
                        top: `${frontCaptionPosition.y}%`,
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: captionBgColor,
                        ...(postcard.frontCaptionWidth != null && {
                          width: `${postcard.frontCaptionWidth}%`,
                        }),
                      }}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        {frontEmoji && (
                          <span className="text-lg sm:text-xl leading-none shrink-0">
                            {frontEmoji}
                          </span>
                        )}
                        <p
                          className="m-0 font-bold leading-tight tracking-tight break-words text-[10px] sm:text-xs line-clamp-2"
                          style={{
                            fontFamily: captionStyle.fontFamily,
                            fontSize: captionStyle.fontSize,
                            color: captionStyle.color,
                            textShadow:
                              captionStyle.color === '#ffffff' || captionStyle.color === '#000000'
                                ? '0 1px 2px rgba(0,0,0,0.2)'
                                : '0 1px 2px rgba(255,255,255,0.8)',
                            ...captionExtraStyle,
                          }}
                        >
                          {frontCaption}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Localisation en bas à gauche (pas en haut à gauche) */}
                  {location && !isCoordinate(location) && (
                    <div className="absolute left-4 sm:left-6 bottom-4 sm:bottom-6 z-10 bg-white/90 backdrop-blur-md text-teal-900 px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-semibold shadow-lg flex items-center gap-1.5 pointer-events-none">
                      <MapPin size={12} className="text-orange-500 shrink-0" />
                      <span className="normal-case tracking-wide break-words max-w-[160px] sm:max-w-[220px]">
                        {location}
                      </span>
                    </div>
                  )}

                  {/* Loupe en bas à droite : afficher l'image de la carte en grand */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsFrontImageZoomOpen(true)
                    }}
                    className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/70 backdrop-blur-sm hover:bg-white/90 shadow-md border border-stone-200/50 text-stone-600 hover:text-stone-900 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                    aria-label="Voir l'image en grand"
                  >
                    <Search size={16} strokeWidth={2} className="sm:w-[18px] sm:h-[18px]" />
                  </button>
                </div>
              </div>
            }
            back={
              <div className="relative h-full w-full bg-[#fdfaf3] p-5 md:p-10 rounded-2xl border border-stone-200/50 flex flex-col overflow-hidden">
                <div className="flex flex-1 gap-4 md:gap-10 min-h-0">
                  {/* Left Column: Message */}
                  <div className="flex-1 flex flex-col pt-1 overflow-hidden min-h-0">
                    {/* Top Control Bar — hauteur fixe, icônes centrées verticalement, même style pour tous les boutons */}
                    <div className="flex items-center shrink-0 mb-0.5 min-w-0 max-w-full">
                      <div className="flex items-center gap-0 h-8 bg-white/90 sm:bg-white rounded-md sm:rounded-lg border border-stone-200/40 sm:border-stone-200/60 shadow-sm min-w-0 overflow-visible">
                        {/* Taille : icônes - et + */}
                        <div className="flex items-center shrink-0 h-8">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setBackTextScale((s) => Math.max(0.6, Number((s - 0.08).toFixed(2))))
                            }}
                            className="h-8 w-8 min-h-0 flex items-center justify-center rounded-md text-stone-500 hover:text-stone-700 hover:bg-stone-100/80 active:bg-stone-100 transition-colors shrink-0 border-0"
                            title="Réduire la taille"
                          >
                            <Minus size={10} strokeWidth={2.5} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setBackTextScale((s) => Math.min(1.5, Number((s + 0.08).toFixed(2))))
                            }}
                            className="h-8 w-8 min-h-0 flex items-center justify-center rounded-md text-stone-500 hover:text-stone-700 hover:bg-stone-100/80 active:bg-stone-100 transition-colors shrink-0 border-0"
                            title="Agrandir la taille"
                          >
                            <Plus size={10} strokeWidth={2.5} />
                          </button>
                        </div>
                        <div
                          className="relative flex items-center shrink-0 h-8 w-8 sm:w-9"
                          ref={fontMenuAnchorRef}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setIsFontMenuOpen((o) => !o)
                            }}
                            className={cn(
                              'h-8 min-h-0 w-full flex items-center justify-center px-1 rounded-md border-0 transition-all shrink-0',
                              isFontMenuOpen
                                ? 'bg-teal-50 text-teal-700'
                                : 'bg-white hover:bg-stone-50 text-stone-600',
                            )}
                          >
                            <span
                              className="text-[7px] sm:text-[8px] font-bold select-none uppercase tracking-tighter leading-none"
                              style={{
                                fontFamily: BACK_MESSAGE_FONTS.find((f) => f.id === backMessageFont)
                                  ?.fontFamily,
                              }}
                            >
                              Aa
                            </span>
                            <ChevronDown size={8} className="ml-0.5 opacity-50 shrink-0" />
                          </button>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setIsFlipped(!isFlipped)
                          }}
                          className="h-8 w-8 flex items-center justify-center rounded-md bg-white hover:bg-stone-50 text-stone-600 border-0 transition-all active:scale-95 shrink-0 group/btn"
                          title="Retourner la carte"
                        >
                          <RotateCw
                            size={12}
                            className="group-hover/btn:rotate-180 transition-transform duration-500 shrink-0"
                          />
                        </button>
                      </div>
                    </div>
                    {/* Dropdown polices (portal pour ne pas être coupé par overflow) */}
                    {portalRoot &&
                      fontMenuRect != null &&
                      createPortal(
                        <AnimatePresence>
                          {isFontMenuOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              transition={{ duration: 0.15 }}
                              className="fixed w-28 bg-white rounded-lg shadow-xl border border-stone-200 overflow-hidden z-[9998] py-0.5"
                              style={{
                                top: fontMenuRect.bottom + 4,
                                left: fontMenuRect.left,
                              }}
                              data-font-dropdown
                            >
                              {BACK_MESSAGE_FONTS.map((font) => (
                                <button
                                  key={font.id}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setBackMessageFont(font.id)
                                    setIsFontMenuOpen(false)
                                  }}
                                  className={cn(
                                    'w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-left text-[9px] transition-colors',
                                    backMessageFont === font.id
                                      ? 'bg-teal-50 text-teal-700'
                                      : 'hover:bg-stone-50 text-stone-600',
                                  )}
                                >
                                  <span
                                    className="font-bold w-3.5 text-center"
                                    style={{ fontFamily: font.fontFamily }}
                                  >
                                    Aa
                                  </span>
                                  <span className="truncate">{font.name}</span>
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>,
                        portalRoot,
                      )}

                    {/* Text Area */}
                    <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar pr-1">
                      <p
                        className="font-handwriting text-stone-700 leading-relaxed italic whitespace-pre-wrap break-words max-w-full"
                        style={{
                          fontSize: `clamp(0.8125rem, ${1.15 * backTextScale}rem, 1.75rem)`,
                          fontFamily:
                            BACK_MESSAGE_FONTS.find((f) => f.id === backMessageFont)?.fontFamily ??
                            "'Dancing Script', cursive",
                        }}
                      >
                        {message}
                      </p>
                    </div>

                    {/* Signature */}
                    <div
                      className="mt-auto font-handwriting text-teal-700 pt-1 shrink-0"
                      style={{
                        fontSize: `clamp(1rem, ${1.5 * backTextScale}rem, 2rem)`,
                      }}
                    >
                      {senderName}
                    </div>
                  </div>

                  {/* Right Column: Stamp & Address (carte plus large, marges réduites) */}
                  <div className="w-[40%] flex flex-col border-l border-stone-200/50 pl-3 md:pl-6 relative h-full">
                    {/* Digital Poste Stamp */}
                    <div className="self-end mb-2 group z-20">
                      <div className="relative w-10 h-14 md:w-16 md:h-20 bg-[#fdf5e6] p-0.5 md:p-1 border-[1px] border-orange-300/40 transform rotate-2 shadow-sm">
                        <div className="w-full h-full border border-orange-200/50 flex flex-col items-center justify-between p-0.5 bg-white/40">
                          <span className="text-[4px] md:text-[6px] font-bold text-orange-900/60 uppercase text-center leading-tight">
                            Digital Poste
                          </span>
                          <div className="flex-1 flex items-center justify-center opacity-40">
                            <Compass size={12} className="text-orange-900 md:w-4 md:h-4" />
                          </div>
                          <span className="text-[4px] md:text-[6px] font-bold text-orange-900/40">
                            2026
                          </span>
                        </div>
                        <div
                          className="absolute inset-0 border-[2px] border-[#fdfaf3] opacity-30 pointer-events-none"
                          style={{
                            mask: 'conic-gradient(from 45deg, transparent 0deg 90deg, black 90deg 360deg) 0 0/4px 4px round',
                          }}
                        />
                      </div>
                    </div>

                    {/* Circular Postmark (Tampon) */}
                    <div className="absolute top-2 right-12 md:top-4 md:right-24 opacity-60 pointer-events-none transform -rotate-12 z-10">
                      <div className="relative">
                        <svg
                          width="70"
                          height="70"
                          viewBox="0 0 140 140"
                          className="text-stone-800/20 fill-current overflow-visible md:w-[100px] md:h-[100px]"
                        >
                          <circle
                            cx="70"
                            cy="70"
                            r="55"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeDasharray="2 3"
                          />
                          <circle
                            cx="70"
                            cy="70"
                            r="50"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                          <span className="text-[5px] md:text-[7px] font-black tracking-widest text-stone-600 uppercase mb-0.5">
                            POSTAL
                          </span>
                          <div className="h-px w-5 md:w-6 bg-stone-300 my-0.5" />
                          <span className="text-[4px] md:text-[6px] font-black text-teal-700 uppercase leading-none mb-0.5 max-w-[50px] md:max-w-[60px] truncate">
                            {location || 'DESTINATION'}
                          </span>
                          <span className="text-[4px] md:text-[5px] font-serif text-stone-500 italic block">
                            {date || 'FÉVRIER 2026'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Address Lines — texte sur les lignes (compact sur desktop pour laisser place à la carte) */}
                    <div className="flex-initial flex flex-col justify-center gap-1.5 md:gap-2 py-1.5 md:py-2 max-h-[30%] md:max-h-[none] md:shrink-0">
                      <div className="border-b border-stone-200/60 pb-0.5 min-h-[1.25em]">
                        <span className="font-handwriting text-teal-800/80 text-[10px] sm:text-xs md:text-base leading-tight block truncate">
                          À : {postcard.recipientName || 'Family & Friends'}
                        </span>
                      </div>
                      <div className="border-b border-stone-200/60 pb-0.5 min-h-[1.25em]">
                        <span className="font-handwriting text-stone-500/60 text-[8px] md:text-sm leading-tight italic block truncate">
                          {location || 'Quelque part dans le monde'}
                        </span>
                      </div>
                      <div className="border-b border-stone-200/60 pb-0.5 min-h-[1.25em]">
                        <span className="font-handwriting text-stone-400/40 text-[8px] md:text-sm leading-tight italic block">
                          &nbsp;
                        </span>
                      </div>
                    </div>

                    {/* Carte Leaflet (recto) — clic → album, plus large, marges réduites */}
                    <div className="flex-1 min-h-0 mt-1 md:mt-2 mb-0.5 md:mb-1 flex flex-col">
                      <div
                        className="relative w-full flex-1 min-h-[100px] md:min-h-[160px] aspect-[3/2] sm:aspect-[2/1] rounded-lg overflow-hidden border border-stone-200/60 shadow-md group/map cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] bg-stone-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          const albumSection = document.getElementById('postcard-album')
                          if (albumSection) {
                            albumSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                          } else {
                            window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
                          }
                        }}
                      >
                        {coords ? (
                          <div className="absolute inset-0 w-full h-full rounded-lg overflow-hidden z-0">
                            <MiniMap
                              coords={coords}
                              zoom={10}
                              interactive={false}
                              showScale={false}
                              className="w-full h-full rounded-lg"
                            />
                          </div>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-stone-100 text-stone-400 text-[10px] font-bold uppercase tracking-widest">
                            Pas de localisation
                          </div>
                        )}
                        <div className="absolute inset-0 bg-stone-900/5 group-hover/map:bg-transparent transition-colors z-10 pointer-events-none" />
                        <div className="absolute bottom-1 right-1 bg-white/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-[7px] font-bold text-stone-500 uppercase tracking-tighter scale-75 origin-bottom-right z-10 pointer-events-none">
                          Cliquer pour explorer
                        </div>
                        {/* Overlay cliquable pour que le clic aille vers l'album (la carte ne capture pas les events) */}
                        <div className="absolute inset-0 z-20 cursor-pointer" aria-hidden />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
          />{' '}
          {/* Physical shadows */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[95%] h-16 bg-black/10 blur-[60px] rounded-full -z-10" />
        </section>

        {/* Location under the postcard */}
        {location && !isCoordinate(location) && (
          <div className="flex justify-center -mt-10 mb-16 px-4">
            <div className="flex items-center gap-1.5 text-stone-500/80 text-[10px] font-bold uppercase tracking-[0.2em]">
              <MapPin size={10} className="text-teal-500/60" />
              <span>{location}</span>
            </div>
          </div>
        )}

        {/* Message "Paper" Block */}
        <section ref={messageRef} className="mt-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="bg-[#fefaf3] rounded-[2.5rem] p-5 sm:p-6 md:p-10 lg:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-stone-200/40 relative overflow-hidden"
          >
            {/* Header — stylé, texte plus petit sur mobile */}
            <div className="flex items-center mb-8 md:mb-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-stone-100/80 border border-stone-200/60 pl-3 pr-4 py-1.5 md:py-2 border-l-4 border-l-teal-500/60">
                <Mail size={14} className="text-teal-600/80 shrink-0 md:w-4 md:h-4" />
                <h2 className="text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-[0.35em] md:tracking-[0.4em] text-stone-800">
                  Message de {senderName}
                </h2>
              </div>
            </div>

            {/* Font & Style Controls for main message */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setBackTextScale((s) => Math.max(0.6, Number((s - 0.08).toFixed(2))))
                  }
                  className="w-9 h-9 flex items-center justify-center hover:bg-stone-50 text-stone-500 hover:text-teal-600 transition-colors border-r border-stone-100"
                >
                  <Minus size={18} strokeWidth={2.5} />
                </button>
                <span className="px-2 text-xs font-bold text-stone-500 select-none">A</span>
                <button
                  type="button"
                  onClick={() =>
                    setBackTextScale((s) => Math.min(1.5, Number((s + 0.08).toFixed(2))))
                  }
                  className="w-9 h-9 flex items-center justify-center hover:bg-stone-50 text-stone-500 hover:text-teal-600 transition-colors border-l border-stone-100"
                >
                  <Plus size={18} strokeWidth={2.5} />
                </button>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsBelowFontMenuOpen(!isBelowFontMenuOpen)}
                  className={cn(
                    'h-9 flex items-center justify-center px-4 rounded-xl border shadow-sm transition-all',
                    isBelowFontMenuOpen
                      ? 'bg-teal-50 border-teal-200 text-teal-700'
                      : 'bg-white/90 border-stone-200 text-stone-600',
                  )}
                >
                  <span
                    className="text-xs font-bold pt-0.5"
                    style={{
                      fontFamily: BACK_MESSAGE_FONTS.find((f) => f.id === belowMessageFont)
                        ?.fontFamily,
                    }}
                  >
                    Aa
                  </span>
                  <ChevronDown size={14} className="ml-2 opacity-50" />
                </button>
                <AnimatePresence>
                  {isBelowFontMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-stone-200 z-[100] py-1.5"
                    >
                      {BACK_MESSAGE_FONTS.map((font) => (
                        <button
                          key={font.id}
                          onClick={() => {
                            setBelowMessageFont(font.id)
                            setIsBelowFontMenuOpen(false)
                          }}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-stone-50',
                            belowMessageFont === font.id && 'bg-teal-50 text-teal-700',
                          )}
                        >
                          <span
                            className="text-lg font-bold w-6 text-center"
                            style={{ fontFamily: font.fontFamily }}
                          >
                            Aa
                          </span>
                          <span className="text-xs font-medium">{font.name}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Message Body — base plus petite sur mobile */}
            <div
              className="text-lg sm:text-xl md:text-4xl text-stone-700 leading-[1.75] sm:leading-[1.8] md:leading-[1.9] mb-12 whitespace-pre-wrap italic transition-all duration-300"
              style={{
                fontFamily: BACK_MESSAGE_FONTS.find((f) => f.id === belowMessageFont)?.fontFamily,
                fontSize: `clamp(1rem, ${1.8 * backTextScale}rem, 4rem)`,
              }}
            >
              {message}
            </div>

            {/* Signature */}
            <div
              className="text-5xl md:text-6xl text-teal-700 mb-20 decoration-teal-500/10 transition-all duration-300"
              style={{
                fontFamily: BACK_MESSAGE_FONTS.find((f) => f.id === belowMessageFont)?.fontFamily,
                fontSize: `clamp(2rem, ${3 * backTextScale}rem, 6rem)`,
              }}
            >
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

        {/* Map Section */}
        {coords && (
          <section
            ref={mapSectionRef}
            className="mt-16 overflow-hidden -mx-2.5 px-2.5 sm:mx-0 sm:px-0"
          >
            <div className="flex items-center gap-4 mb-6 sm:mb-10 px-0 sm:px-4">
              <div className="w-12 h-px bg-stone-300/50" />
              <h3 className="text-[11px] font-black uppercase tracking-widest text-stone-400 whitespace-nowrap">
                Localisation
              </h3>
              <div className="flex-1 h-px bg-stone-300/50" />
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="aspect-[1/1] sm:aspect-[4/3] bg-white p-1 sm:p-2 rounded-xl sm:rounded-[2rem] shadow-xl border border-stone-200/40 relative group"
            >
              <div className="w-full h-full rounded-lg sm:rounded-3xl overflow-hidden grayscale-[0.2] contrast-[1.1]">
                <MiniMap
                  coords={coords}
                  zoom={10}
                  photoLocations={photoLocations}
                  interactive={true}
                  toggleOutside={true}
                  showPhotos={showMapPhotos}
                  onShowPhotosChange={setShowMapPhotos}
                />
              </div>
            </motion.div>
          </section>
        )}

        {/* Media Album Section */}
        {mediaItems.length > 0 && (
          <section id="postcard-album" ref={albumRef} className="mt-16 mb-4">
            <div className="flex items-center gap-4 mb-10 px-4 py-3 rounded-2xl border border-stone-200/80 bg-stone-50/80 shadow-sm">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-stone-300 to-stone-300/60" />
              <div className="flex items-center gap-2.5 shrink-0">
                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-100/90 text-amber-700 border border-amber-200/60">
                  <Images size={16} strokeWidth={2} className="text-amber-700" />
                </span>
                <h3 className="text-xs font-black uppercase tracking-widest text-stone-600">
                  L&apos;album souvenirs
                </h3>
              </div>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent via-stone-300 to-stone-300/60" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mediaItems.map((item, idx) => (
                <GalleryImage
                  key={item.id || idx}
                  item={item}
                  idx={idx}
                  onClick={() => setActivePhotoIndex(idx)}
                  onLike={(e) => {
                    e.stopPropagation()
                    handleToggleReaction('❤️', item.id)
                  }}
                  isLiked={!!userReactions[`❤️_${item.id}`]}
                  likeCount={counts[`❤️_${item.id}`] || 0}
                  postcardViews={postcard.views}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Barre fixe compacte en bas */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-50">
        <div className="bg-white/80 backdrop-blur-2xl rounded-xl py-1.5 px-2 flex items-center justify-around shadow-[0_12px_40px_rgba(0,0,0,0.15)] border border-white/50">
          <button
            onClick={() => scrollTo(messageRef)}
            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all hover:bg-white/50 active:scale-95 group"
          >
            <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
              <Mail size={14} className="stroke-[2.5]" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest text-stone-500 leading-none">
              Carte
            </span>
          </button>

          <button
            onClick={() => scrollTo(mapSectionRef)}
            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all hover:bg-white/50 active:scale-95 group"
          >
            <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
              <MapIcon size={14} className="stroke-[2.5]" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest text-stone-500 leading-none">
              Localisation
            </span>
          </button>

          <button
            onClick={() => scrollTo('social-section')}
            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all hover:bg-white/50 active:scale-95 group"
          >
            <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
              <MessageCircle size={14} className="stroke-[2.5]" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest text-stone-500 leading-none">
              Message
            </span>
          </button>

          <button
            onClick={() => scrollTo(albumRef)}
            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all hover:bg-white/50 active:scale-95 group"
          >
            <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
              <ImageIcon size={14} className="stroke-[2.5]" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest text-stone-500 leading-none">
              Album
            </span>
          </button>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all hover:bg-white/50 active:scale-95 group"
          >
            <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
              <ChevronUp size={14} className="stroke-[2.5]" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest text-stone-500 leading-none">
              Haut
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
            className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/95 backdrop-blur-lg p-3 md:p-8 touch-none overscroll-none"
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
              {/* Full-screen swipe listener */}
              <div
                className="fixed inset-0 z-0 cursor-grab active:cursor-grabbing"
                onPointerDown={(e) => dragControls.start(e)}
              />

              {/* Previous Button */}
              <button
                onClick={prevPhoto}
                className="fixed left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors p-4 rounded-full hover:bg-white/5 z-[110]"
                aria-label="Photo précédente"
              >
                <ChevronLeft size={48} strokeWidth={1.5} />
              </button>

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
                      const swipe = Math.abs(offset.x) > 50 && Math.abs(velocity.x) > 300
                      if (swipe) {
                        if (offset.x > 0) {
                          prevPhoto()
                        } else {
                          nextPhoto()
                        }
                      }
                    }}
                    dragControls={dragControls}
                    dragListener={false}
                    className="relative bg-white p-0.5 md:p-1 rounded-xl md:rounded-3xl shadow-2xl flex flex-col items-center pointer-events-auto"
                  >
                    <div className="overflow-hidden rounded-lg md:rounded-2xl bg-stone-100 relative group/slide">
                      {mediaItems[activePhotoIndex]?.type === 'video' ? (
                        <video
                          src={mediaItems[activePhotoIndex]?.url}
                          controls
                          playsInline
                          className="max-h-[60dvh] md:max-h-[70dvh] w-auto h-auto block"
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={getOptimizedImageUrl(mediaItems[activePhotoIndex]?.url || '', {
                            width: 1200,
                          })}
                          alt=""
                          className="max-h-[60dvh] md:max-h-[70dvh] w-auto h-auto block object-contain"
                        />
                      )}

                      {/* Photo Like Button inside slideshow */}
                      <div className="absolute bottom-4 right-4 z-[120] pointer-events-auto">
                        <CoolMode
                          options={{
                            particle: '❤️',
                            size: 24,
                            particleCount: 6,
                            effect: 'balloon',
                          }}
                        >
                          <button
                            onClick={() =>
                              handleToggleReaction('❤️', mediaItems[activePhotoIndex]?.id || '')
                            }
                            className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-90"
                          >
                            <Heart
                              size={30}
                              className={cn(
                                'transition-all duration-300',
                                activePhotoIndex !== null &&
                                  userReactions[`❤️_${mediaItems[activePhotoIndex].id}`]
                                  ? 'fill-red-500 text-red-500 scale-110'
                                  : 'text-stone-400',
                              )}
                              strokeWidth={
                                activePhotoIndex !== null &&
                                userReactions[`❤️_${mediaItems[activePhotoIndex].id}`]
                                  ? 0
                                  : 2.5
                              }
                            />
                            {activePhotoIndex !== null &&
                              counts[`❤️_${mediaItems[activePhotoIndex].id}`] > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[7px] font-bold min-w-[14px] h-3.5 px-0.5 rounded-full flex items-center justify-center shadow-sm border border-white">
                                  {counts[`❤️_${mediaItems[activePhotoIndex].id}`]}
                                </span>
                              )}
                          </button>
                        </CoolMode>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Slide Context */}
              <div className="absolute -bottom-16 left-0 right-0 flex items-center justify-between w-full px-6 md:px-12 pointer-events-none">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50 bg-black/20 backdrop-blur-sm px-4 py-1.5 rounded-full">
                    {activePhotoIndex + 1} / {mediaItems.length}
                  </span>
                  {mediaItems[activePhotoIndex].exif?.dateTime && (
                    <span className="text-[11px] font-bold text-orange-200/80 bg-black/20 backdrop-blur-sm px-4 py-1.5 rounded-full flex items-center gap-2">
                      {new Date(mediaItems[activePhotoIndex].exif!.dateTime!).toLocaleDateString(
                        'fr-FR',
                        {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        },
                      )}
                    </span>
                  )}
                </div>
                {mediaItems[activePhotoIndex].location && (
                  <span className="text-[11px] font-bold text-teal-400 flex items-center gap-2 bg-black/20 backdrop-blur-sm px-4 py-1.5 rounded-full">
                    <MapPin size={14} />
                    {String(mediaItems[activePhotoIndex].location).trim()}
                  </span>
                )}
              </div>

              {/* Next Button */}
              <button
                onClick={nextPhoto}
                className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors p-4 rounded-full hover:bg-white/5 z-[110]"
                aria-label="Photo suivante"
              >
                <ChevronRight size={48} strokeWidth={1.5} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox : image de la face avant en grand */}
      {portalRoot &&
        createPortal(
          <AnimatePresence>
            {isFrontImageZoomOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[999] bg-black/95 flex items-center justify-center overflow-auto"
                onClick={() => setIsFrontImageZoomOpen(false)}
                style={{
                  padding:
                    'max(1rem, env(safe-area-inset-top)) max(1rem, env(safe-area-inset-right)) max(1rem, env(safe-area-inset-bottom)) max(1rem, env(safe-area-inset-left))',
                }}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsFrontImageZoomOpen(false)
                  }}
                  className="fixed z-10 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/95 shadow-xl text-stone-700 hover:bg-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900"
                  style={{
                    top: 'max(1rem, env(safe-area-inset-top))',
                    right: 'max(1rem, env(safe-area-inset-right))',
                  }}
                  aria-label="Fermer"
                >
                  <X size={24} className="sm:w-7 sm:h-7" strokeWidth={2.5} />
                </button>
                <div
                  className="relative shrink-0 max-w-[min(90vw,1200px)] max-h-[85vh] w-full aspect-[4/3] overflow-hidden rounded-lg shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={getOptimizedImageUrl(frontImage, { width: 1600 })}
                    alt="Face avant de la carte postale"
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          portalRoot,
        )}
    </div>
  )
}
