'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import confetti from 'canvas-confetti'
import {
  Upload,
  Type,
  MapPin,
  Eye,
  ChevronRight,
  ChevronLeft,
  Image as ImageIcon,
  Stamp,
  Send,
  Sparkles,
  X,
  Check,
  Camera,
  Plane,
  PenTool,
  RefreshCw,
  Locate,
  Navigation,
  User,
  Users,
  Copy,
  Facebook,
  Linkedin,

  Share2,
  Maximize2,
  MessageSquare,
  Mail,
  CreditCard,
  Crop,
} from 'lucide-react'
import { Postcard, Template, FrontImageCrop } from '@/types'
import PostcardView from '@/components/postcard/PostcardView'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { createPostcard } from '@/actions/postcard-actions'
import { linkPostcardToUser } from '@/actions/auth-actions'

import {
  fileToProcessedDataUrl as fileToDataUrl,
  urlToResizedDataUrl,
  dataUrlToBlob,
  readFileAsDataUrl,
  MAX_IMAGE_PX,
  JPEG_QUALITY
} from '@/lib/image-processing'

const POSTCARD_ASPECT = 3 / 2

/**
 * Génère une image recadrée 3:2 à partir d'une data URL et des paramètres de zoom/position.
 * Utilisé à l'enregistrement pour "figer" le cadrage choisi par l'utilisateur.
 */
function bakeFrontImageCrop(dataUrl: string, crop: FrontImageCrop, outputPx = 1200): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const imgW = img.naturalWidth
      const imgH = img.naturalHeight
      const cw = Math.round(outputPx)
      const ch = Math.round(outputPx / POSTCARD_ASPECT)
      const coverScale = Math.max(cw / imgW, ch / imgH)
      const userScale = crop.scale
      const visibleW = cw / (coverScale * userScale)
      const visibleH = ch / (coverScale * userScale)
      const centerX = (crop.x / 100) * imgW
      const centerY = (crop.y / 100) * imgH
      const sx = Math.max(0, Math.min(imgW - visibleW, centerX - visibleW / 2))
      const sy = Math.max(0, Math.min(imgH - visibleH, centerY - visibleH / 2))
      const canvas = document.createElement('canvas')
      canvas.width = cw
      canvas.height = ch
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(dataUrl)
        return
      }
      ctx.drawImage(img, sx, sy, visibleW, visibleH, 0, 0, cw, ch)
      try {
        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY))
      } catch {
        resolve(dataUrl)
      }
    }
    img.onerror = () => reject(new Error('Image load failed'))
    img.src = dataUrl
  })
}

const STEPS = [
  { id: 'photo', label: 'Photo', icon: Camera },
  { id: 'redaction', label: 'Rédaction', icon: PenTool },
  { id: 'payment', label: 'Paiement', icon: CreditCard },
  { id: 'preview', label: 'Aperçu', icon: Eye },
] as const

type StepId = (typeof STEPS)[number]['id']

const SAMPLE_TEMPLATES: Template[] = [
  {
    id: 'tpl-1',
    name: 'Plage tropicale',
    imageUrl:
      '/images/demo/photo-1507525428034-b723cf961d3e.jpg',
    category: 'Beach',
  },
  {
    id: 'tpl-2',
    name: 'Coucher de soleil',
    imageUrl:
      '/images/demo/photo-1476514525535-07fb3b4ae5f1.jpg',
    category: 'Beach',
  },
  {
    id: 'tpl-3',
    name: 'Paris romantique',
    imageUrl:
      '/images/demo/photo-1502602898657-3e91760cbb34.jpg',
    category: 'City',
  },
  {
    id: 'tpl-4',
    name: 'Tokyo néons',
    imageUrl:
      '/images/demo/photo-1540959733332-eab4deabeeaf.jpg',
    category: 'City',
  },
  {
    id: 'tpl-5',
    name: 'Alpes suisses',
    imageUrl:
      '/images/demo/photo-1531366936337-7c912a4589a7.jpg',
    category: 'Mountain',
  },
  {
    id: 'tpl-6',
    name: 'Côte Amalfitaine',
    imageUrl:
      '/images/demo/photo-1534113414509-0eec2bfb493f.jpg',
    category: 'City',
  },
  {
    id: 'tpl-7',
    name: 'Forêt enchantée',
    imageUrl:
      '/images/demo/photo-1448375240586-882707db888b.jpg',
    category: 'Mountain',
  },
  {
    id: 'tpl-8',
    name: 'Désert doré',
    imageUrl:
      '/images/demo/photo-1509316785289-025f5b846b35.jpg',
    category: 'Abstract',
  },
]

const EMOJI_SUGGESTIONS = ['✨', '📍', '🌅', '🌴', '💌', '🌊', '🗺️'] as const

/** Emojis rapides pour le message (carte postale). */
const MESSAGE_EMOJIS = ['❤️', '😊', '🌅', '🌴', '🌊', '☀️', '💌', '✨', '📍', '🗺️', '😘', '👋', '💕', '🌸', '🏖️']

const ALBUM_TIERS = {
  tier1: { photos: 10, videos: 0, price: 1 },
  tier2: { photos: 50, videos: 3, price: 2 }
} as const

