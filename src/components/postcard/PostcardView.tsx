'use client'

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { FrontImageFilter, Postcard } from '@/types'
import { PhotoLocation } from '@/components/ui/PhotoMarker'
import {
  RotateCw,
  MapPin,
  X,
  Play,
  ChevronLeft,
  ChevronRight,
  Camera,
  Search,
  Loader2,
  Mail,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Mic,
  Volume2,
} from 'lucide-react'
import { cn, isCoordinate } from '@/lib/utils'
import { AnimatePresence, motion, useSpring, useMotionValue, useTransform } from 'framer-motion'
import dynamic from 'next/dynamic'
import { getOptimizedImageUrl } from '@/lib/image-processing'

// Dynamically import MapModal to avoid SSR issues with Leaflet
const MapModal = dynamic(() => import('@/components/ui/MapModal'), {
  ssr: false,
  loading: () => null,
})

const MiniMap = dynamic(() => import('@/components/postcard/MiniMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-stone-100 animate-pulse" />,
})

// Dynamic import for JournalModal
const JournalModal = dynamic(() => import('@/components/postcard/JournalModal'), {
  ssr: false,
  loading: () => null,
})

interface PostcardViewProps {
  postcard: Postcard
  isPreview?: boolean
  flipped?: boolean
  frontTextBgOpacity?: number
  className?: string
  isLarge?: boolean
  width?: string
  height?: string
  hideFullscreenButton?: boolean
  hideFlipHints?: boolean
  /** Quand la carte est affichée dans le modal plein écran, permet d’afficher le bouton « Sortir » au verso */
  isInsideFullscreen?: boolean
  onExitFullscreen?: () => void
  /** En mode éditeur : callback quand l'utilisateur déplace le bloc caption (position en %). */
  onCaptionPositionChange?: (pos: { x: number; y: number }) => void
}

const DEFAULT_CAPTION_POSITION = { x: 50, y: 85 }

const FALLBACK_FRONT_IMAGE = '/images/demo/photo-1507525428034-b723cf961d3e.jpg'
const DEFAULT_FRONT_FILTER: FrontImageFilter = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  sepia: 0,
  grayscale: 0,
}

const buildFrontImageFilterCss = (filter?: FrontImageFilter): string => {
  const f = filter ?? DEFAULT_FRONT_FILTER
  return [
    `brightness(${f.brightness}%)`,
    `contrast(${f.contrast}%)`,
    `saturate(${f.saturation}%)`,
    `sepia(${f.sepia}%)`,
    `grayscale(${f.grayscale}%)`,
  ].join(' ')
}

