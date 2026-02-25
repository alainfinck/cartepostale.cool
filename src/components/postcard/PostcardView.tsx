'use client'

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { FrontImageFilter, Postcard } from '@/types'
import { getCaptionStyle, getCaptionExtraStyle, captionPresetHidesBg } from '@/lib/caption-style'
import { PhotoLocation } from '@/components/ui/PhotoMarker'
import fireConfetti from '@/components/ui/confetti'
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
  Music,
  MoreHorizontal,
  Link2,
  Heart,
  Eye,
} from 'lucide-react'
import { fireSideCannons } from '@/components/ui/confetti'
import { cn, isCoordinate } from '@/lib/utils'
import {
  AnimatePresence,
  motion,
  useSpring,
  useMotionValue,
  useTransform,
  animate,
} from 'framer-motion'
import dynamic from 'next/dynamic'
import { getOptimizedImageUrl } from '@/lib/image-processing'
import { uploadContribution } from '@/actions/contribute-actions'
import { useRouter } from 'next/navigation'
import { NumberTicker } from '@/components/ui/number-ticker'

// Dynamically import MapModal to avoid SSR issues with Leaflet
const MapModal = dynamic(() => import('@/components/ui/MapModal'), {
  ssr: false,
  loading: () => null,
})

const MiniMap = dynamic(() => import('@/components/postcard/MiniMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-stone-100 animate-pulse" />,
})

const AlbumPolaroidLightbox = dynamic(
  () => import('@/components/view/AlbumPolaroidLightbox').then((m) => m.default),
  { ssr: false },
)

// Dynamic import for JournalModal
const JournalModal = dynamic(() => import('@/components/postcard/JournalModal'), {
  ssr: false,
  loading: () => null,
})

const ShareContributionModal = dynamic(
  () => import('@/components/postcard/ShareContributionModal').then((m) => m.default),
  { ssr: false },
)

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
  /** Réglages du verso ouverts ou fermés par défaut (défaut : true). */
  defaultActionsOpen?: boolean
  views?: number
}

/** Position par défaut du texte d'accroche : en bas à gauche, au-dessus de la localisation */
const DEFAULT_CAPTION_POSITION = { x: 18, y: 88 }

const FALLBACK_FRONT_IMAGE =
  'https://img.cartepostale.cool/demo/photo-1507525428034-b723cf961d3e.jpg'