export default function EditorPage() {
  const [currentStep, setCurrentStep] = useState<StepId>('photo')
  const [selectedCategory, setSelectedCategory] = useState<Template['category'] | 'all'>('all')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLocating, setIsLocating] = useState(false)

  // Postcard state
  const [frontImage, setFrontImage] = useState('')
  const [frontCaption, setFrontCaption] = useState('Souvenirs magiques')
  const [frontEmoji, setFrontEmoji] = useState('✨')
  const [message, setMessage] = useState('Un petit coucou de mes vacances ! Tout se passe merveilleusement bien, les paysages sont magnifiques. On pense bien à vous !')
  const [recipientName, setRecipientName] = useState('Maman & Papa')
  const [senderName, setSenderName] = useState('Sarah')
  const [senderEmail, setSenderEmail] = useState('')
  const [location, setLocation] = useState('Antibes, France')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)

  const [stampStyle, setStampStyle] = useState<Postcard['stampStyle']>('classic')
  const [stampLabel, setStampLabel] = useState('Digital Poste')
  const [stampYear, setStampYear] = useState('2024')
  const [postmarkText, setPostmarkText] = useState('')
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [frontImageKey, setFrontImageKey] = useState<string | null>(null)
  const [frontImageMimeType, setFrontImageMimeType] = useState<string | null>(null)
  const [frontImageFilesize, setFrontImageFilesize] = useState<number | null>(null)
  /** Recadrage / zoom de la photo face avant (position en %, scale 1 = fit). */
  const [frontImageCrop, setFrontImageCrop] = useState<FrontImageCrop>({ scale: 1, x: 50, y: 50 })
  const [showCropPanel, setShowCropPanel] = useState(false)
  const [imgNaturalSize, setImgNaturalSize] = useState<{ w: number; h: number } | null>(null)
  const [cropContainerSize, setCropContainerSize] = useState<{ w: number; h: number } | null>(null)
  const cropAreaRef = useRef<HTMLDivElement>(null)
  const cropImgRef = useRef<HTMLImageElement>(null)
  const cropDragRef = useRef<{ clientX: number; clientY: number; cropX: number; cropY: number } | null>(null)
  const messageInputRef = useRef<HTMLTextAreaElement>(null)

  const [mediaItems, setMediaItems] = useState<Postcard['mediaItems']>([])
  const [isPremium, setIsPremium] = useState(false)
  const [showFullscreen, setShowFullscreen] = useState(false)
  const [showRecipientModal, setShowRecipientModal] = useState(false)

  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | 'revolut' | null>(null)

  // Sharing state
  const [isPublishing, setIsPublishing] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [createdPostcardId, setCreatedPostcardId] = useState<string | null>(null)
  const [shareError, setShareError] = useState<string | null>(null)

  const [showCopyToast, setShowCopyToast] = useState(false)
  const [hasConfettiFired, setHasConfettiFired] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep)
  const showBack = currentStep === 'redaction'

  useEffect(() => {
    if (currentStep === 'preview' && !isPublishing) {
      handlePublish()
    }
  }, [currentStep])

  // Trigger confetti once when shareUrl becomes available
  useEffect(() => {
    if (shareUrl && !hasConfettiFired) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#14b8a6', '#f59e0b', '#3b82f6', '#ec4899']
      })
      setHasConfettiFired(true)
    }
  }, [shareUrl, hasConfettiFired])

  // De base : afficher ma position sur la carte (géolocalisation au chargement)
  useEffect(() => {
    if (coords || !navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setCoords({ lat: latitude, lng: longitude })
        setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
      },
      () => { /* refus ou erreur : l’utilisateur peut cliquer sur « Ma position actuelle » */ }
    )
  }, [])

  useEffect(() => {
    if (!showCropPanel || !cropAreaRef.current) {
      setCropContainerSize(null)
      return
    }
    const el = cropAreaRef.current
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0]?.contentRect ?? { width: 0, height: 0 }
      if (width && height) setCropContainerSize({ w: width, h: height })
    })
    ro.observe(el)
    setCropContainerSize({ w: el.getBoundingClientRect().width, h: el.getBoundingClientRect().height })
    return () => ro.disconnect()
  }, [showCropPanel])

  const canGoNext = () => {
    switch (currentStep) {
      case 'photo':
        return frontImage !== ''
      case 'redaction':
        // Un seul critère : au moins un message. Destinataire / expéditeur / lieu optionnels (valeurs par défaut à l’envoi).
        return message.trim().length > 0
      case 'payment':
        return paymentMethod !== null
      case 'preview':
        return true
      default:
        return false
    }
  }

  const goNext = () => {
    if (currentStepIndex < STEPS.length - 1 && canGoNext()) {
      const nextStep = STEPS[currentStepIndex + 1].id
      if (nextStep === 'payment' && getAlbumPrice() === 0) {
        // Skip payment if free
        setCurrentStep('preview')
      } else {
        setCurrentStep(nextStep)
      }
    }
  }

  const goPrev = () => {
    if (currentStepIndex > 0) {
      const prevStep = STEPS[currentStepIndex - 1].id
      if (prevStep === 'payment' && getAlbumPrice() === 0) {
        // Skip payment if free
        setCurrentStep('redaction')
      } else {
        setCurrentStep(prevStep)
      }
    }
  }

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadedFileName(file.name)

    // Resize max 2k, JPEG 80%, puis upload du résultat (pas l’original)
    const dataUrl = await fileToDataUrl(file).catch(() => null)
    if (!dataUrl) {
      setUploadedFileName('')
      alert('Impossible de charger cette image. Utilisez une photo en JPEG ou PNG.')
      return
    }

    const blob = await dataUrlToBlob(dataUrl)
    const safeName = `postcard-front-${Date.now()}.jpg`

    try {
      const presignedRes = await fetch('/api/upload-presigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: safeName,
          mimeType: 'image/jpeg',
          filesize: blob.size,
        }),
      })
      if (presignedRes.ok) {
        const { url, key } = await presignedRes.json()
        const putRes = await fetch(url, {
          method: 'PUT',
          body: blob,
          headers: { 'Content-Type': 'image/jpeg' },
        })
        if (putRes.ok) {
          setFrontImageKey(key)
          setFrontImageMimeType('image/jpeg')
          setFrontImageFilesize(blob.size)
          setFrontImage(dataUrl)
          setFrontImageCrop({ scale: 1, x: 50, y: 50 })
          setSelectedTemplateId(null)
          return
        }
      }
    } catch (_) {
      /* fallback to base64 */
    }
    setFrontImageKey(null)
    setFrontImageMimeType(null)
    setFrontImageFilesize(null)
    setFrontImage(dataUrl)
    setFrontImageCrop({ scale: 1, x: 50, y: 50 })
    setSelectedTemplateId(null)
  }, [])

  const handleSelectTemplate = useCallback(async (template: Template) => {
    setUploadedFileName('')
    setSelectedTemplateId(template.id)
    setFrontImageKey(null)
    setFrontImageMimeType(null)
    setFrontImageFilesize(null)
    setFrontImageCrop({ scale: 1, x: 50, y: 50 })
    try {
      const resized = await urlToResizedDataUrl(template.imageUrl)
      setFrontImage(resized)
    } catch {
      setFrontImage(template.imageUrl)
    }
  }, [])

  const handleCropImgLoad = useCallback(() => {
    const img = cropImgRef.current
    if (img?.naturalWidth && img.naturalHeight) setImgNaturalSize({ w: img.naturalWidth, h: img.naturalHeight })
  }, [])

  const handleCropPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      cropDragRef.current = { clientX: e.clientX, clientY: e.clientY, cropX: frontImageCrop.x, cropY: frontImageCrop.y }
        ; (e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    },
    [frontImageCrop.x, frontImageCrop.y]
  )

  const handleCropPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const drag = cropDragRef.current
      if (!drag || !imgNaturalSize || !cropAreaRef.current) return
      const rect = cropAreaRef.current.getBoundingClientRect()
      const coverScale = Math.max(rect.width / imgNaturalSize.w, rect.height / imgNaturalSize.h)
      const displayScale = coverScale * frontImageCrop.scale
      const dx = e.clientX - drag.clientX
      const dy = e.clientY - drag.clientY
      const deltaXPercent = (dx / (imgNaturalSize.w * displayScale)) * 100
      const deltaYPercent = (dy / (imgNaturalSize.h * displayScale)) * 100
      const newX = Math.max(0, Math.min(100, drag.cropX - deltaXPercent))
      const newY = Math.max(0, Math.min(100, drag.cropY - deltaYPercent))
      setFrontImageCrop((c) => ({ ...c, x: newX, y: newY }))
      cropDragRef.current = { clientX: e.clientX, clientY: e.clientY, cropX: newX, cropY: newY }
    },
    [frontImageCrop.scale, imgNaturalSize]
  )

  const handleCropPointerUp = useCallback((e: React.PointerEvent) => {
    cropDragRef.current = null
      ; (e.target as HTMLElement).releasePointerCapture?.(e.pointerId)
  }, [])

  const handleGeolocation = () => {
    if (!navigator.geolocation) return
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false)
        const { latitude, longitude } = position.coords
        setCoords({ lat: latitude, lng: longitude })
        // Reverse geocoding could be added here to set the location string
        setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
      },
      () => {
        setIsLocating(false)
      }
    )
  }

  const handleAlbumUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''

    for (const file of files) {
      const isVideo = file.type.startsWith('video/')

        ; (async () => {
          const type = isVideo ? ('video' as const) : ('image' as const)
          const newId = Date.now() + Math.random().toString()

          if (isVideo) {
            const previewUrl = await readFileAsDataUrl(file).catch(() => null)
            if (!previewUrl) {
              alert('Impossible de charger la vidéo.')
              return
            }
            setMediaItems((prev) => {
              const videos = (prev || []).filter((i) => i.type === 'video').length
              if (videos >= ALBUM_TIERS.tier2.videos) {
                alert(`Limite de ${ALBUM_TIERS.tier2.videos} vidéos atteinte.`)
                return prev || []
              }
              return [...(prev || []), { id: newId, type: 'video', url: previewUrl } as any]
            })
            setIsPremium(true)
            return
          }

          // Image: resize max 2k JPEG 80%, puis upload R2 (presigned), fallback base64
          const previewUrl = await fileToDataUrl(file).catch(() => null)
          if (!previewUrl) {
            alert('Impossible de charger un fichier. Utilisez des photos en JPEG ou PNG.')
            return
          }
          let key: string | undefined
          let mimeType: string | undefined
          let filesize: number | undefined
          const blob = await dataUrlToBlob(previewUrl)
          const safeName = `postcard-album-${Date.now()}-${Math.random().toString(36).slice(2, 9)}.jpg`
          try {
            const presignedRes = await fetch('/api/upload-presigned', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                filename: safeName,
                mimeType: 'image/jpeg',
                filesize: blob.size,
              }),
            })
            if (presignedRes.ok) {
              const { url, key: k } = await presignedRes.json()
              const putRes = await fetch(url, {
                method: 'PUT',
                body: blob,
                headers: { 'Content-Type': 'image/jpeg' },
              })
              if (putRes.ok) {
                key = k
                mimeType = 'image/jpeg'
                filesize = blob.size
              }
            }
          } catch (_) {
            /* fallback to base64 */
          }

          setMediaItems((prev) => {
            const photos = (prev || []).filter((i) => i.type === 'image').length
            if (photos >= ALBUM_TIERS.tier2.photos) {
              alert(`Limite de ${ALBUM_TIERS.tier2.photos} photos atteinte.`)
              return prev || []
            }
            const newItem = {
              id: newId,
              type: 'image',
              url: previewUrl,
              ...(key && { key, mimeType, filesize }),
            } as any
            return [...(prev || []), newItem]
          })
          setIsPremium(true)
        })()
    }
  }

  const getAlbumPrice = () => {
    if (!mediaItems || mediaItems.length === 0) return 0
    const photos = mediaItems.filter(i => i.type === 'image').length
    const videos = mediaItems.filter(i => i.type === 'video').length

    if (photos <= ALBUM_TIERS.tier1.photos && videos === 0) {
      return ALBUM_TIERS.tier1.price
    }
    return ALBUM_TIERS.tier2.price
  }

  const removeMediaItem = (id: string) => {
    setMediaItems((prev) => {
      const updated = prev?.filter((item) => item.id !== id) || []
      setIsPremium(updated.length > 0)
      return updated
    })
  }

  const currentPostcard: Postcard = {
    id: createdPostcardId || 'editor-preview',
    frontImage:
      frontImage ||
      '/images/demo/photo-1507525428034-b723cf961d3e.jpg',
    frontImageCrop: frontImage ? frontImageCrop : undefined,
    frontCaption: frontCaption.trim() || undefined,
    frontEmoji: frontEmoji.trim() || undefined,
    message: message || '',
    recipientName: recipientName || '',
    senderName: senderName || '',
    senderEmail: senderEmail || undefined,

    location: location || '',
    stampStyle,
    stampLabel: stampLabel.trim() || undefined,
    stampYear: stampYear.trim() || undefined,
    postmarkText: postmarkText.trim() || undefined,
    date: new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    isPremium,
    mediaItems,
    coords: coords || undefined,
  }

  const filteredTemplates =
    selectedCategory === 'all'
      ? SAMPLE_TEMPLATES
      : SAMPLE_TEMPLATES.filter((t) => t.category === selectedCategory)

  const handlePublish = async () => {
    setIsPublishing(true)
    setShareError(null)

    try {
      let finalFrontImage = currentPostcard.frontImage
      let sendKey = frontImageKey
      let sendMime = frontImageMimeType
      let sendFilesize = frontImageFilesize
      const hasCrop = frontImageCrop.scale !== 1 || frontImageCrop.x !== 50 || frontImageCrop.y !== 50
      const canBake = frontImage && (frontImage.startsWith('data:') || frontImage.startsWith('http') || frontImage.startsWith('/'))
      if (canBake && hasCrop) {
        try {
          const imgUrl = frontImage.startsWith('data:') ? frontImage : (typeof window !== 'undefined' && frontImage.startsWith('/') ? window.location.origin + frontImage : frontImage)
          const dataUrl = frontImage.startsWith('data:') ? frontImage : await fetch(imgUrl).then((r) => r.blob()).then((b) => new Promise<string>((res, rej) => { const reader = new FileReader(); reader.onloadend = () => res(reader.result as string); reader.onerror = rej; reader.readAsDataURL(b) }))
          finalFrontImage = await bakeFrontImageCrop(dataUrl, frontImageCrop)
          sendKey = null
          sendMime = null
          sendFilesize = null
        } catch (_) {
          /* keep original image if bake fails */
        }
      }

      const result = await createPostcard({
        ...currentPostcard,
        frontImage: finalFrontImage,
        recipients: [],
        ...(sendKey && {
          frontImageKey: sendKey,
          frontImageMimeType: sendMime ?? undefined,
          frontImageFilesize: sendFilesize ?? undefined,
        }),
      })

      if (result.success && result.publicId) {
        setCreatedPostcardId(result.publicId)
        setShareUrl(`${window.location.origin}/carte/${result.publicId}`)
        // No longer switching step, sharing UI appears in 'preview' step
      } else {
        setShareError(result.error || 'Une erreur est survenue lors de la création de la carte.')
      }
    } catch (err: any) {
      console.error('Publish error:', err)
      setShareError('Une erreur critique est survenue. Veuillez réessayer.')
    } finally {
      setIsPublishing(false)
    }
  }

  const copyToClipboard = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl)
      setShowCopyToast(true)
      setTimeout(() => setShowCopyToast(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7]">
      {/* Step Progress Bar */}
      <div className="bg-white border-b border-stone-200 sticky top-20 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              const isActive = step.id === currentStep
              const isCompleted = index < currentStepIndex
              const isPayment = step.id === 'payment'
              const isSkipped = isPayment && getAlbumPrice() === 0

              if (isSkipped) return null

              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => {
                      if (index <= currentStepIndex || canGoNext()) {
                        setCurrentStep(step.id)
                      }
                    }}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-semibold',
                      isActive
                        ? 'bg-teal-500 text-white shadow-md shadow-teal-200'
                        : isCompleted
                          ? 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                          : 'bg-stone-100 text-stone-400'
                    )}
                  >
                    {isCompleted ? <Check size={16} /> : <Icon size={16} />}
                    <span className="hidden sm:inline">{step.label}</span>
                  </button>
                  {index < STEPS.length - 1 && !isSkipped && (
                    <div
                      className={cn(
                        'flex-1 h-0.5 mx-2 rounded-full transition-colors',
                        index < currentStepIndex ? 'bg-teal-400' : 'bg-stone-200'
                      )}
                    />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Panel: Carte (aperçu en direct) */}
          <div className="hidden lg:block w-[600px] flex-shrink-0">
            <div className="sticky top-44">
              <div className="flex items-center gap-2 mb-4">
                <Eye size={16} className="text-teal-500" />
                <span className="text-sm font-bold text-stone-500 uppercase tracking-wider">
                  Aperçu en direct
                </span>
                <div className="flex items-center gap-1.5 ml-auto text-stone-400 text-xs font-medium">
                  <RefreshCw size={12} className="animate-spin" style={{ animationDuration: '3s' }} />
                  Mise à jour en temps réel
                </div>
              </div>
              <PostcardView postcard={currentPostcard} flipped={showBack} className="w-full h-auto aspect-[3/2] shadow-xl rounded-xl border border-stone-100" />
              <div className="mt-4 flex flex-col gap-4">
                <p className="text-stone-400 text-[10px] uppercase tracking-widest font-bold text-center">L&apos;aperçu se met à jour en temps réel</p>

                <div className="flex flex-col w-full gap-3">
                  <Button
                    onClick={() => setShowFullscreen(true)}
                    variant="outline"
                    className="w-full text-stone-600 border-stone-200 hover:bg-stone-50 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 h-10 transition-all group"
                  >
                    <Maximize2 size={14} className="group-hover:scale-110 transition-transform" />
                    Aperçu en plein écran
                  </Button>

                  {/* Bouton Continuer à gauche sous la carte */}
                  {(currentStep === 'photo' || currentStep === 'redaction') && (
                    <div className="flex justify-start">
                      <Button
                        onClick={goNext}
                        disabled={!canGoNext()}
                        className={cn(
                          'rounded-xl font-bold flex items-center justify-center gap-2 px-6 py-4 h-auto transition-all shadow-lg shadow-teal-100',
                          canGoNext()
                            ? 'bg-teal-500 hover:bg-teal-600 text-white'
                            : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                        )}
                      >
                        Continuer
                        <ChevronRight size={18} />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Editor Controls */}
          <div className="flex-1 min-w-0">
            {/* ==================== STEP: PHOTO ==================== */}
            {currentStep === 'photo' && (
              <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 sm:p-8">
                <h2 className="text-2xl font-serif font-bold text-stone-800 mb-2">
                  Choisissez votre photo
                </h2>
                <p className="text-stone-500 mb-6">
                  Importez votre plus belle photo ou choisissez parmi nos modèles.
                </p>

                {/* Upload Zone */}
                <div
                  className={cn(
                    'relative border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all hover:border-teal-400 hover:bg-teal-50/50 mb-8 group',
                    frontImage && !uploadedFileName
                      ? 'border-stone-200 bg-stone-50 p-8'
                      : uploadedFileName
                        ? 'border-teal-400 bg-teal-50/30 p-4'
                        : 'border-stone-300 p-8'
                  )}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.heic,.heif,.avif,.webp,.tiff,.bmp"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  {uploadedFileName ? (
                    <div className="flex items-center gap-4 justify-center text-left">
                      {frontImage && (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 flex-shrink-0">
                          <img
                            src={frontImage}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center inline-flex mb-1">
                          <Check size={16} className="text-teal-600" />
                        </div>
                        <p className="text-teal-700 font-semibold truncate">{uploadedFileName}</p>
                        <p className="text-stone-400 text-xs">Cliquez pour changer</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-stone-100 group-hover:bg-teal-100 flex items-center justify-center transition-colors">
                        <Upload
                          size={28}
                          className="text-stone-400 group-hover:text-teal-600 transition-colors"
                        />
                      </div>
                      <div>
                        <p className="text-stone-700 font-semibold">Glissez votre photo ici</p>
                        <p className="text-stone-400 text-sm mt-1">
                          ou cliquez pour parcourir (JPG, PNG, WebP)
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex-1 h-px bg-stone-200" />
                  <span className="text-stone-400 text-sm font-semibold uppercase tracking-wider">
                    ou choisissez un modèle
                  </span>
                  <div className="flex-1 h-px bg-stone-200" />
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {(['all', 'Beach', 'City', 'Mountain', 'Abstract'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        'px-4 py-1.5 rounded-full text-sm font-semibold transition-all',
                        selectedCategory === cat
                          ? 'bg-teal-500 text-white shadow-sm'
                          : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                      )}
                    >
                      {cat === 'all'
                        ? 'Tous'
                        : cat === 'Beach'
                          ? 'Plage'
                          : cat === 'City'
                            ? 'Ville'
                            : cat === 'Mountain'
                              ? 'Nature'
                              : 'Abstrait'}
                    </button>
                  ))}
                </div>

                {/* Template Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {filteredTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      className={cn(
                        'relative aspect-[3/2] rounded-xl overflow-hidden border-2 transition-all group/tpl hover:shadow-lg',
                        selectedTemplateId === template.id && !uploadedFileName
                          ? 'border-teal-500 ring-2 ring-teal-200 shadow-md'
                          : 'border-transparent hover:border-teal-300'
                      )}
                    >
                      <img
                        src={template.imageUrl}
                        alt={template.name}
                        className="w-full h-full object-cover group-hover/tpl:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/tpl:opacity-100 transition-opacity" />
                      <span className="absolute bottom-2 left-2 text-white text-xs font-bold opacity-0 group-hover/tpl:opacity-100 transition-opacity drop-shadow-lg">
                        {template.name}
                      </span>
                      {selectedTemplateId === template.id && !uploadedFileName && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center shadow-md">
                          <Check size={14} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Recadrer : icône cliquable → zone glisser + molette */}
                {frontImage && (
                  <section className="mt-8 pt-8 border-t border-stone-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCropPanel((v) => !v)
                        if (!showCropPanel) setImgNaturalSize(null)
                      }}
                      className={cn(
                        'flex items-center gap-3 w-full rounded-xl border-2 p-3 text-left transition-all',
                        showCropPanel
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-stone-200 hover:border-teal-200 hover:bg-stone-50'
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                          showCropPanel ? 'bg-teal-500 text-white' : 'bg-teal-100 text-teal-600'
                        )}
                      >
                        <Crop size={20} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider">
                          Recadrer
                        </h3>
                        <p className="text-xs text-stone-500">
                          {showCropPanel
                            ? 'Déplacez l’image à la souris, zoomez avec le curseur'
                            : 'Cliquez pour recadrer et zoomer sur la photo'}
                        </p>
                      </div>
                      <span className="text-stone-400 shrink-0">
                        {showCropPanel ? '▼' : '▶'}
                      </span>
                    </button>

                    {showCropPanel && (
                      <>
                        <div
                          ref={cropAreaRef}
                          className="mt-4 relative w-full overflow-hidden rounded-xl border-2 border-stone-200 bg-stone-100 aspect-[3/2] select-none cursor-grab active:cursor-grabbing"
                          onPointerDown={handleCropPointerDown}
                          onPointerMove={handleCropPointerMove}
                          onPointerUp={handleCropPointerUp}
                          onPointerLeave={handleCropPointerUp}
                          style={{ touchAction: 'none' }}
                        >
                          {imgNaturalSize && cropContainerSize ? (
                            <div
                              className="absolute pointer-events-none"
                              style={(() => {
                                const coverScale = Math.max(
                                  cropContainerSize.w / imgNaturalSize.w,
                                  cropContainerSize.h / imgNaturalSize.h
                                )
                                const displayScale = coverScale * frontImageCrop.scale
                                const w = imgNaturalSize.w * displayScale
                                const h = imgNaturalSize.h * displayScale
                                const left =
                                  cropContainerSize.w / 2 -
                                  (frontImageCrop.x / 100) * imgNaturalSize.w * displayScale
                                const top =
                                  cropContainerSize.h / 2 -
                                  (frontImageCrop.y / 100) * imgNaturalSize.h * displayScale
                                return { width: w, height: h, left, top }
                              })()}
                            >
                              <img
                                ref={cropImgRef}
                                src={frontImage}
                                alt="Recadrage"
                                className="block w-full h-full object-contain"
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                onLoad={handleCropImgLoad}
                                draggable={false}
                              />
                            </div>
                          ) : (
                            <img
                              ref={cropImgRef}
                              src={frontImage}
                              alt="Recadrage"
                              className="absolute inset-0 w-full h-full pointer-events-none object-cover"
                              style={{ objectPosition: `${frontImageCrop.x}% ${frontImageCrop.y}%` }}
                              onLoad={handleCropImgLoad}
                              draggable={false}
                            />
                          )}
                        </div>
                        <div className="mt-4 space-y-3">
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">Zoom</span>
                              <span className="text-xs font-medium text-stone-500 tabular-nums">
                                {Math.round(frontImageCrop.scale * 100)}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min={1}
                              max={4}
                              step={0.05}
                              value={frontImageCrop.scale}
                              onChange={(e) =>
                                setFrontImageCrop((c) => ({ ...c, scale: Number(e.target.value) }))
                              }
                              className="w-full h-2 rounded-full appearance-none bg-stone-200 accent-teal-500 cursor-pointer"
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={() => setShowCropPanel(false)}
                            className="w-full rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 transition-colors"
                          >
                            <Check size={18} className="inline mr-2" />
                            Valider le recadrage
                          </Button>
                        </div>
                      </>

                    )}

                    {showCropPanel && (
                      <p className="mt-2 text-[11px] text-stone-400">
                        L’aperçu à gauche se met à jour en temps réel. Le cadrage sera enregistré sur la carte.
                      </p>
                    )}
                  </section>
                )}

                {/* Face avant : texte + emoji */}
                <section className="mt-8 pt-8 border-t border-stone-200">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
                      <Sparkles size={18} />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider">
                        Face avant
                      </h3>
                      <p className="text-xs text-stone-500">
                        Texte et emoji sur la photo
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-stone-600 uppercase tracking-wider">
                        Texte accroche
                      </label>
                      <Input
                        placeholder="ex: Souvenirs magiques"
                        value={frontCaption}
                        onChange={(e) => setFrontCaption(e.target.value)}
                        maxLength={40}
                        className="h-11 rounded-xl border-stone-200 bg-stone-50/80 text-stone-800 placeholder:text-stone-400 focus:border-teal-400 focus:ring-teal-400"
                      />
                      <p className="mt-1 text-[11px] text-stone-400">
                        Affiché en bas de la photo (max. 40 caractères)
                      </p>
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold text-stone-600 uppercase tracking-wider">
                        Emoji
                      </label>
                      <div className="flex flex-wrap items-center gap-2">
                        {EMOJI_SUGGESTIONS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setFrontEmoji(emoji)}
                            className={cn(
                              'flex h-10 w-10 items-center justify-center rounded-xl border-2 text-xl transition-all',
                              frontEmoji === emoji
                                ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-sm'
                                : 'border-stone-200 bg-white text-stone-500 hover:border-teal-300 hover:bg-teal-50/50'
                            )}
                            title={`Choisir ${emoji}`}
                          >
                            {emoji}
                          </button>
                        ))}
                        <Input
                          placeholder="✨"
                          value={frontEmoji}
                          onChange={(e) => setFrontEmoji(e.target.value)}
                          maxLength={4}
                          className="h-10 w-16 rounded-xl border-stone-200 text-center text-lg tracking-widest"
                        />
                      </div>
                    </div>
                  </div>
                  {(frontCaption.trim() || frontEmoji.trim()) && (
                    <div className="mt-4 flex items-center gap-2 rounded-xl border border-teal-100 bg-teal-50/50 px-4 py-3">
                      <span className="text-lg leading-none">{frontEmoji.trim() || '✨'}</span>
                      <span className="text-sm font-medium text-stone-700 truncate">
                        {frontCaption.trim() || 'Votre accroche'}
                      </span>
                      <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-teal-600">
                        Aperçu
                      </span>
                    </div>
                  )}
                </section>
              </div>
            )}

            {/* ==================== STEP: PAIEMENT ==================== */}
            {currentStep === 'payment' && (
              <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 sm:p-8">
                <h2 className="text-2xl font-serif font-bold text-stone-800 mb-2">
                  Règlement
                </h2>
                <p className="text-stone-500 mb-8">
                  Choisissez votre méthode de paiement sécurisée pour valider votre commande.
                </p>

                {/* Promo de lancement */}
                <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-6 sm:p-8 mb-8 text-white relative overflow-hidden shadow-lg shadow-teal-200">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl">
                        <Sparkles size={24} className="text-white" />
                      </div>
                      <span className="font-bold uppercase tracking-widest text-xs text-teal-100">Offre Exceptionnelle</span>
                    </div>
                    <h3 className="text-2xl font-serif font-bold mb-2">Lancement du produit !</h3>
                    <p className="text-teal-50/90 leading-relaxed mb-6">
                      C&apos;est le lancement officiel ! Profitez-en : <strong className="text-white">toutes les options premium sont gratuites</strong> aujourd&apos;hui.
                    </p>
                    <Button
                      onClick={() => setCurrentStep('preview')}
                      className="bg-white text-teal-600 hover:bg-white/90 font-bold px-8 py-6 h-auto rounded-xl shadow-xl shadow-teal-900/20 w-full sm:w-auto transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                    >
                      Continuer Gratuitement
                      <ChevronRight size={18} />
                    </Button>
                  </div>
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                  <div className="absolute -left-10 -top-10 w-40 h-40 bg-teal-400/20 rounded-full blur-3xl" />
                </div>

                {/* Order Summary */}
                <div className="bg-stone-50 rounded-xl p-4 mb-8 border border-stone-100">
                  <div className="flex justify-between items-center mb-2 text-sm text-stone-600">
                    <span>Carte postale virtuelle</span>
                    <span className="text-teal-600 font-bold uppercase text-[10px]">Gratuit</span>
                  </div>
                  {getAlbumPrice() > 0 && (
                    <div className="flex justify-between items-center mb-2 text-sm text-amber-600 font-medium">
                      <span className="flex items-center gap-1">
                        <Sparkles size={12} />
                        {getAlbumPrice() === 1 ? 'Option Album (10 photos)' : 'Option Album Premium (50 photos + 3 vidéos)'}
                      </span>
                      <span>+{getAlbumPrice().toFixed(2)} €</span>
                    </div>
                  )}
                  <div className="border-t border-stone-200 my-3" />
                  <div className="flex justify-between items-center font-bold text-stone-800 text-lg">
                    <span>Total</span>
                    <div className="flex flex-col items-end">
                      <span className="text-stone-300 line-through text-sm">{getAlbumPrice().toFixed(2)} €</span>
                      <div className="flex items-center gap-2">
                        <span className="text-teal-600">0.00 €</span>
                        <span className="bg-teal-100 text-teal-600 text-[10px] px-2 py-0.5 rounded-full uppercase">Launch Offer</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-stone-800 uppercase tracking-wider mb-2 block">
                    Moyen de paiement
                  </label>

                  {/* Stripe */}
                  <button
                    onClick={() => setPaymentMethod('stripe')}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                      paymentMethod === 'stripe'
                        ? "border-teal-500 bg-teal-50/50 ring-1 ring-teal-500 shadow-sm"
                        : "border-stone-200 hover:border-teal-200 hover:bg-stone-50"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full border flex items-center justify-center transition-colors",
                      paymentMethod === 'stripe' ? "border-teal-500 bg-teal-500" : "border-stone-300"
                    )}>
                      {paymentMethod === 'stripe' && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-800">Carte Bancaire</span>
                        <div className="flex gap-2">
                          <CreditCard size={20} className="text-stone-400" />
                        </div>
                      </div>
                      <p className="text-xs text-stone-500">Via Stripe (Sécurisé)</p>
                    </div>
                  </button>

                  {/* PayPal */}
                  <button
                    onClick={() => setPaymentMethod('paypal')}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                      paymentMethod === 'paypal'
                        ? "border-teal-500 bg-teal-50/50 ring-1 ring-teal-500 shadow-sm"
                        : "border-stone-200 hover:border-teal-200 hover:bg-stone-50"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full border flex items-center justify-center transition-colors",
                      paymentMethod === 'paypal' ? "border-teal-500 bg-teal-500" : "border-stone-300"
                    )}>
                      {paymentMethod === 'paypal' && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                    </div>
                    <div className="flex-1">
                      <span className="font-bold text-stone-800">PayPal</span>
                      <p className="text-xs text-stone-500">Payer avec votre compte PayPal</p>
                    </div>
                  </button>

                  {/* Revolut */}
                  <button
                    onClick={() => setPaymentMethod('revolut')}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                      paymentMethod === 'revolut'
                        ? "border-teal-500 bg-teal-50/50 ring-1 ring-teal-500 shadow-sm"
                        : "border-stone-200 hover:border-teal-200 hover:bg-stone-50"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full border flex items-center justify-center transition-colors",
                      paymentMethod === 'revolut' ? "border-teal-500 bg-teal-500" : "border-stone-300"
                    )}>
                      {paymentMethod === 'revolut' && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                    </div>
                    <div className="flex-1">
                      <span className="font-bold text-stone-800">Revolut Pay</span>
                      <p className="text-xs text-stone-500">Rapide et sans frais</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
            {/* ==================== STEP: RÉDACTION (fusionné) ==================== */}
            {currentStep === 'redaction' && (
              <div className="bg-white rounded-[2rem] shadow-xl shadow-stone-200/40 border border-stone-100 overflow-hidden">
                {/* Header */}
                <div className="p-6 sm:p-8 border-b border-stone-100 bg-gradient-to-r from-stone-50 via-white to-white">
                  <div className="flex items-center gap-3">
                    <span className="bg-orange-100 text-orange-600 p-2.5 rounded-xl">
                      <PenTool size={22} />
                    </span>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-800">
                        Studio de Création
                      </h2>
                      <p className="text-stone-500 text-sm">
                        Personnalisez le verso de votre carte
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-8">
                  {/* Lieu & Destinataire — grid côte à côte */}
                  <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center justify-between text-sm font-bold text-stone-800 mb-3 uppercase tracking-wider">
                        <span className="flex items-center gap-2">
                          <MapPin size={16} className="text-teal-500" /> Lieu du souvenir
                        </span>
                      </label>
                      <div className="relative">
                        <Input
                          placeholder="Ex: Paris, France"
                          value={location}
                          onChange={(e) => {
                            const val = e.target.value
                            setLocation(val)
                            // Search for suggestions
                            if (val.length > 2) {
                              fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(val)}&limit=5&lang=fr`)
                                .then(res => res.json())
                                .then(data => {
                                  setSuggestions(data.features || [])
                                })
                                .catch(err => console.error('Photon error:', err))
                            } else {
                              setSuggestions([])
                            }
                          }}
                          className="pl-10 h-12 bg-stone-50 border-stone-200 focus:border-teal-500 rounded-xl"
                        />
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={18} />

                        {/* Suggestions Dropdown */}
                        {suggestions.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-stone-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            {suggestions.map((s, i) => {
                              const city = s.properties.city || s.properties.name
                              const country = s.properties.country
                              const fullLabel = city && country ? `${city}, ${country}` : city || country || ''
                              return (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => {
                                    setLocation(fullLabel)
                                    setSuggestions([])
                                    if (s.geometry.coordinates) {
                                      setCoords({
                                        lat: s.geometry.coordinates[1],
                                        lng: s.geometry.coordinates[0]
                                      })
                                    }
                                  }}
                                  className="w-full text-left px-4 py-3 hover:bg-stone-50 border-b border-stone-50 last:border-0 transition-colors flex items-center gap-3"
                                >
                                  <MapPin size={14} className="text-teal-500 shrink-0" />
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium text-stone-800">{city}</span>
                                    {country && <span className="text-xs text-stone-500">{country}</span>}
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleGeolocation}
                        className="mt-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg h-9 px-3 gap-2 ml-auto flex"
                      >
                        {isLocating ? (
                          <RefreshCw size={14} className="animate-spin" />
                        ) : (
                          <Navigation size={14} />
                        )}
                        <span>Ma position actuelle</span>
                      </Button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-stone-800 mb-3 uppercase tracking-wider">
                          <Users size={16} className="text-teal-500" /> Destinataire
                        </label>
                        <input
                          type="text"
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          placeholder="ex: Papa & Maman"
                          className="w-full rounded-xl border border-stone-200 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-base py-3 px-4 bg-stone-50 focus:bg-white transition-colors placeholder:text-stone-400"
                        />
                      </div>
                    </div>
                  </section>

                  <div className="h-px bg-stone-100" />

                  {/* Message — section style indigo comme l'original */}
                  <section className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100/50">
                    <div className="flex justify-between items-end mb-4">
                      <label className="flex items-center gap-2 text-sm font-bold text-indigo-900 uppercase tracking-wider">
                        <Type size={16} className="text-indigo-500" /> Votre Message
                      </label>
                      <span className="text-xs text-indigo-400 font-medium">
                        {message.length}/500
                      </span>
                    </div>
                    <textarea
                      ref={messageInputRef}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Cher(e)... Nous voici au bout du monde, le soleil se couche sur la mer et je pense à vous..."
                      rows={8}
                      maxLength={500}
                      className="w-full min-h-[220px] rounded-2xl border border-stone-200 shadow-inner focus:border-indigo-500 focus:ring-indigo-500 text-lg p-5 font-sans bg-white leading-relaxed text-stone-700 resize-none placeholder:text-stone-300"
                    />
                    {/* Emojis rapides pour le message */}
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">
                        Choisir un emoji
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {MESSAGE_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => {
                              const el = messageInputRef.current
                              const pos = el ? el.selectionStart : message.length
                              const before = message.slice(0, pos)
                              const after = message.slice(pos)
                              const next = before + emoji + after
                              if (next.length <= 500) {
                                setMessage(next)
                                requestAnimationFrame(() => {
                                  if (el) {
                                    el.focus()
                                    const newPos = pos + emoji.length
                                    el.setSelectionRange(newPos, newPos)
                                  }
                                })
                              }
                            }}
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50 text-xl transition-colors"
                            title={`Insérer ${emoji}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Quick suggestions */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {[
                        'Le temps est magnifique, on pense bien à vous !',
                        'Un petit coucou depuis le bout du monde...',
                        'Si vous étiez là, ce serait parfait !',
                        'Les paysages sont à couper le souffle.',
                      ].map((s) => (
                        <button
                          key={s}
                          onClick={() => setMessage(s)}
                          className="px-3 py-1.5 bg-white hover:bg-indigo-50 text-stone-500 hover:text-indigo-700 rounded-full text-xs transition-colors border border-indigo-100 hover:border-indigo-200"
                        >
                          <Sparkles size={10} className="inline mr-1 text-indigo-400" />
                          {s}
                        </button>
                      ))}
                    </div>
                  </section>

                  <div className="h-px bg-stone-100" />

                  {/* Signature & Timbre — grid côte à côte */}
                  <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-stone-800 mb-3 uppercase tracking-wider">
                        <Stamp size={16} className="text-teal-500" /> Signature
                      </label>
                      <input
                        type="text"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="ex: Sarah"
                        className="w-full rounded-xl border border-stone-200 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-base py-3 px-4 font-sans bg-stone-50 focus:bg-white transition-colors placeholder:text-stone-400"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-stone-800 mb-3 uppercase tracking-wider">
                        <Stamp size={16} className="text-teal-500" /> Style du Timbre
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(
                          [
                            { value: 'classic', label: 'Classique' },
                            { value: 'modern', label: 'Moderne' },
                            { value: 'airmail', label: 'Par Avion' },
                          ] as const
                        ).map((style) => (
                          <button
                            key={style.value}
                            onClick={() => setStampStyle(style.value)}
                            className={cn(
                              'py-3 px-2 rounded-xl text-xs font-bold capitalize transition-all border-2',
                              stampStyle === style.value
                                ? 'border-teal-500 bg-teal-50 text-teal-800 shadow-sm'
                                : 'border-stone-100 bg-stone-50 text-stone-400 hover:border-stone-300 hover:bg-white'
                            )}
                          >
                            {style.label}
                          </button>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div>
                          <label className="block text-xs font-medium text-stone-500 mb-1">Texte du timbre</label>
                          <input
                            type="text"
                            value={stampLabel}
                            onChange={(e) => setStampLabel(e.target.value)}
                            placeholder="ex: Digital Poste"
                            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-teal-500 focus:ring-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-stone-500 mb-1">Année</label>
                          <input
                            type="text"
                            value={stampYear}
                            onChange={(e) => setStampYear(e.target.value)}
                            placeholder="ex: 2024"
                            maxLength={4}
                            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-teal-500 focus:ring-teal-500"
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  <div className="h-px bg-stone-100" />

                  {/* Album / Gallery Section */}
                  <section>
                    <div className="flex justify-between items-end mb-4">
                      <label className="flex items-center gap-2 text-sm font-bold text-stone-800 uppercase tracking-wider">
                        <div className="relative">
                          <ImageIcon size={16} className="text-teal-500" />
                          <div className="absolute -right-1 -bottom-1 bg-teal-500 rounded-full p-[1px] border border-white">
                            <span className="block w-1.5 h-1.5 bg-white rounded-full"></span>
                          </div>
                        </div>
                        Album Souvenir (Photos/Vidéos)
                      </label>
                      <div className="flex items-center gap-2 text-xs font-medium">
                        {isPremium ? (
                          <div className="flex flex-col items-end gap-1">
                            <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                              <Sparkles size={12} fill="currentColor" /> Album {getAlbumPrice() === 1 ? '10 photos' : 'Premium'} activé
                            </span>
                            <span className="text-[10px] text-stone-400">
                              {mediaItems?.filter(i => i.type === 'image').length}/{getAlbumPrice() === 1 ? 10 : 50} photos
                              {getAlbumPrice() === 2 && ` - ${mediaItems?.filter(i => i.type === 'video').length}/3 vidéos`}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end">
                            <span className="text-stone-400">Option payante (dès +1€)</span>
                            <span className="text-[9px] text-stone-300 uppercase tracking-tighter font-bold">10 photos: 1€ | 50 photos + 3 vid: 2€</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                      {mediaItems?.map((item) => (
                        <div
                          key={item.id}
                          className="relative aspect-square rounded-xl overflow-hidden shadow-sm group border border-stone-200"
                        >
                          {item.type === 'video' ? (
                            <video src={item.url} className="w-full h-full object-cover" />
                          ) : (
                            <img
                              src={item.url}
                              alt="album item"
                              className="w-full h-full object-cover"
                            />
                          )}
                          <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm p-1 rounded-md text-white">
                            {item.type === 'video' ? <Camera size={12} /> : <ImageIcon size={12} />}
                          </div>
                          <button
                            onClick={() => removeMediaItem(item.id)}
                            className="absolute top-2 right-2 bg-white text-red-500 p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}

                      <div className="relative aspect-square">
                        <input
                          type="file"
                          id="album-upload"
                          className="hidden"
                          multiple
                          accept="image/*,.heic,.heif,.avif,.webp,.tiff,.bmp,video/*"
                          onChange={handleAlbumUpload}
                        />
                        <label
                          htmlFor="album-upload"
                          className="w-full h-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 hover:bg-stone-100 hover:border-stone-400 transition-colors cursor-pointer text-stone-400 hover:text-stone-600"
                        >
                          <Camera size={24} className="mb-2" />
                          <span className="text-xs font-bold">Ajouter</span>
                        </label>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            )}

            {/* ==================== STEP: APERÇU ==================== */}
            {currentStep === 'preview' && (
              <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 sm:p-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-serif font-bold text-stone-800">
                    Votre carte est prête !
                  </h2>
                </div>
                <p className="text-stone-500 mb-8 text-sm">
                  Partagez-la maintenant avec vos proches. Cliquez sur la carte pour la retourner.
                </p>

                {/* Bloc de partage */}
                <div className="border-t border-stone-200 pt-8">
                  <div className="max-w-2xl mx-auto">
                    <p className="text-stone-600 text-sm mb-6 leading-relaxed">
                      Une fois la carte créée, un lien à partager vous sera fourni. Vous pourrez l’envoyer à qui vous voulez.
                    </p>

                    {isPublishing ? (
                      <div className="bg-stone-50 rounded-2xl p-10 border border-stone-100 flex flex-col items-center justify-center text-center">
                        <RefreshCw size={32} className="text-teal-500 animate-spin mb-4" />
                        <p className="text-stone-500 font-medium font-serif">{createdPostcardId ? 'Mise à jour de votre carte...' : 'Création de votre lien de partage...'}</p>
                      </div>
                    ) : shareError ? (
                      <div className="bg-red-50 rounded-2xl p-8 border border-red-100 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <X size={32} className="text-red-600" />
                        </div>
                        <h3 className="text-lg font-serif font-bold text-stone-800 mb-2">Impossible de créer le lien</h3>
                        <p className="text-stone-600 text-sm mb-6 max-w-md">{shareError}</p>
                        <div className="flex flex-wrap justify-center gap-3">
                          <Button
                            onClick={() => { setShareError(null); handlePublish(); }}
                            className="rounded-xl bg-teal-500 hover:bg-teal-600 text-white"
                          >
                            <RefreshCw size={16} className="mr-2" /> Réessayer
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => { setShareError(null); setCurrentStep('photo'); }}
                            className="rounded-xl border-stone-200"
                          >
                            Changer la photo
                          </Button>
                        </div>
                      </div>
                    ) : !shareUrl ? (
                      <div className="bg-stone-50 rounded-2xl p-10 border border-stone-100 flex flex-col items-center justify-center text-center">
                        <RefreshCw size={32} className="text-teal-500 animate-spin mb-4" />
                        <p className="text-stone-500 font-medium font-serif">{createdPostcardId ? 'Mise à jour de votre carte...' : 'Création de votre lien de partage...'}</p>
                      </div>
                    ) : (
                      <div className="bg-stone-50 rounded-2xl p-6 sm:p-8 border border-stone-200 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                          <Send size={32} className="text-teal-600" />
                        </div>
                        <h3 className="text-xl font-serif font-bold text-stone-800 mb-2">Prête à être partagée !</h3>
                        <p className="text-stone-500 text-sm mb-6">Utilisez le lien ci-dessous ou les réseaux sociaux</p>

                        <div className="mb-8 max-w-lg mx-auto">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              readOnly
                              value={shareUrl}
                              className="flex-1 bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-600 focus:outline-none shadow-sm"
                            />
                            <Button onClick={copyToClipboard} variant="outline" className="rounded-xl bg-white hover:bg-teal-50 hover:text-teal-800 hover:border-teal-300 text-stone-600 border-stone-200 px-6 h-auto shadow-sm transition-all">
                              <Copy size={16} className="mr-2" /> Copier
                            </Button>
                          </div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-3">
                          {/* E-mails share */}
                          <a
                            href={`mailto:?subject=Regarde ma carte postale !&body=J'ai créé une carte postale pour toi : ${shareUrl}`}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-stone-200 text-stone-700 rounded-full font-bold text-xs hover:bg-stone-50 transition-all shadow-sm"
                          >
                            <Mail size={16} className="text-stone-400" /> E-mails
                          </a>

                          {/* SMS share */}
                          <a
                            href={`sms:?body=${encodeURIComponent(`Regarde ma carte postale ! ${shareUrl}`)}`}
                            className="flex items-center gap-2 px-5 py-2.5 bg-stone-800 text-white rounded-full font-bold text-xs hover:bg-stone-900 transition-all shadow-md"
                          >
                            <MessageSquare size={16} /> Numéros (SMS)
                          </a>

                          {/* WhatsApp share */}
                          <a
                            href={`https://wa.me/?text=${encodeURIComponent(`Regarde ma carte postale ! ${shareUrl}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#25D366] text-white rounded-full font-bold text-xs hover:opacity-90 transition-all shadow-md"
                          >
                            <Share2 size={16} /> WhatsApp
                          </a>

                          {/* Facebook share */}
                          <a
                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#1877F2] text-white rounded-full font-bold text-xs hover:opacity-90 transition-all shadow-md"
                          >
                            <Facebook size={16} /> Facebook
                          </a>

                          <Button
                            type="button"
                            onClick={() => {
                              if (!shareUrl) return
                              setShowRecipientModal(true)
                            }}
                            variant="outline"
                            className="flex items-center gap-2 px-5 py-2.5 border border-stone-200 rounded-full text-stone-700 text-xs font-bold uppercase tracking-wider hover:border-stone-300 hover:bg-stone-50 transition-all shadow-sm"
                            disabled={!shareUrl}
                          >
                            <Plane size={16} />
                            Voir comme destinataire
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Sender Email Section */}
                    <div className="mt-12 pt-8 border-t border-stone-100">
                      <div className="bg-teal-50/50 rounded-2xl p-6 border border-teal-100">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="bg-teal-500 text-white p-2.5 rounded-xl shrink-0">
                            <User size={20} />
                          </div>
                          <div>
                            <h3 className="font-serif font-bold text-lg text-stone-800">Votre E-mail (Expéditeur)</h3>
                            <p className="text-stone-500 text-sm mt-1 leading-relaxed">
                              Saisissez votre e-mail pour revoir votre carte, consulter les statistiques et suivre son envoi.
                            </p>
                          </div>
                        </div>
                        <div className="max-w-md flex gap-2">
                          {isEmailSent ? (
                            <div className="w-full flex items-center gap-3 bg-teal-50 border border-teal-200 text-teal-800 px-4 py-3 rounded-xl animate-in fade-in slide-in-from-top-2">
                              <div className="bg-teal-100 p-1 rounded-full">
                                <Check size={16} className="text-teal-600" />
                              </div>
                              <div className="flex-1">
                                <p className="font-bold text-sm">E-mail envoyé !</p>
                                <p className="text-xs text-teal-600">Vérifiez votre boîte de réception (et vos spams).</p>
                              </div>
                            </div>
                          ) : (
                            <>
                              <input
                                type="email"
                                value={senderEmail}
                                onChange={(e) => setSenderEmail(e.target.value)}
                                placeholder="votre@email.com"
                                disabled={isSendingEmail}
                                className="flex-1 rounded-xl border border-stone-200 px-4 py-3 text-base focus:border-teal-500 focus:ring-teal-500 bg-white shadow-sm transition-all disabled:opacity-50 disabled:bg-stone-50"
                              />
                              <Button
                                variant="secondary"
                                className="rounded-xl h-auto px-6 bg-teal-500 hover:bg-teal-600 text-white border-0 font-bold transition-all shadow-md shadow-teal-100 disabled:opacity-70"
                                disabled={isSendingEmail}
                                onClick={async () => {
                                  if (!createdPostcardId) return
                                  if (!senderEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail)) {
                                    alert("Veuillez entrer une adresse email valide.")
                                    return
                                  }

                                  setIsSendingEmail(true);
                                  try {
                                    const result = await linkPostcardToUser(createdPostcardId, senderEmail)
                                    if (result.success) {
                                      setIsEmailSent(true);
                                      // alert("Compte créé/lié ! Un email avec votre lien de connexion magique vous a été envoyé.")
                                    } else {
                                      alert("Erreur: " + (result.error || "Impossible de lier le compte."))
                                    }
                                  } catch (e) {
                                    console.error(e);
                                    alert("Une erreur est survenue.");
                                  } finally {
                                    setIsSendingEmail(false);
                                  }
                                }}
                              >
                                {isSendingEmail ? <RefreshCw size={18} className="animate-spin" /> : 'Valider'}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!shareUrl && (
              <div className="mt-8">
                {/* Mobile Card Preview — always visible below editor on small screens */}
                <div className="lg:hidden">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye size={14} className="text-teal-500" />
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                      Aperçu de votre carte
                    </span>
                    <div className="flex items-center gap-1.5 ml-auto text-stone-400 text-[10px] font-medium">
                      {(isPublishing || shareUrl) ? (
                        <div className="flex items-center gap-1 text-teal-600">
                          {isPublishing ? (
                            <RefreshCw size={10} className="animate-spin" />
                          ) : (
                            <Check size={10} />
                          )}
                          <span>{isPublishing ? 'Création...' : 'Prête !'}</span>
                        </div>
                      ) : (
                        <>
                          <RefreshCw size={10} className="animate-spin" style={{ animationDuration: '3s' }} />
                          Temps réel
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className="transform scale-[0.85] origin-top">
                      <PostcardView postcard={currentPostcard} flipped={showBack} />
                    </div>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-6">
                  <Button
                    variant="ghost"
                    onClick={goPrev}
                    disabled={currentStepIndex === 0}
                    className={cn(
                      'rounded-full font-semibold flex items-center gap-2 transition-all',
                      currentStepIndex === 0
                        ? 'opacity-0 pointer-events-none'
                        : 'text-stone-600 hover:text-stone-800 hover:bg-stone-100'
                    )}
                  >
                    <ChevronLeft size={18} />
                    Retour
                  </Button>

                  {currentStep !== 'preview' && (
                    <Button
                      onClick={goNext}
                      disabled={!canGoNext()}
                      className={cn(
                        'rounded-full font-bold flex items-center gap-2 px-6 py-5 h-auto transition-all',
                        canGoNext()
                          ? 'bg-teal-500 hover:bg-teal-600 text-white shadow-md shadow-teal-200 hover:-translate-y-0.5'
                          : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      )}
                    >
                      {currentStep === 'payment'
                        ? `Payer ${getAlbumPrice().toFixed(2)} €`
                        : 'Continuer'}
                      <ChevronRight size={18} />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal plein écran : voir comme le destinataire */}
      {
        showFullscreen && (
          <div
            className="fixed inset-0 z-50 bg-stone-900/95 flex items-center justify-center p-2 sm:p-4 overflow-auto"
            onClick={() => setShowFullscreen(false)}
          >
            <div onClick={(e) => e.stopPropagation()} className="relative flex items-center justify-center w-full h-full p-4 sm:p-12">
              <button
                onClick={() => setShowFullscreen(false)}
                className="absolute top-2 right-2 sm:top-6 sm:right-6 p-4 text-white hover:text-red-400 transition-all z-50 bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full active:scale-95"
                aria-label="Fermer"
              >
                <X size={48} strokeWidth={3} />
              </button>
              <PostcardView
                postcard={currentPostcard}
                flipped={showBack}
                className="w-full max-w-[1700px] h-auto aspect-[3/2] shadow-2xl hover:scale-100 cursor-default"
              />
            </div>
          </div>
        )
      }

      {/* Modal destinataire : iframe de la page réelle */}
      {
        showRecipientModal && shareUrl && (
          <div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 sm:p-8 overflow-auto"
            onClick={() => setShowRecipientModal(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[1400px] h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200"
            >
              <button
                onClick={() => setShowRecipientModal(false)}
                className="absolute top-3 right-3 z-50 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all"
                aria-label="Fermer la vue destinataire"
              >
                <X size={20} />
              </button>
              <div className="absolute inset-x-0 top-4 flex justify-center z-40">
                <span className="bg-white/80 text-stone-600 text-xs font-semibold uppercase tracking-[0.2em] px-4 py-1 rounded-full shadow-sm">
                  Vue destinataire
                </span>
              </div>
              <iframe
                src={shareUrl}
                title="Page destinataire"
                className="w-full h-full border-0"
                loading="lazy"
                allowFullScreen
              />
            </div>
          </div>
        )
      }
      {/* Copy notification toast */}
      {
        showCopyToast && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-5 duration-300">
            <div className="bg-stone-900 border border-white/10 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md">
              <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                <Check size={14} className="text-white" />
              </div>
              <span className="font-bold text-sm tracking-wide">Lien copié !</span>
            </div>
          </div>
        )
      }
    </div >
  )
}