const PostcardView: React.FC<PostcardViewProps> = ({
  postcard,
  flipped,
  frontTextBgOpacity = 90,
  className,
  isLarge = false,
  width,
  height,
  hideFullscreenButton = false,
  hideFlipHints = false,
  isInsideFullscreen = false,
  onExitFullscreen,
  onCaptionPositionChange,
}) => {
  const [isFlipped, setIsFlipped] = useState(flipped ?? false)
  const [isDraggingCaption, setIsDraggingCaption] = useState(false)
  const frontFaceRef = useRef<HTMLDivElement>(null)
  const [frontImageSrc, setFrontImageSrc] = useState(postcard.frontImage || FALLBACK_FRONT_IMAGE)
  const [isFrontImageLoading, setIsFrontImageLoading] = useState(!!postcard.frontImage)
  const frontImageRef = useRef<HTMLImageElement>(null)
  const [imgNaturalSize, setImgNaturalSize] = useState<{ w: number; h: number } | null>(null)

  const captionPos = postcard.frontCaptionPosition ?? DEFAULT_CAPTION_POSITION
  const usePositionedCaption =
    postcard.frontCaptionPosition != null || onCaptionPositionChange != null

  useEffect(() => {
    if (!isDraggingCaption || !onCaptionPositionChange) return
    const onMove = (e: PointerEvent) => {
      const el = frontFaceRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const xPct = ((e.clientX - rect.left) / rect.width) * 100
      const yPct = ((e.clientY - rect.top) / rect.height) * 100
      const x = Math.max(10, Math.min(90, xPct))
      const y = Math.max(10, Math.min(90, yPct))
      onCaptionPositionChange({ x, y })
    }
    const onUp = () => {
      setIsDraggingCaption(false)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [isDraggingCaption, onCaptionPositionChange])

  const [isFullscreen, setIsFullscreen] = useState(false)
  const frontImageFilterCss = buildFrontImageFilterCss(postcard.frontImageFilter)
  const clampedFrontTextBgOpacity = Math.max(0, Math.min(100, frontTextBgOpacity))
  const frontTextBgColor = `rgba(255, 255, 255, ${clampedFrontTextBgOpacity / 100})`

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden'
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsFullscreen(false)
      }
      window.addEventListener('keydown', handleEsc)
      return () => {
        document.body.style.overflow = ''
        window.removeEventListener('keydown', handleEsc)
      }
    }
  }, [isFullscreen])

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsFullscreen(!isFullscreen)
  }

  useEffect(() => {
    const url = postcard.frontImage || FALLBACK_FRONT_IMAGE
    if (url !== frontImageSrc) {
      setFrontImageSrc(url)
      setIsFrontImageLoading(true)
    } else if (frontImageRef.current?.complete) {
      setIsFrontImageLoading(false)
    }
  }, [postcard.frontImage, postcard.id])

  // Si l'image est déjà en cache, onLoad ne se déclenche pas — on vérifie img.complete
  useLayoutEffect(() => {
    const img = frontImageRef.current
    if (!img || !frontImageSrc) return
    if (img.complete && img.naturalWidth > 0) {
      setIsFrontImageLoading(false)
    }
  }, [frontImageSrc, postcard.id])

  // Vérification différée pour images locales/cache : le navigateur peut ne pas déclencher onLoad
  useEffect(() => {
    if (!frontImageSrc) return
    const id = setTimeout(() => {
      const img = frontImageRef.current
      if (img?.complete && img.naturalWidth > 0) {
        setIsFrontImageLoading(false)
      }
    }, 50)
    return () => clearTimeout(id)
  }, [frontImageSrc, postcard.id])

  // Motion values for rotation
  const rotateY = useMotionValue(flipped ? 180 : 0)
  const springRotateY = useSpring(rotateY, { stiffness: 80, damping: 26 })

  // Derived opacity for faces to avoid ghosting in Safari/Chrome during 3D flip
  // Values derived from springRotateY to sync with animation and avoid "flash"
  const frontOpacity = useTransform(springRotateY, [88, 92, 268, 272], [1, 0, 0, 1])
  const backOpacity = useTransform(springRotateY, [88, 92, 268, 272], [0, 1, 1, 0])

  useEffect(() => {
    if (flipped !== undefined) {
      setIsFlipped(flipped)
      rotateY.set(flipped ? 180 : 0)
    }
  }, [flipped, rotateY])

  const [isMessageOpen, setIsMessageOpen] = useState(false)
  const [isAlbumOpen, setIsAlbumOpen] = useState(false)
  const [isJournalOpen, setIsJournalOpen] = useState(false) // New State
  const [isMapOpen, setIsMapOpen] = useState(false)
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null)
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [messageModalFontSize, setMessageModalFontSize] = useState(2)
  // Slider de taille du texte au verso (0.7 = petit, 2.2 = grand)
  const [backTextScale, setBackTextScale] = useState(isLarge ? 1.2 : 1)
  // Zoom de la mini-carte au verso (pour que + / - fonctionnent sans déclencher le flip)
  const [backMapZoom, setBackMapZoom] = useState(6)
  const [isActionsOpen, setIsActionsOpen] = useState(true)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)

  // Calculate photo locations from EXIF data
  const photoLocations: PhotoLocation[] = React.useMemo(() => {
    if (!postcard.mediaItems) return []

    // Group by location (approximate to 4 decimal places ? or exact?)
    // Let's use exact for now, or maybe small radius.
    // Simpler: group by exact lat/lng strings

    const groups: Record<string, PhotoLocation> = {}

    postcard.mediaItems.forEach((item) => {
      if (item.exif?.gps) {
        const key = `${item.exif.gps.latitude.toFixed(4)},${item.exif.gps.longitude.toFixed(4)}`
        if (!groups[key]) {
          groups[key] = {
            id: key,
            lat: item.exif.gps.latitude,
            lng: item.exif.gps.longitude,
            mediaItems: [],
          }
        }
        groups[key].mediaItems.push(item)
      }
    })

    return Object.values(groups)
  }, [postcard.mediaItems])

  const handleMapPhotoClick = (mediaItem: any) => {
    if (!postcard.mediaItems) return
    const index = postcard.mediaItems.findIndex((item) => item.id === mediaItem.id)
    if (index !== -1) {
      setCurrentMediaIndex(index)
      setIsMapOpen(false)
      setIsAlbumOpen(true)
    }
  }

  const messageContainerRef = useRef<HTMLDivElement>(null)
  const messageTextRef = useRef<HTMLParagraphElement>(null)
  const [autoFontSize, setAutoFontSize] = useState<number>(1)

  // Nouvel algorithme "Automatic Text Filler" : maximise la taille pour remplir l'espace disponible
  const computeAutoFontSize = React.useCallback(() => {
    if (!messageTextRef.current || !messageContainerRef.current) return

    const container = messageContainerRef.current
    const text = messageTextRef.current

    // Mesurer l'espace disponible réel dans le conteneur avec une marge de sécurité (80% pour plus d'air)
    const targetHeight = container.offsetHeight * 0.8
    const targetWidth = container.offsetWidth * 0.8

    if (targetHeight === 0 || targetWidth === 0) return

    // Sauvegarde des styles pour la mesure
    const savedFontSize = text.style.fontSize
    const savedWidth = text.style.width
    const savedDisplay = text.style.display

    // On force le mode mesure : largeur fixe pour simuler le wrapping
    text.style.width = `${targetWidth}px`
    text.style.display = 'block'

    let low = 8
    let high = isLarge ? 80 : 60 // Réduit encore pour laisser de la place aux autres éléments (signature, etc)
    let best = 16

    const currentScale = backTextScale || 1

    // Recherche binaire précise en pixels
    for (let i = 0; i < 12; i++) {
      const mid = (low + high) / 2
      const scaledMid = mid * currentScale // On mesure avec l'échelle appliquée
      text.style.fontSize = `${scaledMid}px`

      if (text.scrollHeight <= targetHeight && text.scrollWidth <= targetWidth) {
        best = mid
        low = mid
      } else {
        high = mid
      }
    }

    // Restauration des styles
    text.style.fontSize = savedFontSize
    text.style.width = savedWidth
    text.style.display = savedDisplay

    // Conversion en rem (base 16px)
    // On divise par currentScale car on veut la base qui, multipliée par l'échelle, remplira l'espace
    const finalSizeRem = best / 16

    // Sécurité
    const minSize = isLarge ? 1.5 : 0.8
    setAutoFontSize(Math.max(finalSizeRem, minSize))
  }, [isLarge, backTextScale]) // backTextScale ajouté en dépendance pour recalculer si l'utilisateur bouge le slider

  // Ajustement automatique : au flip et au changement de message/échelle
  useLayoutEffect(() => {
    if (!isFlipped) return
    computeAutoFontSize()
    // En plein écran : recalculer après layout (conteneur peut avoir 0 au premier paint)
    if (isLarge) {
      const t1 = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          computeAutoFontSize()
        })
      })
      const t2 = window.setTimeout(() => {
        computeAutoFontSize()
      }, 150)
      return () => {
        cancelAnimationFrame(t1)
        window.clearTimeout(t2)
      }
    }
  }, [isFlipped, postcard.message, computeAutoFontSize, isLarge, backTextScale])

  // En plein écran / redimensionnement : recalculer quand le conteneur change de taille
  useEffect(() => {
    if (!isFlipped || !messageContainerRef.current) return
    const container = messageContainerRef.current
    const ro = new ResizeObserver(() => {
      if (messageContainerRef.current?.clientHeight && messageTextRef.current) {
        computeAutoFontSize()
      }
    })
    ro.observe(container)
    return () => ro.disconnect()
  }, [isFlipped, computeAutoFontSize])

  const handleFlip = () => {
    const newFlippedState = !isFlipped
    setIsFlipped(newFlippedState)
    rotateY.set(newFlippedState ? 180 : 0)
  }

  const openAlbum = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsAlbumOpen(true)
  }

  const openMap = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (postcard.coords || postcard.location) {
      setIsMapOpen(true)
    }
  }

  const openJournal = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsJournalOpen(true)
  }

  const openMessage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsMessageOpen(true)
  }

  const nextMedia = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (postcard.mediaItems) {
      setCurrentMediaIndex((prev) => (prev + 1) % postcard.mediaItems!.length)
    }
  }

  const prevMedia = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (postcard.mediaItems) {
      setCurrentMediaIndex(
        (prev) => (prev - 1 + postcard.mediaItems!.length) % postcard.mediaItems!.length,
      )
    }
  }

  const toggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!postcard.audioMessage || !audioRef.current) return

    if (isPlayingAudio) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch((err) => console.error('Audio play failed', err))
    }
  }

  const hasMedia = postcard.mediaItems && postcard.mediaItems.length > 0

  const actionButtonBase =
    'inline-flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-3 sm:px-6 py-1.5 rounded-lg text-[8px] sm:text-[9px] font-bold uppercase tracking-wider active:scale-95 transition-all shadow-sm text-center whitespace-normal sm:whitespace-nowrap'

  useEffect(() => {
    setPortalRoot(document.body)
  }, [])

  const renderMessageModal = () => {
    if (!portalRoot || !isMessageOpen) return null

    return createPortal(
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[150] bg-stone-900/90 backdrop-blur-md flex items-center justify-center p-4 md:p-6"
        onClick={() => setIsMessageOpen(false)}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="w-full max-w-[95vw] md:max-w-2xl h-[90vh] md:max-h-[75vh] md:h-auto min-h-0 bg-[#fafaf9] rounded-3xl shadow-2xl p-6 md:p-10 relative overflow-hidden flex flex-col items-center text-center border-8 border-white/50"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/5 rounded-full -ml-16 -mb-16 blur-3xl"></div>

          <button
            onClick={() => setIsMessageOpen(false)}
            className="absolute top-2 right-2 md:top-4 md:right-4 z-[100] bg-white hover:bg-stone-100 text-stone-500 hover:text-stone-800 p-2 md:p-2.5 rounded-full transition-all shadow-lg border border-stone-200 group/close"
          >
            <X
              size={20}
              className="md:w-6 md:h-6 group-hover/close:rotate-90 transition-transform duration-300"
            />
          </button>

          {/* Header : lieu bien visible en haut */}
          <div className="absolute top-4 left-4 right-14 md:left-10 md:right-16 z-[90] pointer-events-none flex flex-col gap-1">
            {postcard.location && (
              <p className="text-sm md:text-base font-semibold text-teal-700 flex items-center justify-center gap-1.5">
                <MapPin size={16} className="text-teal-500 shrink-0" />
                {postcard.location}
              </p>
            )}
            <p className="text-[10px] md:text-xs font-bold text-stone-400 uppercase tracking-widest">
              Carte reçue de {postcard.senderName || '…'}
            </p>
          </div>

          <div className="w-24 h-1.5 bg-stone-100 rounded-full mb-4 opacity-50 shrink-0"></div>

          <div className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden custom-scrollbar px-4 flex flex-col pt-0">
            <p
              className="font-handwriting text-stone-700 leading-relaxed text-center whitespace-pre-wrap pt-2 pb-6 w-full max-w-full break-words"
              style={{ fontSize: `${messageModalFontSize}rem` }}
            >
              {postcard.message}
            </p>
          </div>

          <div className="w-full h-px bg-stone-100 my-4 md:my-6 shrink-0"></div>

          {/* Mobile : Envoyé de + signature en bas à gauche ; desktop : layout en ligne */}
          <div className="w-full flex flex-col md:flex-row flex-wrap items-stretch md:items-end justify-between gap-3 md:gap-4 shrink-0 pb-2">
            <div className="flex flex-col gap-0.5 md:gap-1 order-1 md:order-1 text-left shrink-0">
              <p className="text-[9px] md:text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                Envoyé de
              </p>
              <p className="text-stone-600 font-medium flex items-center gap-1 text-xs md:text-sm uppercase">
                <MapPin size={12} className="text-teal-600 shrink-0" />
                {postcard.location}
              </p>
              <p className="font-handwriting text-teal-700 text-xl md:hidden rotate-[-2deg] mt-1">
                - {postcard.senderName}
              </p>
            </div>

            {/* Map Button */}
            <div className="flex items-center gap-3 min-w-0 flex-1 justify-center max-w-xs mx-auto order-3 md:order-2">
              <button
                type="button"
                onClick={() =>
                  setMessageModalFontSize((s) => Math.max(1, Number((s - 0.1).toFixed(1))))
                }
                className="p-1.5 rounded-full hover:bg-stone-200 text-stone-600 transition-colors border border-stone-200 bg-white"
                title="Diminuer la taille du texte"
              >
                <Minus size={14} />
              </button>
              <span className="text-[9px] md:text-[10px] font-bold text-stone-400 uppercase tracking-widest whitespace-nowrap px-2">
                Taille
              </span>
              <button
                type="button"
                onClick={() =>
                  setMessageModalFontSize((s) => Math.min(4, Number((s + 0.1).toFixed(1))))
                }
                className="p-1.5 rounded-full hover:bg-stone-200 text-stone-600 transition-colors border border-stone-200 bg-white"
                title="Augmenter la taille du texte"
              >
                <Plus size={14} />
              </button>
              <span className="ml-2 text-[9px] md:text-[10px] font-medium text-stone-500 tabular-nums w-8 shrink-0 text-left">
                {Math.round(messageModalFontSize * 100)}%
              </span>
            </div>
            <p className="font-handwriting text-teal-700 text-2xl md:text-3xl rotate-[-2deg] shrink-0 text-right order-2 md:order-3 hidden md:block">
              - {postcard.senderName}
            </p>
          </div>
        </motion.div>
      </motion.div>,
      portalRoot,
    )
  }

  const renderAlbumModal = () => {
    if (!portalRoot || !isAlbumOpen || !hasMedia) return null

    return createPortal(
      <div
        className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
        onClick={() => setIsAlbumOpen(false)}
      >
        <div
          className="w-full max-w-4xl flex flex-col items-center relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setIsAlbumOpen(false)}
            className="absolute -top-12 right-0 md:right-0 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-all shadow-lg backdrop-blur-md border border-white/20"
          >
            <X size={24} />
          </button>

          <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl flex items-center justify-center mb-6">
            {postcard.mediaItems![currentMediaIndex].type === 'video' ? (
              <video controls autoPlay className="max-w-full max-h-[70vh]">
                <source src={postcard.mediaItems![currentMediaIndex].url} />
              </video>
            ) : (
              <img
                src={getOptimizedImageUrl(postcard.mediaItems![currentMediaIndex].url, {
                  width: 1200,
                })}
                className="max-w-full max-h-[70vh] object-contain"
                alt="Album item"
              />
            )}

            {postcard.mediaItems!.length > 1 && (
              <>
                <button
                  onClick={prevMedia}
                  className="absolute left-4 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white backdrop-blur-md transition-all"
                >
                  <ChevronLeft size={32} />
                </button>
                <button
                  onClick={nextMedia}
                  className="absolute right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white backdrop-blur-md transition-all"
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}
          </div>

          <div className="flex gap-4 overflow-x-auto max-w-full pb-4 px-2">
            {postcard.mediaItems!.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentMediaIndex(idx)}
                className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                  currentMediaIndex === idx
                    ? 'border-teal-500 opacity-100 scale-105'
                    : 'border-transparent opacity-50 hover:opacity-80'
                }`}
                aria-label={`Voir le média ${idx + 1}`}
              >
                {item.type === 'video' ? (
                  <div className="w-full h-full bg-stone-800 flex items-center justify-center">
                    <Play size={20} className="text-white" />
                  </div>
                ) : (
                  <img
                    src={getOptimizedImageUrl(item.url, { width: 400, height: 400, fit: 'cover' })}
                    className="w-full h-full object-cover"
                    alt="thumbnail"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>,
      portalRoot,
    )
  }

  const renderJournalModal = () => {
    if (!portalRoot || !isJournalOpen || !postcard.mediaItems) return null

    return createPortal(
      <JournalModal
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
        postcard={postcard}
      />,
      portalRoot,
    )
  }

  return (
    <>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
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
      <div
        className="flex flex-col items-center gap-2 select-none w-full max-w-full"
        suppressHydrationWarning
      >
        <motion.div
          className={cn(
            'perspective-1000 group transition-shadow duration-300 relative z-10', // z-10 for layering; no cursor-grab so card only flips via button
            !width &&
              !height &&
              (isLarge
                ? 'w-[95vw] h-[65vw] max-w-[460px] max-h-[306px] sm:w-[552px] sm:h-[368px] md:w-[736px] md:h-[490px] lg:w-[920px] lg:h-[612px] sm:max-w-none sm:max-h-none portrait:max-h-none'
                : 'w-full max-w-full sm:w-[552px] aspect-[3/2] sm:h-[368px]'),
            className,
          )}
          style={{ perspective: 1000, width, height }}
        >
          <motion.div
            className={cn('relative w-full h-full transform-style-3d')}
            style={{
              rotateY: springRotateY,
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Front of Card — masqué en mode verso (Safari: backface-visibility insuffisant) */}
            <motion.div
              ref={frontFaceRef}
              className={cn(
                'absolute w-full h-full backface-hidden rounded-xl shadow-2xl overflow-hidden bg-white border border-stone-200',
                isFlipped ? 'pointer-events-none' : 'cursor-pointer',
              )}
              onClick={handleFlip} // Only front face is clickable for flipping
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'translateZ(1px)',
                opacity: frontOpacity,
              }}
            >
              <div className="absolute inset-0 z-0 -translate-y-2">
                {postcard.frontImageCrop && imgNaturalSize ? (
                  <div
                    className="absolute pointer-events-none"
                    style={(() => {
                      // Manual cover + user crop logic (matching EditorClient.tsx)
                      // The container aspect is fixed at 3/2 (same as POSTCARD_ASPECT)
                      const POSTCARD_ASPECT = 3 / 2

                      // We simulate the cover scale first
                      // In CSS %, we need to know the ratio.
                      // Let's use relative units.
                      const imgAspect = imgNaturalSize.w / imgNaturalSize.h

                      let w: number, h: number

                      if (imgAspect > POSTCARD_ASPECT) {
                        // Image is wider than postcard (height-limited)
                        h = 100 * postcard.frontImageCrop.scale
                        w = (h * imgAspect) / POSTCARD_ASPECT
                      } else {
                        // Image is taller than postcard (width-limited)
                        w = 100 * postcard.frontImageCrop.scale
                        h = (w / imgAspect) * POSTCARD_ASPECT
                      }

                      const left = 50 - (postcard.frontImageCrop.x / 100) * w
                      const top = 50 - (postcard.frontImageCrop.y / 100) * h

                      return {
                        width: `${w}%`,
                        height: `${h}%`,
                        left: `${left}%`,
                        top: `${top}%`,
                      }
                    })()}
                  >
                    <img
                      ref={frontImageRef}
                      src={getOptimizedImageUrl(frontImageSrc, { width: 1600 })}
                      alt="Postcard Front"
                      className={cn(
                        'block w-full h-full object-cover transition-opacity duration-700',
                        isFrontImageLoading ? 'opacity-0' : 'opacity-100',
                      )}
                      style={{ filter: frontImageFilterCss }}
                      onLoad={(e) => {
                        setImgNaturalSize({
                          w: e.currentTarget.naturalWidth,
                          h: e.currentTarget.naturalHeight,
                        })
                        setIsFrontImageLoading(false)
                      }}
                      onError={() => {
                        if (frontImageSrc !== FALLBACK_FRONT_IMAGE) {
                          setFrontImageSrc(FALLBACK_FRONT_IMAGE)
                        }
                        setIsFrontImageLoading(false)
                      }}
                    />
                  </div>
                ) : (
                  <img
                    ref={frontImageRef}
                    src={getOptimizedImageUrl(frontImageSrc, { width: 1600 })}
                    alt="Postcard Front"
                    className={cn(
                      'w-full h-full object-cover pointer-events-none transition-opacity duration-700',
                      isFrontImageLoading ? 'opacity-0' : 'opacity-100',
                    )}
                    style={
                      postcard.frontImageCrop
                        ? {
                            objectPosition: `${postcard.frontImageCrop.x}% ${postcard.frontImageCrop.y}%`,
                            transform: `scale(${postcard.frontImageCrop.scale})`,
                            filter: frontImageFilterCss,
                          }
                        : { filter: frontImageFilterCss }
                    }
                    onLoad={(e) => {
                      setImgNaturalSize({
                        w: e.currentTarget.naturalWidth,
                        h: e.currentTarget.naturalHeight,
                      })
                      setIsFrontImageLoading(false)
                    }}
                    onError={() => {
                      if (frontImageSrc !== FALLBACK_FRONT_IMAGE) {
                        setFrontImageSrc(FALLBACK_FRONT_IMAGE)
                      }
                      setIsFrontImageLoading(false)
                    }}
                  />
                )}
              </div>

              {/* Stickers Rendering */}
              <div className="absolute inset-0 pointer-events-none z-10">
                {postcard.stickers?.map((sticker) => (
                  <div
                    key={sticker.id}
                    className="absolute"
                    style={{
                      left: `${sticker.x}%`,
                      top: `${sticker.y}%`,
                      transform: `translate(-50%, -50%) scale(${sticker.scale}) rotate(${sticker.rotation}deg)`,
                      width: '80px', // Base size, adjusted by scale
                      height: '80px',
                    }}
                  >
                    <img
                      src={getOptimizedImageUrl(sticker.imageUrl || '', { width: 200 })}
                      alt="Sticker"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>

              {/* Loading State for Front Image */}
              <AnimatePresence>
                {isFrontImageLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-stone-50"
                  >
                    <div className="relative">
                      <Loader2 size={40} className="text-teal-500 animate-spin" />
                      <div className="absolute inset-0 blur-xl bg-teal-500/20 animate-pulse rounded-full" />
                    </div>
                    <p className="mt-4 text-xs font-bold text-stone-400 uppercase tracking-widest animate-pulse">
                      Chargement de la photo...
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none z-0" />

              {/* Message "Cliquer pour retourner" au survol (Front) — masqué en fullscreen ou via prop */}
              {!isFullscreen && !hideFlipHints && (
                <div className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none">
                  <div className="bg-stone-800/95 backdrop-blur-md px-3 py-2.5 rounded-xl border border-stone-600/50 shadow-xl flex items-center gap-2 transform scale-95 group-hover:scale-100 transition-all duration-300">
                    <RotateCw size={16} className="text-white shrink-0" strokeWidth={2} />
                    <span className="text-white font-bold uppercase tracking-wider text-[10px] sm:text-xs whitespace-nowrap">
                      Retourner la carte postale
                    </span>
                  </div>
                </div>
              )}

              {/* Message démo au-dessus de la localisation (frontCaption sans frontEmoji) */}
              {postcard.frontCaption?.trim() && !postcard.frontEmoji && (
                <div
                  className="absolute left-4 sm:left-6 z-10 bottom-14 sm:bottom-16 w-fit max-w-[calc(100%-2rem)] sm:max-w-[calc(100%-3rem)] px-3 py-2 sm:px-4 sm:py-2.5 rounded-md border border-white/50 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300"
                  style={{ backgroundColor: 'rgba(255,255,255,0.65)' }}
                >
                  <p className="m-0 text-base sm:text-lg font-bold leading-tight tracking-tight text-stone-900 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)] break-words">
                    {postcard.frontCaption}
                  </p>
                </div>
              )}

              {postcard.location && !isCoordinate(postcard.location) && (
                <div
                  className={cn(
                    'absolute left-4 sm:left-6 z-10 bg-white/90 backdrop-blur-md text-teal-900 px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-semibold shadow-lg flex items-center gap-1.5 transition-all duration-300',
                    postcard.frontCaption?.trim() && postcard.frontEmoji
                      ? 'bottom-20 sm:bottom-24'
                      : 'bottom-4 sm:bottom-6',
                  )}
                >
                  <MapPin size={12} className="text-orange-500 shrink-0" />
                  <span className="normal-case tracking-wide break-words max-w-[160px] sm:max-w-[220px]">
                    {postcard.location}
                  </span>
                </div>
              )}

              {/* Bloc caption + emoji (affiché seulement si frontCaption ET frontEmoji) — position fixe ou déplaçable */}
              {postcard.frontCaption?.trim() && postcard.frontEmoji && (
                <div
                  className={cn(
                    'z-20 flex items-center gap-3 rounded-2xl sm:rounded-3xl border border-white/50 backdrop-blur-xl px-5 py-3.5 sm:px-6 sm:py-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 w-fit max-w-[calc(100%-2rem)]',
                    usePositionedCaption
                      ? 'absolute'
                      : 'absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6',
                    onCaptionPositionChange &&
                      'cursor-grab active:cursor-grabbing touch-none select-none',
                  )}
                  style={
                    usePositionedCaption
                      ? {
                          left: `${captionPos.x}%`,
                          top: `${captionPos.y}%`,
                          transform: 'translate(-50%, -50%)',
                          backgroundColor: frontTextBgColor,
                        }
                      : { backgroundColor: frontTextBgColor }
                  }
                  {...(onCaptionPositionChange && {
                    onPointerDown: (e: React.PointerEvent) => {
                      e.stopPropagation()
                      e.preventDefault()
                      setIsDraggingCaption(true)
                    },
                    onClick: (e: React.MouseEvent) => e.stopPropagation(),
                  })}
                >
                  <span className="text-xl sm:text-4xl leading-none shrink-0" aria-hidden>
                    {postcard.frontEmoji}
                  </span>
                  <p className="m-0 text-base sm:text-lg font-bold leading-tight tracking-tight text-stone-900 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)] break-words line-clamp-2">
                    {postcard.frontCaption}
                  </p>
                </div>
              )}
            </motion.div>

            {/* Back of Card — masqué en mode recto (Safari: backface-visibility insuffisant) */}
            <motion.div
              className={cn(
                'absolute w-full h-full backface-hidden rounded-xl shadow-2xl bg-[#fafaf9] border border-stone-200 flex flex-col overflow-hidden',
                isLarge ? 'p-3 sm:p-8 pl-5 sm:pl-10' : 'p-3 sm:p-8 pl-4 sm:pl-8',
                !isFlipped ? 'pointer-events-none' : '',
              )}
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg) translateZ(1px)',
                opacity: backOpacity,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Watermark bottom-left (marge pour ne pas être coupé) */}
              <div className="hidden sm:flex absolute bottom-3 left-7 sm:left-8 items-center gap-1.5 transition-opacity duration-300 opacity-95 bg-white/80 border border-stone-200 rounded-full px-2 py-1 shadow-sm">
                <Mail size={10} className="text-teal-600 shrink-0" />
                <span className="text-stone-600 text-[8px] sm:text-[9px] font-semibold tracking-[0.2em] uppercase">
                  cartepostale.cool
                </span>
              </div>
              <div
                className={cn(
                  'absolute top-14 bottom-10 w-px bg-stone-300 hidden sm:block opacity-50 transition-opacity duration-300',
                  isLarge ? 'left-[66%]' : 'left-[60%]',
                )}
              ></div>

              {/* Top Controls Bar — boutons plats, larges, icônes plus grandes */}
              <div
                className={cn(
                  'absolute top-2 sm:top-4 z-20 flex flex-wrap items-center justify-start gap-1.5 h-8',
                  isLarge
                    ? 'left-2 right-4 sm:left-4 sm:right-auto sm:pl-8'
                    : 'left-2 right-4 sm:left-3 sm:right-auto sm:pl-3',
                )}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Font size (zoom texte) — plat, large, icônes plus grandes */}
                <div className="h-5 sm:h-6 min-w-[2.25rem] sm:min-w-[2.5rem] flex items-center gap-0.5 bg-white/50 backdrop-blur-[2px] rounded-md border border-stone-200/50 px-1.5 shadow-sm">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setBackTextScale((s) => Math.max(0.7, Number((s - 0.05).toFixed(2))))
                    }}
                    className="w-5 h-full flex items-center justify-center rounded hover:bg-white text-stone-500 hover:text-teal-600 transition-colors"
                    title="Réduire"
                  >
                    <Minus size={14} strokeWidth={2} />
                  </button>
                  <span className="text-[9px] font-bold text-stone-400 min-w-[12px] text-center select-none">
                    A
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setBackTextScale((s) => Math.min(2.2, Number((s + 0.05).toFixed(2))))
                    }}
                    className="w-5 h-full flex items-center justify-center rounded hover:bg-white text-stone-500 hover:text-teal-600 transition-colors"
                    title="Agrandir"
                  >
                    <Plus size={14} strokeWidth={2} />
                  </button>
                </div>

                {/* Fullscreen */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (isInsideFullscreen && onExitFullscreen) onExitFullscreen()
                    else toggleFullscreen(e)
                  }}
                  className="h-5 min-w-[2.25rem] sm:min-w-[2.5rem] sm:h-6 px-2 flex items-center justify-center rounded-md bg-white/50 backdrop-blur-[2px] border border-stone-200/50 text-stone-500 hover:text-teal-600 hover:bg-white transition-all shadow-sm"
                  title={isFullscreen || isInsideFullscreen ? 'Quitter plein écran' : 'Plein écran'}
                >
                  {isFullscreen || isInsideFullscreen ? (
                    <Minimize2 size={18} strokeWidth={2} />
                  ) : (
                    <Maximize2 size={18} strokeWidth={2} />
                  )}
                </button>

                {/* Retourner */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleFlip()
                  }}
                  className="h-5 min-w-[2.25rem] sm:min-w-[2.5rem] sm:h-6 px-2 flex items-center justify-center rounded-md bg-white/50 backdrop-blur-[2px] border border-stone-200/50 text-stone-500 hover:text-teal-600 hover:bg-white transition-all shadow-sm"
                  title="Retourner"
                >
                  <RotateCw size={18} strokeWidth={2} />
                </button>

                {/* Album */}
                {hasMedia && (
                  <button
                    type="button"
                    onClick={openAlbum}
                    className="h-5 min-w-[2.25rem] sm:min-w-[2.5rem] sm:h-6 px-2 flex items-center justify-center rounded-md bg-white/50 backdrop-blur-[2px] border border-stone-200/50 text-stone-500 hover:text-teal-600 hover:bg-teal-50 hover:border-teal-200 transition-all shadow-sm"
                    title="Album photos"
                  >
                    <Camera size={18} strokeWidth={2} />
                  </button>
                )}

                {/* Carnet */}
                {hasMedia && (
                  <button
                    type="button"
                    onClick={openJournal}
                    className="h-5 min-w-[2.25rem] sm:min-w-[2.5rem] sm:h-6 px-2 flex items-center justify-center rounded-md bg-white/50 backdrop-blur-[2px] border border-stone-200/50 text-stone-500 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-200 transition-all shadow-sm"
                    title="Carnet de voyage"
                  >
                    <BookOpen size={18} strokeWidth={2} />
                  </button>
                )}

                {/* Audio */}
                {postcard.audioMessage && (
                  <button
                    type="button"
                    onClick={toggleAudio}
                    className={cn(
                      'h-5 min-w-[2.25rem] sm:min-w-[2.5rem] sm:h-6 px-2 flex items-center justify-center rounded-md backdrop-blur-[2px] border transition-all shadow-sm',
                      isPlayingAudio
                        ? 'bg-rose-50 border-rose-200 text-rose-600'
                        : 'bg-white/50 border-stone-200/50 text-stone-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200',
                    )}
                    title="Message Vocal"
                  >
                    {isPlayingAudio ? (
                      <Volume2 size={18} strokeWidth={2} className="animate-pulse" />
                    ) : (
                      <Mic size={18} strokeWidth={2} />
                    )}
                  </button>
                )}
              </div>

              {/* Contenu (texte + timbre/carte) sous la barre de contrôle — z-10 < z-60 de la barre */}
              {/* Reduced general padding, added specific margin for Left column to clear controls */}
              <div className="relative z-10 flex w-full flex-1 min-h-0 gap-2 sm:gap-6 pt-4 sm:pt-4 transition-all duration-300">
                {/* Left Side: Message - marge gauche généreuse pour éviter troncature (police manuscrite) */}
                <div
                  className={cn(
                    'min-w-0 flex flex-col justify-start relative pl-[2px] sm:pl-[2px] pr-2 sm:pr-4 mt-8 sm:mt-10', // Added mt to clear top controls
                    isLarge ? 'flex-[2]' : 'flex-[1.5]',
                  )}
                >
                  <div
                    ref={messageContainerRef}
                    className="flex-1 w-full min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar mt-2 mb-1 cursor-pointer group/msg relative pr-2 pl-1 sm:pl-2 flex flex-col justify-center"
                    onClick={openMessage}
                  >
                    <p
                      ref={messageTextRef}
                      className="font-handwriting text-stone-700 leading-[1.2] text-left whitespace-pre-wrap w-full max-w-full break-words pl-2 sm:pl-3"
                      style={{
                        fontSize: `${autoFontSize * backTextScale}rem`,
                      }}
                    >
                      {postcard.message}
                    </p>

                    {/* Zoom hint - shown when hovering */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover/msg:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-stone-200 shadow-xl flex items-center gap-2 transform scale-75 sm:scale-100">
                        <Search size={14} className="text-teal-600" />
                        <span className="text-[10px] font-bold text-stone-600 uppercase tracking-widest">
                          Agrandir
                        </span>
                      </div>
                    </div>
                  </div>
                  {postcard.senderName && (
                    <div className="mt-auto -mt-2 self-start transform -rotate-2 pt-2 pb-1 px-4 relative">
                      <div className="absolute inset-0 bg-teal-50/30 blur-md rounded-full -rotate-3"></div>
                      <p className="font-handwriting text-teal-700 text-xl sm:text-3xl relative z-10 font-bold drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                        - {postcard.senderName}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Side: Stamp + Map */}
                <div className="flex-1 h-full flex flex-col relative min-w-0 pt-0 min-h-[8rem] sm:min-h-[10rem]">
                  {/* Top Section: Stamp — remonté pour alignement visuel */}
                  <div className="flex-none flex justify-end items-start mb-0.5 gap-2 min-h-[4.5rem] sm:min-h-[5.5rem] -mt-6 sm:-mt-8 -mr-1 sm:-mr-3">
                    {/* Stamp - plus petit et plus réaliste */}
                    {(() => {
                      const style = postcard.stampStyle || 'classic'
                      const label =
                        (postcard.stampLabel || 'Digital Poste').trim() || 'Digital Poste'
                      const year = (postcard.stampYear || '2024').trim() || '2024'
                      // Split text for postmark if too long or multiline needed? defaulted to location/date
                      const pmText =
                        postcard.postmarkText ||
                        (postcard.location ? postcard.location.split(',')[0] : 'Digital')

                      return (
                        <div className="relative group-hover:rotate-2 transition-transform duration-500 ease-out pt-0 pb-2 pr-2">
                          {/* The Stamp itself - Reduced size (w-20/h-24 on desktop) */}
                          <div
                            className={cn(
                              'relative shadow-[2px_3px_5px_rgba(0,0,0,0.2)] transform rotate-1',
                              isLarge ? 'w-10 h-13 sm:w-20 sm:h-24' : 'w-8 h-10 sm:w-16 sm:h-20',
                            )}
                          >
                            {/* Classic: perforated edges using radial-gradient mask/clip for realism */}
                            {style === 'classic' && (
                              <div
                                className="w-full h-full bg-[#fdf5e6] p-1.5 relative overflow-hidden"
                                style={{
                                  // CSS-only sawtooth wave pattern for edges
                                  mask: 'conic-gradient(from 45deg, transparent 0deg 90deg, black 90deg 360deg) 0 0/10px 10px round',
                                  WebkitMask:
                                    'conic-gradient(from 45deg, transparent 0deg 90deg, black 90deg 360deg) 0 0/10px 10px round',
                                }}
                              >
                                <div className="w-full h-full border-[1.5px] border-orange-300/60 flex flex-col items-center justify-between p-1 bg-white/40">
                                  <div className="text-[6px] sm:text-[8px] font-bold text-orange-900/80 uppercase tracking-wide text-center w-full truncate px-1">
                                    {label}
                                  </div>
                                  <div className="flex-1 flex items-center justify-center opacity-80 mix-blend-multiply">
                                    {/* Generic symbol */}
                                    <div className="w-8 h-8 sm:w-12 sm:h-12 border border-orange-200/50 rounded-full flex items-center justify-center">
                                      <img
                                        src="https://i.imgur.com/R21Yw3x.png"
                                        className="w-6 h-6 sm:w-9 sm:h-9 object-contain grayscale text-orange-900/50 opacity-60"
                                        alt="stamp"
                                      />
                                    </div>
                                  </div>
                                  <div className="text-[6px] sm:text-[8px] font-serif font-bold text-orange-900/60">
                                    {year}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Modern: Gradient, rounded */}
                            {style === 'modern' && (
                              <div className="w-full h-full rounded-lg bg-gradient-to-tr from-teal-50 to-white border border-teal-200 shadow-sm flex flex-col items-center justify-between p-2 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-teal-400/30"></div>
                                <div className="text-[6px] sm:text-[8px] font-bold text-teal-800 uppercase tracking-widest">
                                  {label}
                                </div>
                                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full border border-teal-200 flex items-center justify-center bg-teal-50/50">
                                  <span className="text-[8px] sm:text-[10px] font-bold text-teal-600/80">
                                    POST
                                  </span>
                                </div>
                                <div className="text-[7px] sm:text-[9px] font-semibold text-teal-700/60">
                                  {year}
                                </div>
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-teal-400/30"></div>
                              </div>
                            )}

                            {/* Airmail: Stripes */}
                            {style === 'airmail' && (
                              <div
                                className="w-full h-full bg-white p-1 shadow-sm relative overflow-hidden"
                                style={{
                                  mask: 'radial-gradient(circle at 2px 2px, transparent 2px, black 0) -2px -2px / 11px 11px repeat-x, radial-gradient(circle at 2px 2px, transparent 2px, black 0) -2px -2px / 11px 11px repeat-y',
                                  WebkitMask: 'radial-gradient(circle at 50% 50%, white, white)', // Fallback generic because radial zig-zag complex in CSS
                                }}
                              >
                                <div
                                  className="absolute inset-0 border-4 border-transparent"
                                  style={{
                                    backgroundImage:
                                      'repeating-linear-gradient(135deg, #ef4444 0, #ef4444 10px, transparent 10px, transparent 20px, #3b82f6 20px, #3b82f6 30px, transparent 30px, transparent 40px)',
                                  }}
                                ></div>
                                <div className="absolute inset-2 bg-white flex flex-col items-center justify-center gap-1 shadow-inner">
                                  <div className="text-[5px] sm:text-[6px] font-black text-blue-800 uppercase tracking-widest">
                                    AIR MAIL
                                  </div>
                                  <div className="text-[6px] sm:text-[8px] font-bold text-stone-600 text-center leading-none">
                                    {label}
                                  </div>
                                  <div className="text-[6px] sm:text-[8px] font-bold text-red-600">
                                    {year}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Subtle paper texture overlay */}
                            <div className="absolute inset-0 bg-stone-50 opacity-10 mix-blend-multiply pointer-events-none"></div>
                          </div>

                          {/* Realistic Postmark (Tampon) - SVG Overlay */}
                          <div
                            className={cn(
                              'absolute -left-6 top-5 pointer-events-none z-20 mix-blend-multiply opacity-85 transform -rotate-12',
                              isLarge ? 'w-16 h-16 sm:w-24 sm:h-24' : 'w-14 h-14 sm:w-18 sm:h-18',
                            )}
                          >
                            <svg
                              viewBox="0 0 100 100"
                              className="w-full h-full drop-shadow-sm text-stone-800/70 fill-current"
                            >
                              <defs>
                                <path
                                  id="curve"
                                  d="M 15,50 A 35,35 0 1,1 85,50 A 35,35 0 1,1 15,50"
                                />
                                <filter id="roughness">
                                  <feTurbulence
                                    type="fractalNoise"
                                    baseFrequency="0.8"
                                    numOctaves="3"
                                    result="noise"
                                  />
                                  <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" />
                                </filter>
                              </defs>
                              <g filter="url(#roughness)">
                                {/* Outer Circle */}
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="46"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                />
                                {/* Inner Circle */}
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="32"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1"
                                />

                                {/* Wavy lines */}
                                <path
                                  d="M10,50 Q30,45 50,50 T90,50"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="0.5"
                                  opacity="0.6"
                                />
                                <path
                                  d="M12,56 Q32,51 52,56 T88,56"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="0.5"
                                  opacity="0.6"
                                />
                                <path
                                  d="M12,44 Q32,39 52,44 T88,44"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="0.5"
                                  opacity="0.6"
                                />

                                {/* Text on curve */}
                                <text
                                  fontSize="7.5"
                                  fontWeight="bold"
                                  letterSpacing="1"
                                  textAnchor="middle"
                                >
                                  <textPath href="#curve" startOffset="50%" className="uppercase">
                                    {pmText.length > 20
                                      ? pmText.substring(0, 18) + '..'
                                      : pmText || 'POSTE AERIENNE'}
                                  </textPath>
                                </text>

                                {/* Center Date */}
                                <text
                                  x="50"
                                  y="52"
                                  fontSize="7"
                                  fontFamily="monospace"
                                  fontWeight="bold"
                                  textAnchor="middle"
                                  className="uppercase"
                                >
                                  {postcard.date.split('/').slice(0, 2).join('/')}
                                </text>
                                <text
                                  x="50"
                                  y="60"
                                  fontSize="7"
                                  fontFamily="monospace"
                                  fontWeight="bold"
                                  textAnchor="middle"
                                  className="uppercase"
                                >
                                  {postcard.date.split('/')[2] || '2024'}
                                </text>
                              </g>
                            </svg>
                          </div>
                        </div>
                      )
                    })()}
                  </div>

                  {/* Destinataire — Placé au-dessus de la carte maps */}
                  {postcard.recipientName && (
                    <div className="px-2 sm:px-3 mb-2 shrink-0">
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-1">
                        Destinataire
                      </p>
                      <p
                        className={cn(
                          'font-handwriting text-stone-700 whitespace-pre-wrap break-words leading-tight',
                          isLarge ? 'text-sm sm:text-lg' : 'text-xs sm:text-sm',
                        )}
                      >
                        {postcard.recipientName}
                      </p>
                    </div>
                  )}

                  {/* Mini carte au verso : tuiles OSM (évite iframe + 3D) ou bouton "Voir la carte" */}
                  {(postcard.coords || postcard.location) && (
                    <div
                      className={cn(
                        'flex-1 w-full rounded-lg overflow-hidden border border-stone-200/80 bg-stone-50 shadow-inner min-h-0',
                        isLarge
                          ? 'min-h-[100px] sm:min-h-[200px] md:min-h-[280px] max-h-[400px]'
                          : 'min-h-[80px] sm:min-h-[100px]',
                      )}
                    >
                      {postcard.coords ? (
                        <div
                          className="group/map relative w-full h-full flex flex-col items-center justify-center cursor-pointer overflow-hidden"
                          onClick={openMap}
                          role="button"
                          tabIndex={0}
                          title="Agrandir la carte"
                        >
                          {/* Carte statique en tuiles OSM (zoom contrôlé par backMapZoom) */}
                          {/* Leaflet MiniMap */}
                          <div className="absolute inset-0 overflow-hidden bg-stone-100">
                            <MiniMap
                              coords={postcard.coords!}
                              zoom={backMapZoom}
                              onClick={openMap}
                              photoLocations={photoLocations}
                            />
                          </div>
                          {/* Boutons zoom + / - au-dessus de la carte, cliquables sans déclencher flip ni ouverture modal */}
                          <div
                            className="absolute top-1.5 right-1.5 z-10 flex flex-col gap-0.5 shadow-md rounded-md overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setBackMapZoom((z) => Math.min(18, z + 1))
                              }}
                              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-white/95 hover:bg-white text-stone-600 hover:text-teal-600 border border-stone-200/80 transition-colors"
                              aria-label="Zoom avant"
                            >
                              <span className="text-lg font-bold leading-none">+</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setBackMapZoom((z) => Math.max(5, z - 1))
                              }}
                              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-white/95 hover:bg-white text-stone-600 hover:text-teal-600 border border-stone-200/80 transition-colors"
                              aria-label="Zoom arrière"
                            >
                              <span className="text-lg font-bold leading-none">−</span>
                            </button>
                          </div>
                          {/* Loupe dans un coin sans overlay au hover */}
                          <div className="absolute bottom-2 right-2 opacity-0 group-hover/map:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/95 shadow-lg text-teal-600 border border-stone-100">
                              <Search size={isLarge ? 20 : 16} strokeWidth={2.5} />
                            </div>
                          </div>
                          <span className="sr-only">Agrandir la carte</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={openMap}
                          className="group/map relative w-full h-full flex flex-col items-center justify-center gap-2 text-stone-500 hover:bg-stone-100/80 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-inset rounded-lg overflow-hidden"
                          title="Voir la carte"
                        >
                          <MapPin
                            size={isLarge ? 32 : 24}
                            className="text-teal-500 transition-opacity group-hover/map:opacity-60"
                          />
                          <span className="text-xs sm:text-sm font-semibold text-teal-700 uppercase tracking-wide transition-opacity group-hover/map:opacity-60">
                            Voir la carte
                          </span>
                          {/* Loupe dans un coin sans overlay au hover */}
                          <div className="absolute bottom-2 right-2 opacity-0 group-hover/map:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/95 shadow-lg text-teal-600 border border-stone-100">
                              <Search size={isLarge ? 20 : 16} strokeWidth={2.5} />
                            </div>
                          </div>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        <div
          className={cn(
            'flex flex-col items-center relative z-0 transition-all duration-500 ease-spring',
            !width &&
              !height &&
              (isLarge
                ? 'w-[95vw] max-w-[460px] sm:w-[552px] sm:max-w-none md:w-[736px] lg:w-[920px]'
                : 'w-full max-w-full sm:w-[552px]'),
          )}
          style={{
            // Coller au bas de la carte : annule gap-2 (8px) du parent
            marginTop: isActionsOpen ? -12 : -8,
          }}
        >
          <motion.div
            initial={false}
            animate={{
              y: isActionsOpen ? 0 : -20,
              opacity: isActionsOpen ? 1 : 0,
              pointerEvents: isActionsOpen ? 'auto' : 'none',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={cn(
              'w-full flex justify-center',
              !isActionsOpen && 'h-0 min-h-0 overflow-hidden',
            )}
          >
            <div className="flex items-center justify-center w-[95%] sm:w-[90%] flex-nowrap gap-2 sm:gap-3 rounded-b-xl border-x border-b border-stone-200/80 bg-gradient-to-b from-white/95 to-stone-50/95 backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.06)] px-2 py-1.5 sm:px-3 sm:py-2.5 min-h-[40px]">
              {hasMedia && (
                <button
                  onClick={openAlbum}
                  title="Voir les photos de la carte"
                  className={cn(
                    actionButtonBase,
                    'bg-amber-50 border border-amber-200/90 text-amber-800 hover:bg-amber-100 hover:border-amber-300 hover:shadow',
                  )}
                >
                  <Camera size={12} className="text-amber-600 shrink-0" />
                  <span>Album</span>
                  <span className="inline-flex items-center justify-center min-w-[1.25rem] h-3.5 px-1 rounded-md bg-amber-200/50 text-amber-900 text-[8px] font-extrabold leading-none mt-1 sm:mt-0 sm:ml-1">
                    {postcard.mediaItems!.length}
                  </span>
                </button>
              )}

              {(postcard.coords || postcard.location) && (
                <button
                  onClick={openMap}
                  className={cn(
                    actionButtonBase,
                    'bg-teal-50/80 border border-teal-200/70 text-teal-800 hover:bg-teal-100 hover:border-teal-300 hover:shadow',
                  )}
                  title="Localiser le lieu sur la carte"
                >
                  <MapPin size={12} className="text-teal-600 shrink-0" />
                  <span>Carte</span>
                </button>
              )}

              {!isFullscreen && !hideFullscreenButton && (
                <button
                  onClick={toggleFullscreen}
                  className={cn(
                    actionButtonBase,
                    'group bg-white border border-stone-200/80 text-stone-600 hover:text-teal-600 hover:border-teal-200 hover:shadow',
                  )}
                >
                  <Maximize2
                    size={12}
                    className="group-hover:scale-105 transition-transform shrink-0"
                  />
                  <span>Plein écran</span>
                </button>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleFlip()
                }}
                className={cn(
                  actionButtonBase,
                  'bg-white border border-stone-200/80 text-stone-600 hover:text-teal-600 hover:border-teal-200 hover:shadow',
                )}
                title="Retourner la carte"
              >
                <RotateCw size={12} className="shrink-0" />
                <span>Retourner</span>
              </button>

              {/* Close Button Integration */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsActionsOpen(false)
                }}
                className="inline-flex items-center justify-center w-6 h-6 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors ml-1"
                title="Masquer la barre"
              >
                <ChevronUp size={14} />
              </button>
            </div>
          </motion.div>

          {!isActionsOpen && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsActionsOpen(true)
              }}
              className="absolute top-full left-1/2 -translate-x-1/2 h-6 w-24 min-h-0 py-0.5 bg-white/80 hover:bg-white/95 backdrop-blur-md rounded-b-full shadow-[0_3px_6px_rgba(0,0,0,0.12)] border border-stone-200/80 text-stone-500 hover:text-teal-600 transition-all z-[-1] cursor-pointer flex justify-center items-center group/toggle"
              title="Afficher les actions"
            >
              <ChevronDown
                size={18}
                strokeWidth={2.5}
                className="group-hover/toggle:translate-y-0.5 transition-transform shrink-0"
              />
            </button>
          )}
        </div>
      </div>

      {renderAlbumModal()}
      {renderMessageModal()}
      {renderJournalModal()}

      {/* Audio Element (hidden) */}
      {postcard.audioMessage && (
        <audio
          ref={audioRef}
          src={postcard.audioMessage}
          onEnded={() => setIsPlayingAudio(false)}
          onPause={() => setIsPlayingAudio(false)}
          onPlay={() => setIsPlayingAudio(true)}
          className="hidden"
        />
      )}

      {/* New Leaflet Map Modal - Portaled to avoid perspective/transform issues */}
      {isMapOpen &&
        portalRoot &&
        createPortal(
          <MapModal
            isOpen={isMapOpen}
            onClose={() => setIsMapOpen(false)}
            location={postcard.location || ''}
            coords={postcard.coords}
            image={postcard.frontImage}
            message={postcard.message}
            isLarge={isLarge}
            photoLocations={photoLocations}
            onPhotoClick={handleMapPhotoClick}
          />,
          portalRoot,
        )}

      {/* Modal de plein écran */}
      {isFullscreen &&
        portalRoot &&
        createPortal(
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-[#fdfbf7] flex items-center justify-center p-4 md:p-8 overflow-hidden"
          >
            <button
              onClick={() => setIsFullscreen(false)}
              className="fixed top-6 right-6 z-[210] bg-white/90 p-4 rounded-full shadow-2xl border border-stone-200 text-stone-600 hover:text-stone-900 transition-all hover:rotate-90"
            >
              <X size={32} />
            </button>

            <div className="w-full h-full flex flex-col items-center justify-center">
              <PostcardView
                postcard={postcard}
                flipped={isFlipped}
                isLarge={true}
                width="min(95vw, 1100px)"
                height="min(63.3vw, 733px)"
                className="shadow-[0_40px_100px_rgba(0,0,0,0.3)]"
                hideFullscreenButton={true}
                hideFlipHints={true}
                isInsideFullscreen={true}
                onExitFullscreen={() => setIsFullscreen(false)}
              />
            </div>
          </motion.div>,
          portalRoot,
        )}
    </>
  )
}

export default PostcardView