const DEFAULT_FRONT_FILTER: FrontImageFilter = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  sepia: 0,
  grayscale: 0,
}

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
]

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
  defaultActionsOpen = true,
  isPreview = false,
  views,
}) => {
  const [isFlipped, setIsFlipped] = useState(flipped ?? false)
  const [hasBeenFlipped, setHasBeenFlipped] = useState(flipped ?? false)
  const [isDraggingCaption, setIsDraggingCaption] = useState(false)
  const frontFaceRef = useRef<HTMLDivElement>(null)
  const [frontImageSrc, setFrontImageSrc] = useState(postcard.frontImage || FALLBACK_FRONT_IMAGE)
  const [isFrontImageLoading, setIsFrontImageLoading] = useState(!!postcard.frontImage)
  const frontImageRef = useRef<HTMLImageElement>(null)
  const [imgNaturalSize, setImgNaturalSize] = useState<{ w: number; h: number } | null>(null)

  const [localCaptionPos, setLocalCaptionPos] = useState(
    postcard.frontCaptionPosition ?? DEFAULT_CAPTION_POSITION,
  )

  const rafIdRef = useRef<number | null>(null)
  const lastUpdateRef = useRef(0)

  useEffect(() => {
    if (!isDraggingCaption) {
      setLocalCaptionPos(postcard.frontCaptionPosition ?? DEFAULT_CAPTION_POSITION)
    }
  }, [postcard.frontCaptionPosition, isDraggingCaption])

  const captionPos = isDraggingCaption
    ? localCaptionPos
    : (postcard.frontCaptionPosition ?? DEFAULT_CAPTION_POSITION)
  const usePositionedCaption =
    postcard.frontCaptionPosition != null || onCaptionPositionChange != null

  useEffect(() => {
    if (!isDraggingCaption || !onCaptionPositionChange) return

    const onMove = (e: PointerEvent) => {
      const el = frontFaceRef.current
      if (!el) return

      const now = performance.now()
      if (now - lastUpdateRef.current < 16) return
      lastUpdateRef.current = now

      if (rafIdRef.current != null) {
        cancelAnimationFrame(rafIdRef.current)
      }

      rafIdRef.current = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect()
        const xPct = ((e.clientX - rect.left) / rect.width) * 100
        const yPct = ((e.clientY - rect.top) / rect.height) * 100
        const x = Math.max(10, Math.min(90, xPct))
        const y = Math.max(10, Math.min(90, yPct))
        setLocalCaptionPos({ x, y })
      })
    }

    const onUp = () => {
      if (rafIdRef.current != null) {
        cancelAnimationFrame(rafIdRef.current)
      }
      setIsDraggingCaption(false)
      onCaptionPositionChange(localCaptionPos)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      if (rafIdRef.current != null) {
        cancelAnimationFrame(rafIdRef.current)
      }
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [isDraggingCaption, onCaptionPositionChange, localCaptionPos])

  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isFrontImageZoomOpen, setIsFrontImageZoomOpen] = useState(false)
  const frontImageFilterCss = buildFrontImageFilterCss(postcard.frontImageFilter)
  const effectiveBgOpacity = postcard.frontTextBgOpacity ?? frontTextBgOpacity ?? 90
  const clampedFrontTextBgOpacity = Math.max(0, Math.min(100, effectiveBgOpacity))
  const frontTextBgColor = `rgba(255, 255, 255, ${clampedFrontTextBgOpacity / 100})`
  const captionStyle = getCaptionStyle(postcard)
  const captionExtraStyle = getCaptionExtraStyle(postcard.frontCaptionPreset)
  const captionHidesBg = captionPresetHidesBg(postcard.frontCaptionPreset)
  const captionBgColor = captionHidesBg ? 'transparent' : frontTextBgColor

  // Sync isFullscreen with native browser fullscreen changes (ESC, browser button…)
  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false)
        document.body.style.overflow = ''
      }
    }
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  // Lock scroll while fullscreen overlay is open
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isFullscreen])

  // Lock scroll when front image zoom lightbox is open; close on Escape
  useEffect(() => {
    if (!isFrontImageZoomOpen) return
    document.body.style.overflow = 'hidden'
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFrontImageZoomOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isFrontImageZoomOpen])

  const toggleFullscreen = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isFullscreen) {
      try {
        await document.documentElement.requestFullscreen({ navigationUI: 'hide' })
      } catch {
        // Navigateur bloque la demande (ex: Firefox desktop sans geste utilisateur) — on continue en mode overlay
      }
      setIsFullscreen(true)
    } else {
      if (document.fullscreenElement) {
        await document.exitFullscreen().catch(() => {})
      }
      setIsFullscreen(false)
    }
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
  // Slightly more responsive spring so the keyframed animation isn't over-smoothed
  const springRotateY = useSpring(rotateY, { stiffness: 40, damping: 25 })

  // Derived opacity for faces to avoid ghosting in Safari/Chrome during 3D flip
  // Values derived from springRotateY to sync with animation and avoid "flash"
  const frontOpacity = useTransform(springRotateY, [88, 92, 268, 272], [1, 0, 0, 1])
  const backOpacity = useTransform(springRotateY, [88, 92, 268, 272], [0, 1, 1, 0])

  useEffect(() => {
    if (flipped !== undefined) {
      setIsFlipped(flipped)
      setHasBeenFlipped((prev) => prev || flipped)
      rotateY.set(flipped ? 180 : 0)
    }
  }, [flipped, rotateY])

  // Intro animation: one-time 360-degree spin with variable speed
  useEffect(() => {
    if (hasBeenFlipped || isFlipped || isPreview) return

    const timer = setTimeout(() => {
      // Use animate with keyframes:
      // 0 to 180 (reveal back) — takes 80% of duration (very slow)
      // 180 to 360 (return to front) — takes 20% of duration (snappy)
      animate(rotateY, [0, 180, 360], {
        duration: 6, // Total duration: slightly faster but still smooth
        times: [0, 0.82, 1], // Hits 180 degrees at 82% of time (~4.9s)
        ease: ['easeOut', 'easeIn'], // Natural feel
      })
    }, 4500) // Delay to match envelope opening + text appearance

    return () => clearTimeout(timer)
  }, [hasBeenFlipped, isFlipped, rotateY, isPreview])

  const [isMessageOpen, setIsMessageOpen] = useState(false)
  const [isAlbumOpen, setIsAlbumOpen] = useState(false)
  const [isJournalOpen, setIsJournalOpen] = useState(false) // New State
  const [isMapOpen, setIsMapOpen] = useState(false)
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null)
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [messageModalFontSize, setMessageModalFontSize] = useState(2)
  // Slider de taille du texte au verso (0.7 = petit, 2.2 = grand) — défaut réduit pour aperçu global
  const [backTextScale, setBackTextScale] = useState(isLarge ? 0.95 : 0.78)
  // Police du message au verso (dancing = défaut, greatVibes, parisienne, sans, serif)
  const [backMessageFont, setBackMessageFont] = useState<
    'dancing' | 'greatVibes' | 'parisienne' | 'sans' | 'serif'
  >('dancing')
  const [isFontMenuOpen, setIsFontMenuOpen] = useState(false)
  // Zoom de la mini-carte au verso (pour que + / - fonctionnent sans déclencher le flip)
  const [backMapZoom, setBackMapZoom] = useState(6)
  const [isActionsOpen, setIsActionsOpen] = useState(defaultActionsOpen)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const musicRef = useRef<HTMLAudioElement>(null)
  const [isPlayingMusic, setIsPlayingMusic] = useState(false)
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isTopMenuOpen, setIsTopMenuOpen] = useState(false)
  const [isShareContributionOpen, setIsShareContributionOpen] = useState(false)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !postcard.contributionToken) return

    setIsUploading(true)
    try {
      // 1. Get presigned URL
      const res = await fetch('/api/upload-presigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type,
          filesize: file.size,
        }),
      })

      if (!res.ok) throw new Error("Erreur lors de la préparation de l'envoi")
      const { url, key } = await res.json()

      // 2. Upload to S3
      const uploadRes = await fetch(url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })

      if (!uploadRes.ok) throw new Error("Erreur lors de l'envoi du fichier")

      // 3. Link to postcard
      const result = await uploadContribution(postcard.id, postcard.contributionToken, {
        key,
        mimeType: file.type,
        filesize: file.size,
      })

      if (!result.success) throw new Error(result.error)

      alert('Photo ajoutée avec succès !')
      router.refresh()
      // Optional: Close modal or switch to new photo
    } catch (err) {
      console.error(err)
      alert(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Calculate photo locations from EXIF data
  const photoLocations: PhotoLocation[] = React.useMemo(() => {
    if (!postcard.mediaItems || !Array.isArray(postcard.mediaItems)) return []

    const groups: Record<string, PhotoLocation> = {}

    postcard.mediaItems.forEach((item) => {
      const gps = item.exif?.gps
      if (gps && typeof gps.latitude === 'number' && typeof gps.longitude === 'number') {
        const key = `${gps.latitude.toFixed(4)},${gps.longitude.toFixed(4)}`
        if (!groups[key]) {
          groups[key] = {
            id: key,
            lat: gps.latitude,
            lng: gps.longitude,
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

    const children = postcard.message
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

    // Recherche binaire précise en pixels
    // Pour les textes courts, on peut aller beaucoup plus haut pour l'effet "gros texte"
    const wordCount = children.split(/\s+/).length
    let low = 6
    let high = wordCount < 10 ? (isLarge ? 120 : 90) : isLarge ? 80 : 60
    let best = 16

    const currentScale = 1

    for (let i = 0; i < 15; i++) {
      const mid = (low + high) / 2
      const scaledMid = mid * currentScale
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
    const minSize = isLarge ? 1.0 : 0.5
    setAutoFontSize(Math.max(finalSizeRem, minSize))
  }, [isLarge, backTextScale]) // backTextScale ajouté en dépendance pour recalculer si l'utilisateur bouge le slider

  // Ajustement automatique : au flip et au changement de message/échelle
  useLayoutEffect(() => {
    computeAutoFontSize()
    // Reset scroll au cas où il y a du débordement
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = 0
    }
    // En plein écran : recalculer après layout (conteneur peut avoir 0 au premier paint)
    if (isLarge) {
      const t1 = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          computeAutoFontSize()
          if (messageContainerRef.current) messageContainerRef.current.scrollTop = 0
        })
      })
      const t2 = window.setTimeout(() => {
        computeAutoFontSize()
        if (messageContainerRef.current) messageContainerRef.current.scrollTop = 0
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
    setHasBeenFlipped(true)
    rotateY.set(newFlippedState ? 180 : 0)
  }

  const openAlbum = (e: React.MouseEvent) => {
    e.stopPropagation()
    const albumSection = document.getElementById('photo-feed')
    // Sur la page carte/view : uniquement scroll vers la section album, pas de modal
    if (albumSection) {
      albumSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    // Ailleurs (ex. éditeur) : ouvrir le modal + confettis
    fireConfetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })
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

  const toggleMusic = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!postcard.backgroundMusic || !musicRef.current) return

    if (isPlayingMusic) {
      musicRef.current.pause()
    } else {
      musicRef.current.play().catch((err) => console.error('Music play failed', err))
    }
  }

  const hasMedia = postcard.mediaItems && postcard.mediaItems.length > 0

  const actionButtonBase =
    'flex-none inline-flex flex-row items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-[11px] font-semibold uppercase active:scale-95 transition-all shadow-sm border text-center min-h-[36px] sm:min-h-[44px] min-w-0 overflow-hidden whitespace-nowrap'

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
        className="fixed inset-0 z-[999] bg-stone-900/90 backdrop-blur-md flex items-center justify-center p-4 md:p-6"
        onClick={() => setIsMessageOpen(false)}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="w-full max-w-[95vw] md:max-w-2xl max-h-[85dvh] md:max-h-[75vh] md:h-auto min-h-0 bg-[#FCF5EB] rounded-2xl shadow-2xl p-4 md:p-6 relative overflow-hidden flex flex-col items-center text-center border-4 border-white/50"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/5 rounded-full -ml-16 -mb-16 blur-3xl"></div>

          <button
            onClick={() => setIsMessageOpen(false)}
            className="absolute top-2 right-2 md:top-3 md:right-3 z-[100] bg-white hover:bg-stone-100 text-stone-500 hover:text-stone-800 p-1.5 md:p-2 rounded-full transition-all shadow-md border border-stone-200 group/close"
          >
            <X
              size={18}
              className="md:w-5 md:h-5 group-hover/close:rotate-90 transition-transform duration-300"
            />
          </button>

          {/* Header compact */}
          <div className="w-full flex flex-col items-center gap-0.5 pointer-events-none z-[90] pb-2">
            {postcard.location && (
              <p className="text-xs md:text-sm font-semibold text-teal-700 flex items-center justify-center gap-1">
                <MapPin size={14} className="text-teal-500 shrink-0" />
                {postcard.location}
              </p>
            )}
            <p className="text-[9px] md:text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              Carte reçue de {postcard.senderName || '…'}
            </p>
          </div>

          <div className="w-16 h-1 bg-stone-100 rounded-full mb-3 opacity-50 shrink-0"></div>

          <div className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden custom-scrollbar px-4 flex flex-col pt-0">
            <p
              className="font-handwriting text-stone-700 leading-relaxed text-center whitespace-pre-wrap pt-2 pb-6 w-full max-w-full break-words"
              style={{ fontSize: `${messageModalFontSize}rem` }}
            >
              {postcard.message}
            </p>
          </div>

          <div className="w-full h-px bg-stone-100 my-3 shrink-0"></div>

          {/* Footer compact : Envoyé de + Contrôle Taille + Signature alignés */}
          <div className="w-full flex flex-row items-center justify-between gap-2 shrink-0 pb-1 px-1">
            <div className="flex flex-col text-left shrink-0">
              <p className="text-[8px] font-bold text-stone-400 uppercase tracking-widest leading-tight">
                Envoyé de
              </p>
              <p className="text-stone-600 font-medium flex items-center gap-1 text-[10px] md:text-xs uppercase leading-tight">
                <MapPin size={10} className="text-teal-600 shrink-0" />
                {postcard.location}
              </p>
            </div>

            {/* Size Controls */}
            <div className="flex items-center gap-1.5 shrink-0 bg-stone-50/50 p-1 rounded-full border border-stone-100">
              <button
                type="button"
                onClick={() =>
                  setMessageModalFontSize((s) => Math.max(1, Number((s - 0.1).toFixed(1))))
                }
                className="p-1 rounded-full hover:bg-stone-200 text-stone-600 transition-colors bg-white shadow-sm"
                title="Diminuer la taille"
              >
                <Minus size={12} />
              </button>
              <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">
                Taille
              </span>
              <button
                type="button"
                onClick={() =>
                  setMessageModalFontSize((s) => Math.min(4, Number((s + 0.1).toFixed(1))))
                }
                className="p-1 rounded-full hover:bg-stone-200 text-stone-600 transition-colors bg-white shadow-sm"
                title="Augmenter la taille"
              >
                <Plus size={12} />
              </button>
              <span className="text-[9px] font-medium text-stone-500 tabular-nums w-6 text-right">
                {Math.round(messageModalFontSize * 100)}%
              </span>
            </div>

            <p className="font-handwriting font-semibold text-teal-700 text-lg md:text-2xl rotate-[-2deg] shrink-0 text-right">
              - {postcard.senderName}
            </p>
          </div>
        </motion.div>
      </motion.div>,
      portalRoot,
    )
  }

  const canContribute = postcard.contributionToken && postcard.isContributionEnabled !== false
  const showAlbumOrContribute = hasMedia || canContribute

  const renderAlbumModal = () => {
    if (!portalRoot || !isAlbumOpen) return null
    if (!showAlbumOrContribute) return null

    // Avec photos : lightbox diapo polaroid (même expérience qu'en bas sur la page carte)
    if (hasMedia && postcard.mediaItems) {
      return createPortal(
        <AnimatePresence>
          <AlbumPolaroidLightbox
            mediaItems={postcard.mediaItems}
            senderName={postcard.senderName}
            initialIndex={currentMediaIndex}
            onClose={() => setIsAlbumOpen(false)}
            extraTopLeft={
              canContribute ? (
                <>
                  <button
                    onClick={handleUploadClick}
                    disabled={isUploading}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Camera size={16} />
                    )}
                    <span className="hidden sm:inline">Ajouter une photo</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </>
              ) : undefined
            }
          />
        </AnimatePresence>,
        portalRoot,
      )
    }

    // Sans photos : overlay vide + contribution
    return createPortal(
      <div
        className="fixed inset-0 z-[999] bg-black/98 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
        onClick={() => setIsAlbumOpen(false)}
      >
        <div
          className="w-full max-w-4xl flex flex-col items-center relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setIsAlbumOpen(false)}
            className="absolute -top-10 right-4 md:-top-4 md:-right-12 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all shadow-lg backdrop-blur-md border border-white/20 z-[1000]"
          >
            <X size={28} />
          </button>
          {canContribute && (
            <div className="absolute -top-12 left-0 right-0 flex flex-wrap justify-center gap-2 z-50">
              <button
                onClick={handleUploadClick}
                disabled={isUploading}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Camera size={16} />
                )}
                <span className="hidden sm:inline">Ajouter une photo</span>
              </button>
              {postcard.contributionToken && (
                <button
                  onClick={() => {
                    setIsAlbumOpen(false)
                    setIsShareContributionOpen(true)
                  }}
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/40 px-4 py-2 rounded-full text-sm font-bold shadow-lg transition-all flex items-center gap-2"
                >
                  <Link2 size={16} />
                  <span className="hidden sm:inline">Partager le lien</span>
                </button>
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          )}
          <div className="flex flex-col items-center justify-center gap-4 text-white/80 p-8 text-center">
            <Camera size={48} className="opacity-60" />
            <p className="text-lg font-semibold">Aucune photo pour le moment</p>
            <p className="text-sm max-w-sm">
              Ajoutez la première photo ou partagez le lien pour inviter d&apos;autres personnes à
              contribuer.
            </p>
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
        <AnimatePresence>
          {isFlipped && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.1 }}
              className="flex justify-center pointer-events-none z-20 w-full mb-1 sm:mb-2"
            >
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-stone-200/80 text-teal-700 shadow-sm">
                <Search size={12} className="shrink-0 text-teal-500/80" strokeWidth={2.5} />
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.1em] whitespace-nowrap">
                  Cliquez sur le texte ou la carte pour agrandir
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className={cn(
            'perspective-1000 group transition-shadow duration-300 relative z-10 flex-shrink-0', // z-10 for layering; no cursor-grab so card only flips via button
            !width &&
              !height &&
              (isLarge
                ? 'w-[95vw] h-[71.25vw] max-w-[460px] max-h-[345px] sm:w-[552px] sm:h-[414px] md:w-[660px] md:h-[495px] lg:w-[780px] lg:h-[585px] xl:w-[840px] xl:h-[630px] sm:max-w-none sm:max-h-none portrait:max-h-none'
                : 'w-full max-w-full sm:w-[552px] aspect-[4/3] sm:h-[414px]'),
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
                isFlipped ? 'pointer-events-none' : !onCaptionPositionChange && 'cursor-pointer',
              )}
              onClick={onCaptionPositionChange ? undefined : handleFlip}
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
                      // The container aspect is fixed at 4/3 (same as POSTCARD_ASPECT)
                      const POSTCARD_ASPECT = 4 / 3

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
                      srcSet={`
                        ${getOptimizedImageUrl(frontImageSrc, { width: 640 })} 640w,
                        ${getOptimizedImageUrl(frontImageSrc, { width: 960 })} 960w,
                        ${getOptimizedImageUrl(frontImageSrc, { width: 1280 })} 1280w,
                        ${getOptimizedImageUrl(frontImageSrc, { width: 1600 })} 1600w
                      `}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 800px, 1200px"
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
                    srcSet={`
                      ${getOptimizedImageUrl(frontImageSrc, { width: 640 })} 640w,
                      ${getOptimizedImageUrl(frontImageSrc, { width: 960 })} 960w,
                      ${getOptimizedImageUrl(frontImageSrc, { width: 1280 })} 1280w,
                      ${getOptimizedImageUrl(frontImageSrc, { width: 1600 })} 1600w
                    `}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 800px, 1200px"
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

              {/* Emoji Stickers Rendering */}
              {postcard.emojiStickers && postcard.emojiStickers.length > 0 && (
                <div className="absolute inset-0 pointer-events-none z-15">
                  {postcard.emojiStickers.map((es, index) => (
                    <motion.div
                      key={es.id}
                      className="absolute select-none"
                      initial={{ opacity: 0, scale: 0, x: '-50%', y: '-50%' }}
                      animate={{ opacity: 1, scale: es.scale, x: '-50%', y: '-50%' }}
                      transition={{
                        type: 'spring',
                        stiffness: 260,
                        damping: 20,
                        delay: 0.5 + 0.1 * index,
                      }}
                      style={{
                        left: `${es.x}%`,
                        top: `${es.y}%`,
                        fontSize: '48px',
                        lineHeight: 1,
                        userSelect: 'none',
                      }}
                    >
                      {es.emoji}
                    </motion.div>
                  ))}
                </div>
              )}

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

              {/* Loupe : afficher l'image de la face avant en grand (en bas à droite) */}
              {!isFullscreen && !onCaptionPositionChange && frontImageSrc && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsFrontImageZoomOpen(true)
                  }}
                  className="absolute right-12 bottom-3 sm:right-14 sm:bottom-4 z-30 flex items-center justify-center w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow-lg border border-stone-200/80 text-stone-600 hover:text-stone-900 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                  aria-label="Voir l'image en grand"
                >
                  <Search size={18} strokeWidth={2} />
                </button>
              )}

              {/* Message "Cliquer pour retourner" au survol (Front) — masqué en fullscreen, en mode éditeur (pour pouvoir déplacer le texte), ou via prop */}
              {!isFullscreen && !hideFlipHints && !onCaptionPositionChange && (
                <div
                  className={cn(
                    'absolute top-3 right-3 z-30 transition-all duration-500 pointer-events-none',
                    !hasBeenFlipped
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0',
                  )}
                >
                  <div className="bg-stone-800/95 backdrop-blur-md px-3 py-2.5 rounded-xl border border-stone-600/50 shadow-xl flex items-center gap-2 transform transition-all duration-300">
                    <RotateCw
                      size={16}
                      className={cn('text-white shrink-0', !hasBeenFlipped && 'animate-spin-slow')}
                      strokeWidth={2}
                    />
                    <span className="text-white font-bold uppercase tracking-wider text-[9px] sm:text-[10px] md:text-xs whitespace-nowrap">
                      {!hasBeenFlipped ? 'Cliquez pour retourner' : 'Retourner la carte'}
                    </span>
                  </div>
                </div>
              )}

              {/* Message démo au-dessus de la localisation (frontCaption sans frontEmoji) — déplaçable en mode éditeur */}
              {postcard.frontCaption?.trim() && !postcard.frontEmoji && (
                <div
                  className={cn(
                    'z-20 w-fit max-w-[calc(100%-2rem)] sm:max-w-[calc(100%-3rem)] px-3 py-2 sm:px-4 sm:py-2.5 rounded-md transition-all',
                    !captionHidesBg && 'border border-white/50',
                    usePositionedCaption
                      ? 'absolute'
                      : 'absolute left-4 sm:left-6 bottom-14 sm:bottom-16',
                    onCaptionPositionChange &&
                      'cursor-grab active:cursor-grabbing touch-none select-none',
                    isDraggingCaption
                      ? 'shadow-[0_12px_40px_rgb(0,0,0,0.2)] ring-2 ring-teal-400/50'
                      : !captionHidesBg &&
                          'shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_10px_35px_rgb(0,0,0,0.15)]',
                  )}
                  style={
                    usePositionedCaption
                      ? {
                          left: `${captionPos.x}%`,
                          top: `${captionPos.y}%`,
                          transform: 'translate(-50%, -50%)',
                          backgroundColor: captionBgColor,
                          willChange: isDraggingCaption ? 'transform, left, top' : 'auto',
                          ...(postcard.frontCaptionWidth != null && {
                            width: `${postcard.frontCaptionWidth}%`,
                          }),
                        }
                      : {
                          backgroundColor: captionHidesBg
                            ? 'transparent'
                            : 'rgba(255,255,255,0.65)',
                          ...(postcard.frontCaptionWidth != null && {
                            width: `${postcard.frontCaptionWidth}%`,
                          }),
                        }
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
                  <p
                    className="m-0 font-bold leading-tight tracking-tight break-words"
                    style={{
                      fontFamily: captionStyle.fontFamily,
                      fontSize: captionStyle.fontSize,
                      color: captionStyle.color,
                      textShadow:
                        captionStyle.color === '#ffffff' || captionStyle.color === '#000000'
                          ? '0 1px 2px rgba(0,0,0,0.2), 0 1px 4px rgba(0,0,0,0.15)'
                          : '0 1px 2px rgba(255,255,255,0.8)',
                      ...captionExtraStyle,
                    }}
                  >
                    {postcard.frontCaption}
                  </p>
                </div>
              )}

              {/* Lieu du souvenir : toujours en bas à gauche, position fixe pour éviter tout décalage */}
              {postcard.location && !isCoordinate(postcard.location) && (
                <div className="absolute left-4 sm:left-6 bottom-4 sm:bottom-6 z-10 bg-white/90 backdrop-blur-md text-teal-900 px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-semibold shadow-lg flex items-center gap-1.5">
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
                    'z-20 flex items-center gap-3 rounded-2xl sm:rounded-3xl px-5 py-3.5 sm:px-6 sm:py-4 transition-all w-fit max-w-[calc(100%-2rem)]',
                    !captionHidesBg && 'border border-white/50',
                    usePositionedCaption
                      ? 'absolute'
                      : 'absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6',
                    onCaptionPositionChange &&
                      'cursor-grab active:cursor-grabbing touch-none select-none',
                    isDraggingCaption
                      ? 'shadow-[0_12px_40px_rgb(0,0,0,0.2)] ring-2 ring-teal-400/50'
                      : !captionHidesBg &&
                          'shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_10px_35px_rgb(0,0,0,0.15)]',
                  )}
                  style={
                    usePositionedCaption
                      ? {
                          left: `${captionPos.x}%`,
                          top: `${captionPos.y}%`,
                          transform: 'translate(-50%, -50%)',
                          backgroundColor: captionBgColor,
                          willChange: isDraggingCaption ? 'transform, left, top' : 'auto',
                          ...(postcard.frontCaptionWidth != null && {
                            width: `${postcard.frontCaptionWidth}%`,
                          }),
                        }
                      : {
                          backgroundColor: captionBgColor,
                          ...(postcard.frontCaptionWidth != null && {
                            width: `${postcard.frontCaptionWidth}%`,
                          }),
                        }
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
                  <p
                    className="m-0 font-bold leading-tight tracking-tight break-words line-clamp-2"
                    style={{
                      fontFamily: captionStyle.fontFamily,
                      fontSize: captionStyle.fontSize,
                      color: captionStyle.color,
                      textShadow:
                        captionStyle.color === '#ffffff' || captionStyle.color === '#000000'
                          ? '0 1px 2px rgba(0,0,0,0.2), 0 1px 4px rgba(0,0,0,0.15)'
                          : '0 1px 2px rgba(255,255,255,0.8)',
                      ...captionExtraStyle,
                    }}
                  >
                    {postcard.frontCaption}
                  </p>
                </div>
              )}

              {/* Views badge on front cover */}
              {views !== undefined && views > 0 && (
                <div className="absolute right-3 bottom-3 sm:right-5 sm:bottom-5 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-stone-200 shadow-xl text-stone-600 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transform transition-all hover:scale-105 active:scale-95">
                  <Eye size={12} className="text-teal-500 shrink-0" />
                  <NumberTicker value={views} className="font-extrabold text-stone-800" />
                  <span className="opacity-70">vues</span>
                </div>
              )}
            </motion.div>

            {/* Back of Card — masqué en mode recto (Safari: backface-visibility insuffisant) */}
            <motion.div
              className={cn(
                'absolute w-full h-full backface-hidden rounded-xl shadow-2xl bg-[#FCF5EB] paper-texture flex flex-col overflow-hidden',
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
              {/* Subtle grain overlay for extra paper feel */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] z-50"></div>

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
                  'absolute top-2 sm:top-4 z-20 flex items-center justify-start gap-2 w-full px-2 sm:px-4',
                )}
                onClick={(e) => e.stopPropagation()}
              >
                {/* All Controls grouped to the left — same height for zoom, font, more */}
                <div className="flex items-stretch gap-2">
                  {/* Zoom Controls */}
                  <div className="h-7 sm:h-9 flex shrink-0 items-center bg-white/80 backdrop-blur-md rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setBackTextScale((s) => Math.max(0.7, Number((s - 0.05).toFixed(2))))
                      }}
                      className="w-8 sm:w-10 h-full flex items-center justify-center hover:bg-stone-50 text-stone-500 hover:text-teal-600 transition-colors border-r border-stone-100"
                      title="Réduire la taille du texte"
                    >
                      <Minus size={16} strokeWidth={2.5} />
                    </button>
                    <div className="w-8 sm:w-10 h-full flex items-center justify-center bg-white/50">
                      <span className="text-sm sm:text-base font-bold text-stone-600 select-none">
                        A
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setBackTextScale((s) => Math.min(2.2, Number((s + 0.05).toFixed(2))))
                      }}
                      className="w-8 sm:w-10 h-full flex items-center justify-center hover:bg-stone-50 text-stone-500 hover:text-teal-600 transition-colors border-l border-stone-100"
                      title="Agrandir la taille du texte"
                    >
                      <Plus size={16} strokeWidth={2.5} />
                    </button>
                  </div>

                  {/* Font selector for message */}
                  <div className="relative flex">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsFontMenuOpen((o) => !o)
                        setIsTopMenuOpen(false)
                      }}
                      className={cn(
                        'h-full min-h-[1.75rem] sm:min-h-[2.25rem] px-2.5 sm:px-3 flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-stone-200 shadow-sm transition-all backdrop-blur-md',
                        isFontMenuOpen
                          ? 'bg-teal-50 border-teal-300 text-teal-700'
                          : 'bg-white/80 text-stone-600 hover:text-teal-600 hover:border-stone-300',
                      )}
                      title="Changer la police du message"
                    >
                      <span
                        className="text-sm font-bold select-none"
                        style={{
                          fontFamily: BACK_MESSAGE_FONTS.find((f) => f.id === backMessageFont)
                            ?.fontFamily,
                        }}
                      >
                        Aa
                      </span>
                    </button>
                    <AnimatePresence>
                      {isFontMenuOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-[64]"
                            onClick={() => setIsFontMenuOpen(false)}
                            aria-hidden
                          />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 4 }}
                            className="absolute left-0 mt-2 w-44 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-stone-200 overflow-hidden z-[70] py-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {BACK_MESSAGE_FONTS.map((font) => (
                              <button
                                key={font.id}
                                type="button"
                                onClick={() => {
                                  setBackMessageFont(font.id)
                                  setIsFontMenuOpen(false)
                                }}
                                className={cn(
                                  'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors',
                                  backMessageFont === font.id
                                    ? 'bg-teal-50 text-teal-700'
                                    : 'hover:bg-stone-50 text-stone-600',
                                )}
                              >
                                <span
                                  className="text-base font-bold"
                                  style={{ fontFamily: font.fontFamily }}
                                >
                                  Aa
                                </span>
                                <span className="text-xs font-medium truncate">{font.name}</span>
                              </button>
                            ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Actions Dropdown */}
                  <div className="relative flex">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsFontMenuOpen(false)
                        setIsTopMenuOpen(!isTopMenuOpen)
                      }}
                      className={cn(
                        'h-full min-h-[1.75rem] sm:min-h-[2.25rem] w-7 sm:w-9 flex shrink-0 items-center justify-center rounded-xl backdrop-blur-md border border-stone-200 transition-all shadow-sm',
                        isTopMenuOpen
                          ? 'bg-teal-50 border-teal-300 text-teal-600 shadow-inner'
                          : 'bg-white/80 text-stone-600 hover:text-teal-600',
                      )}
                      title="Plus d'actions"
                    >
                      <MoreHorizontal size={18} strokeWidth={2} />
                    </button>

                    <AnimatePresence>
                      {isTopMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden z-[70] p-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Fullscreen Option */}
                          {!hideFullscreenButton && (
                            <button
                              type="button"
                              onClick={(e) => {
                                setIsTopMenuOpen(false)
                                if (isInsideFullscreen && onExitFullscreen) onExitFullscreen()
                                else toggleFullscreen(e)
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-stone-50 text-stone-600 hover:text-teal-600 transition-colors text-left"
                            >
                              {isFullscreen || isInsideFullscreen ? (
                                <>
                                  <Minimize2 size={16} />
                                  <span className="text-xs font-bold uppercase tracking-wider">
                                    Quitter plein écran
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Maximize2 size={16} />
                                  <span className="text-xs font-bold uppercase tracking-wider">
                                    Plein écran
                                  </span>
                                </>
                              )}
                            </button>
                          )}

                          {/* Album photos */}
                          {(hasMedia || canContribute) && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setIsTopMenuOpen(false)
                                openAlbum(e)
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-stone-50 text-stone-600 hover:text-amber-600 transition-colors text-left"
                            >
                              <Camera size={16} />
                              <span className="text-xs font-bold uppercase tracking-wider">
                                {hasMedia ? "Voir l'album photos" : 'Ajouter des photos'}
                              </span>
                            </button>
                          )}

                          {/* Flip Option */}
                          <button
                            type="button"
                            onClick={() => {
                              setIsTopMenuOpen(false)
                              handleFlip()
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-stone-50 text-stone-600 hover:text-teal-600 transition-colors text-left"
                          >
                            <RotateCw size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">
                              Retourner
                            </span>
                          </button>

                          {/* Journal Option */}
                          {hasMedia && (
                            <button
                              type="button"
                              onClick={(e) => {
                                setIsTopMenuOpen(false)
                                openJournal(e)
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-stone-50 text-stone-600 hover:text-amber-600 transition-colors text-left"
                            >
                              <BookOpen size={16} />
                              <span className="text-xs font-bold uppercase tracking-wider">
                                Carnet de voyage
                              </span>
                            </button>
                          )}

                          {/* Message vocal et Musique d'ambiance côte à côte */}
                          {(postcard.audioMessage || postcard.backgroundMusic) && (
                            <div className="flex gap-2 w-full">
                              {postcard.audioMessage && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    setIsTopMenuOpen(false)
                                    toggleAudio(e)
                                  }}
                                  className={cn(
                                    'flex-1 min-w-0 flex items-center justify-center gap-2 px-2.5 py-2.5 rounded-xl transition-colors text-left sm:justify-start sm:px-3',
                                    isPlayingAudio
                                      ? 'bg-rose-50 text-rose-600'
                                      : 'hover:bg-stone-50 text-stone-600 hover:text-rose-600',
                                  )}
                                >
                                  {isPlayingAudio ? (
                                    <Volume2 size={16} className="animate-pulse shrink-0" />
                                  ) : (
                                    <Mic size={16} className="shrink-0" />
                                  )}
                                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate">
                                    {isPlayingAudio ? "Arrêter l'audio" : 'Message vocal'}
                                  </span>
                                </button>
                              )}
                              {postcard.backgroundMusic && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    setIsTopMenuOpen(false)
                                    toggleMusic(e)
                                  }}
                                  className={cn(
                                    'flex-1 min-w-0 flex items-center justify-center gap-2 px-2.5 py-2.5 rounded-xl transition-colors text-left sm:justify-start sm:px-3',
                                    isPlayingMusic
                                      ? 'bg-violet-50 text-violet-600'
                                      : 'hover:bg-stone-50 text-stone-600 hover:text-violet-600',
                                  )}
                                >
                                  {isPlayingMusic ? (
                                    <Volume2 size={16} className="animate-pulse shrink-0" />
                                  ) : (
                                    <Music size={16} className="shrink-0" />
                                  )}
                                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate">
                                    {isPlayingMusic ? 'Arrêter la musique' : "Musique d'ambiance"}
                                  </span>
                                </button>
                              )}
                            </div>
                          )}

                          {/* Partager le lien pour que d'autres ajoutent des photos */}
                          {canContribute && postcard.contributionToken && (
                            <button
                              type="button"
                              onClick={() => {
                                setIsTopMenuOpen(false)
                                setIsShareContributionOpen(true)
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-stone-50 text-stone-600 hover:text-teal-600 transition-colors text-left"
                            >
                              <Link2 size={16} className="shrink-0" />
                              <span className="text-xs font-bold uppercase tracking-wider">
                                Partager le lien pour ajouter des photos
                              </span>
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Global Click Handler to close menu */}
                {isTopMenuOpen && (
                  <div className="fixed inset-0 z-[65]" onClick={() => setIsTopMenuOpen(false)} />
                )}
              </div>

              {/* Contenu (texte + timbre/carte) sous la barre de contrôle — z-10 < z-60 de la barre */}
              {/* Reduced general padding, added specific margin for Left column to clear controls */}
              <div className="relative z-10 flex w-full flex-1 min-h-0 gap-2 sm:gap-6 pt-4 sm:pt-4 transition-all duration-300">
                {/* Left Side: Message - marge gauche généreuse pour éviter troncature (police manuscrite) */}
                <div
                  className={cn(
                    'min-w-0 flex flex-col justify-start relative pl-[2px] sm:pl-[2px] pr-2 sm:pr-4 mt-8 sm:mt-10', // Added mt to clear top controls
                    isLarge ? 'flex-[1.5]' : 'flex-[1.2]',
                  )}
                >
                  {/* Infos en haut (Lieu & Date) */}
                  <div className="px-3 sm:px-5 mb-1 shrink-0">
                    <p className="text-[10px] sm:text-xs font-bold text-stone-400/80 italic">
                      {postcard.location && `${postcard.location}, le `}
                      {postcard.date}
                    </p>
                  </div>
                  <div className="flex flex-1 min-h-0 gap-1.5 sm:gap-2 items-stretch">
                    {/* Removed individual loupe here */}
                    <div
                      ref={messageContainerRef}
                      className="flex-1 w-full min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar mt-2 mb-1 cursor-pointer group/msg relative pr-2 pl-1 sm:pl-2 block"
                      onClick={openMessage}
                    >
                      <p
                        ref={messageTextRef}
                        className="text-stone-700 leading-[1.2] text-left whitespace-pre-wrap w-full max-w-full break-words pl-2 sm:pl-3"
                        style={{
                          fontSize: `${autoFontSize * backTextScale}rem`,
                          fontFamily:
                            BACK_MESSAGE_FONTS.find((f) => f.id === backMessageFont)?.fontFamily ??
                            "'Dancing Script', cursive",
                        }}
                      >
                        {postcard.message}
                      </p>

                      {/* Hint zoom au survol - removed internal message as it's now handled globally below */}
                    </div>
                  </div>
                  {/* Texte explicite sous la zone message : supprimé car unifié ci-dessous */}
                  {postcard.senderName && (
                    <div className="mt-auto -mt-2 self-start transform -rotate-2 pt-2 pb-1 px-2 sm:px-4 relative shrink-0">
                      <div className="absolute inset-0 bg-teal-50/30 blur-md rounded-full -rotate-3"></div>
                      <p
                        className="text-teal-700 text-xl sm:text-3xl relative z-10 font-bold drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]"
                        style={{
                          fontFamily:
                            BACK_MESSAGE_FONTS.find((f) => f.id === backMessageFont)?.fontFamily ??
                            "'Dancing Script', cursive",
                        }}
                      >
                        - {postcard.senderName}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Side: Stamp + Map */}
                <div className="flex-1 h-full flex flex-col relative min-w-0 pt-0 min-h-[8rem] sm:min-h-[10rem]">
                  {/* Removed individual loupe on map */}
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

                  {/* Destinataire — Placé en haut de la colonne, avec marge négative pour remonter */}
                  {postcard.recipientName?.trim() && (
                    <div className="px-2 sm:px-3 mb-4 shrink-0 -mt-2 sm:-mt-4">
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-1">
                        À l&apos;attention de
                      </p>
                      <p
                        className={cn(
                          'text-stone-700 whitespace-pre-wrap break-words leading-tight',
                          isLarge ? 'text-sm sm:text-lg' : 'text-xs sm:text-sm',
                        )}
                        style={{
                          fontFamily:
                            BACK_MESSAGE_FONTS.find((f) => f.id === backMessageFont)?.fontFamily ??
                            "'Dancing Script', cursive",
                        }}
                      >
                        {postcard.recipientName}
                      </p>
                    </div>
                  )}

                  {/* Mini carte au verso : avec label de lieu juste au dessus */}
                  {!postcard.hideMap && (postcard.coords || postcard.location) && (
                    <div className="mt-auto flex flex-col gap-1.5 w-full flex-1 min-h-0">
                      <div className="px-2 sm:px-4 flex items-center gap-2 text-stone-500 shrink-0">
                        <MapPin size={14} className="text-teal-600" />
                        <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.2em] truncate">
                          {postcard.location || 'Localisation'}
                        </span>
                      </div>
                      <div
                        className={cn(
                          'mb-1 sm:mb-2 w-full flex-1 min-h-[120px] sm:min-h-[200px] lg:min-h-[350px] rounded-lg overflow-hidden border border-stone-200/80 bg-stone-50 shadow-inner relative',
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
                            {/* Leaflet MiniMap */}
                            <div className="absolute inset-0 overflow-hidden bg-stone-100">
                              <MiniMap
                                coords={postcard.coords!}
                                zoom={backMapZoom}
                                onClick={openMap}
                                photoLocations={photoLocations}
                              />
                            </div>
                            {/* Loupe dans un coin sans overlay au hover */}
                            <div className="absolute bottom-2 left-2 opacity-0 group-hover/map:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
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
                            <div className="absolute bottom-2 left-2 opacity-0 group-hover/map:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/95 shadow-lg text-teal-600 border border-stone-100">
                                <Search size={isLarge ? 20 : 16} strokeWidth={2.5} />
                              </div>
                            </div>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        <div
          className={cn(
            'flex flex-col items-center relative z-0 pb-12',
            !width && !height && 'w-full max-w-4xl',
          )}
          style={{
            marginTop: -12, // Collé au bas de la carte (languette barre et barre d’actions)
          }}
        >
          <motion.div
            initial={false}
            animate={{
              height: isActionsOpen ? 'auto' : 0,
              rotateX: isActionsOpen ? 0 : -100,
              opacity: isActionsOpen ? 1 : 0,
              pointerEvents: isActionsOpen ? 'auto' : 'none',
            }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 35,
              opacity: { duration: 0.2 },
            }}
            className="w-full flex justify-center overflow-hidden"
            style={{ transformOrigin: 'top', transformStyle: 'preserve-3d' }}
          >
            <div className="flex items-center justify-center w-full flex-nowrap gap-2 sm:gap-3 px-4 sm:px-8 py-4">
              {(hasMedia || canContribute) && (
                <button
                  onClick={openAlbum}
                  title={hasMedia ? 'Voir les photos de la carte' : 'Ajouter des photos'}
                  className={cn(
                    actionButtonBase,
                    'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100 hover:border-amber-300 transition-colors shrink-0',
                  )}
                >
                  <Camera size={14} className="text-amber-700 shrink-0" />
                  <span className="truncate text-center leading-tight text-[10px] sm:text-[11px] font-semibold">
                    {hasMedia ? 'ALBUM' : '+ PHOTOS'}
                  </span>
                </button>
              )}

              {(postcard.coords || postcard.location) && (
                <button
                  onClick={openMap}
                  className={cn(
                    actionButtonBase,
                    'bg-teal-100 border-teal-200 text-teal-900 hover:bg-teal-200 transition-all shrink-0',
                  )}
                  title="Localiser le lieu sur la carte"
                >
                  <MapPin size={14} className="text-teal-600 shrink-0" />
                  <span className="truncate">CARTE</span>
                </button>
              )}

              {postcard.backgroundMusic && (
                <button
                  onClick={toggleMusic}
                  className={cn(
                    actionButtonBase,
                    'shrink-0',
                    isPlayingMusic
                      ? 'bg-violet-600 text-white border-violet-700'
                      : 'bg-violet-100 border-violet-200 text-violet-900 hover:bg-violet-200 transition-all',
                  )}
                  title="Musique d'ambiance"
                >
                  <Music
                    size={14}
                    className={cn('shrink-0', isPlayingMusic ? 'text-white' : 'text-violet-600')}
                  />
                  <span className="truncate">MUSIQUE</span>
                </button>
              )}

              {!isFullscreen && !hideFullscreenButton && (
                <button
                  onClick={toggleFullscreen}
                  className={cn(
                    actionButtonBase,
                    'group bg-white border-stone-200 text-stone-900 hover:text-teal-600 hover:bg-stone-50 transition-all shrink-0',
                  )}
                >
                  <Maximize2
                    size={14}
                    className="group-hover:scale-105 transition-transform shrink-0"
                  />
                  <span className="truncate">PLEIN ÉCRAN</span>
                </button>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleFlip()
                }}
                className={cn(
                  actionButtonBase,
                  'group bg-white border-stone-200 text-stone-900 hover:text-teal-600 hover:bg-stone-50 transition-all shrink-0',
                )}
                title="Retourner la carte"
              >
                <RotateCw
                  size={14}
                  className="group-hover:rotate-180 transition-transform duration-500 shrink-0"
                />
                <span className="truncate">RETOURNER</span>
              </button>

              {/* Close Button Integration */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsActionsOpen(false)
                }}
                className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/80 text-stone-600 hover:text-stone-800 transition-colors shrink-0 ml-0.5"
                title="Masquer la barre"
              >
                <ChevronUp size={24} strokeWidth={2} className="shrink-0" />
              </button>
            </div>
          </motion.div>

          {!isActionsOpen && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsActionsOpen(true)
              }}
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-px h-6 w-24 min-h-0 py-0.5 bg-white/90 hover:bg-white/95 backdrop-blur-md rounded-b-full shadow-[0_3px_6px_rgba(0,0,0,0.12)] border border-t-0 border-stone-200/80 text-stone-500 hover:text-teal-600 transition-all z-30 cursor-pointer flex justify-center items-center group/toggle"
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
      {isShareContributionOpen && postcard.contributionToken && (
        <ShareContributionModal
          isOpen={isShareContributionOpen}
          onClose={() => setIsShareContributionOpen(false)}
          contributeUrl={
            typeof window !== 'undefined'
              ? `${window.location.origin}/carte/${postcard.id}?token=${postcard.contributionToken}`
              : ''
          }
        />
      )}

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

      {/* Background Music Element (hidden) */}
      {postcard.backgroundMusic && (
        <audio
          ref={musicRef}
          src={postcard.backgroundMusic}
          loop
          onPause={() => setIsPlayingMusic(false)}
          onPlay={() => setIsPlayingMusic(true)}
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
                    src={getOptimizedImageUrl(frontImageSrc, { width: 1600 })}
                    alt="Face avant de la carte postale"
                    className="w-full h-full object-cover"
                    style={{
                      objectPosition: postcard.frontImageCrop
                        ? `${postcard.frontImageCrop.x}% ${postcard.frontImageCrop.y}%`
                        : undefined,
                      transform: postcard.frontImageCrop
                        ? `scale(${postcard.frontImageCrop.scale})`
                        : undefined,
                      filter: frontImageFilterCss,
                    }}
                    draggable={false}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          portalRoot,
        )}

      {/* Modal de plein écran : fond sombre, carte centrée avec marges, adapté portrait/paysage */}
      {portalRoot &&
        createPortal(
          <AnimatePresence>
            {isFullscreen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[999] bg-black/90 flex items-center justify-center overflow-hidden"
                style={{
                  padding:
                    'max(1rem, env(safe-area-inset-top)) max(1rem, env(safe-area-inset-right)) max(1rem, env(safe-area-inset-bottom)) max(1rem, env(safe-area-inset-left))',
                }}
              >
                {/* Croix fermer en haut à droite */}
                <button
                  type="button"
                  onClick={() => {
                    if (document.fullscreenElement) {
                      document.exitFullscreen().catch(() => {})
                    }
                    setIsFullscreen(false)
                  }}
                  className="fixed z-[210] flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white shadow-xl text-stone-700 hover:bg-stone-100 hover:rotate-90 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900"
                  style={{
                    top: 'max(1rem, env(safe-area-inset-top))',
                    right: 'max(1rem, env(safe-area-inset-right))',
                  }}
                  aria-label="Fermer le plein écran"
                >
                  <X size={24} className="sm:w-7 sm:h-7" strokeWidth={2.5} />
                </button>

                <PostcardView
                  postcard={postcard}
                  flipped={isFlipped}
                  isLarge={true}
                  hideFullscreenButton={true}
                  hideFlipHints={true}
                  isInsideFullscreen={true}
                  onExitFullscreen={() => {
                    if (document.fullscreenElement) {
                      document.exitFullscreen().catch(() => {})
                    }
                    setIsFullscreen(false)
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>,
          portalRoot,
        )}
    </>
  )
}

export default PostcardView
