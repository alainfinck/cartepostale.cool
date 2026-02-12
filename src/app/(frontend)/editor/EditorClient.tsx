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
} from 'lucide-react'
import { Postcard, Template } from '@/types'
import PostcardView from '@/components/postcard/PostcardView'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { createPostcard } from '@/actions/postcard-actions'
import { linkPostcardToUser } from '@/actions/auth-actions'

const HEIC_TYPES = ['image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence']
const MAX_IMAGE_PX = 2048 // 2K max côté le plus long

/** Redimensionne une image (data URL) pour que le plus grand côté soit au max MAX_IMAGE_PX, en JPEG. */
function resizeImageToMax2K(dataUrl: string, maxPx: number = MAX_IMAGE_PX): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      let w = img.naturalWidth
      let h = img.naturalHeight
      if (w <= maxPx && h <= maxPx) {
        resolve(dataUrl)
        return
      }
      if (w > h) {
        h = Math.round((h * maxPx) / w)
        w = maxPx
      } else {
        w = Math.round((w * maxPx) / h)
        h = maxPx
      }
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(dataUrl)
        return
      }
      ctx.drawImage(img, 0, 0, w, h)
      try {
        const resized = canvas.toDataURL('image/jpeg', 0.9)
        resolve(resized)
      } catch {
        resolve(dataUrl)
      }
    }
    img.onerror = () => reject(new Error('Image load failed'))
    img.src = dataUrl
  })
}

async function fileToDataUrl(file: File): Promise<string> {
  const isHeic = HEIC_TYPES.includes(file.type) || /\.heic$/i.test(file.name) || /\.heif$/i.test(file.name)
  let blob: Blob = file
  if (isHeic) {
    const heic2any = (await import('heic2any')).default
    const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 })
    blob = Array.isArray(converted) ? converted[0] : converted
  }
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
  return resizeImageToMax2K(dataUrl)
}

const STEPS = [
  { id: 'photo', label: 'Photo', icon: Camera },
  { id: 'redaction', label: 'Rédaction', icon: PenTool },
  { id: 'preview', label: 'Aperçu', icon: Eye },
] as const

type StepId = (typeof STEPS)[number]['id']

const SAMPLE_TEMPLATES: Template[] = [
  {
    id: 'tpl-1',
    name: 'Plage tropicale',
    imageUrl:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    category: 'Beach',
  },
  {
    id: 'tpl-2',
    name: 'Coucher de soleil',
    imageUrl:
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80',
    category: 'Beach',
  },
  {
    id: 'tpl-3',
    name: 'Paris romantique',
    imageUrl:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    category: 'City',
  },
  {
    id: 'tpl-4',
    name: 'Tokyo néons',
    imageUrl:
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
    category: 'City',
  },
  {
    id: 'tpl-5',
    name: 'Alpes suisses',
    imageUrl:
      'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=800&q=80',
    category: 'Mountain',
  },
  {
    id: 'tpl-6',
    name: 'Côte Amalfitaine',
    imageUrl:
      'https://images.unsplash.com/photo-1534113414509-0eec2bfb493f?auto=format&fit=crop&w=800&q=80',
    category: 'City',
  },
  {
    id: 'tpl-7',
    name: 'Forêt enchantée',
    imageUrl:
      'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
    category: 'Mountain',
  },
  {
    id: 'tpl-8',
    name: 'Désert doré',
    imageUrl:
      'https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=800&q=80',
    category: 'Abstract',
  },
]

const EMOJI_SUGGESTIONS = ['✨', '📍', '🌅', '🌴', '💌', '🌊', '🗺️'] as const

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
  const [mediaItems, setMediaItems] = useState<Postcard['mediaItems']>([])
  const [isPremium, setIsPremium] = useState(false)
  const [showFullscreen, setShowFullscreen] = useState(false)
  const [showRecipientModal, setShowRecipientModal] = useState(false)

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
    if (currentStep === 'preview' && !shareUrl && !isPublishing && !shareError) {
      handlePublish()
    }
  }, [currentStep, shareUrl, isPublishing, shareError])

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

  const canGoNext = () => {
    switch (currentStep) {
      case 'photo':
        return frontImage !== ''
      case 'redaction':
        // Un seul critère : au moins un message. Destinataire / expéditeur / lieu optionnels (valeurs par défaut à l’envoi).
        return message.trim().length > 0
      case 'preview':
        return true
      default:
        return false
    }
  }

  const goNext = () => {
    if (currentStepIndex < STEPS.length - 1 && canGoNext()) {
      setCurrentStep(STEPS[currentStepIndex + 1].id)
    }
  }

  const goPrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(STEPS[currentStepIndex - 1].id)
    }
  }

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadedFileName(file.name)
    fileToDataUrl(file).then(setFrontImage).catch(() => {
      setUploadedFileName('')
      setFrontImage('')
      alert('Impossible de charger cette image. Utilisez une photo en JPEG ou PNG.')
    })
  }, [])

  const handleSelectTemplate = (template: Template) => {
    setFrontImage(template.imageUrl)
    setUploadedFileName('')
  }

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
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    files.forEach(async (file) => {
      try {
        const url = file.type.startsWith('video/')
          ? await new Promise<string>((resolve, reject) => {
              const reader = new FileReader()
              reader.onloadend = () => resolve(reader.result as string)
              reader.onerror = reject
              reader.readAsDataURL(file)
            })
          : await fileToDataUrl(file)
        const newItem = {
          id: Date.now() + Math.random().toString() + Math.random(),
          type: file.type.startsWith('video') ? 'video' : 'image',
          url,
        } as any
        setMediaItems((prev) => {
          const updated = [...(prev || []), newItem]
          setIsPremium(updated.length > 0)
          return updated
        })
      } catch {
        alert('Impossible de charger une des images. Utilisez des photos en JPEG ou PNG.')
      }
    })
  }

  const removeMediaItem = (id: string) => {
    setMediaItems((prev) => {
      const updated = prev?.filter((item) => item.id !== id) || []
      setIsPremium(updated.length > 0)
      return updated
    })
  }

  const currentPostcard: Postcard = {
    id: 'editor-preview',
    frontImage:
      frontImage ||
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
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
      const result = await createPostcard({
        ...currentPostcard,
        recipients: [],
        // If uploaded file, we might need to handle upload separately in a real app
        // For now we assume frontImage is base64 or URL
      })

      if (result.success && result.publicId) {
        setCreatedPostcardId(result.publicId)
        setShareUrl(`${window.location.origin}/view/${result.publicId}`)
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
                  {index < STEPS.length - 1 && (
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
              <div className="mt-4 flex flex-col items-center gap-4">
                <p className="text-stone-400 text-[10px] uppercase tracking-widest font-bold">L&apos;aperçu se met à jour en temps réel</p>
                
                <div className="flex flex-col w-full gap-3">
                  <Button
                    onClick={() => setShowFullscreen(true)}
                    variant="outline"
                    className="w-full text-stone-600 border-stone-200 hover:bg-stone-50 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 h-10 transition-all group"
                  >
                    <Maximize2 size={14} className="group-hover:scale-110 transition-transform" />
                    Aperçu en plein écran
                  </Button>

                  {/* Step 2 specific continue button */}
                  {currentStep === 'redaction' && (
                    <Button
                      onClick={goNext}
                      disabled={!canGoNext()}
                      className={cn(
                        'w-full rounded-xl font-bold flex items-center justify-center gap-2 py-6 h-auto transition-all shadow-lg shadow-teal-100',
                        canGoNext()
                          ? 'bg-teal-500 hover:bg-teal-600 text-white'
                          : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      )}
                    >
                      Continuer
                      <ChevronRight size={18} />
                    </Button>
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
                    'relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all hover:border-teal-400 hover:bg-teal-50/50 mb-8 group',
                    frontImage && !uploadedFileName
                      ? 'border-stone-200 bg-stone-50'
                      : uploadedFileName
                        ? 'border-teal-400 bg-teal-50/30'
                        : 'border-stone-300'
                  )}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  {uploadedFileName ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center">
                        <Check size={28} className="text-teal-600" />
                      </div>
                      <p className="text-teal-700 font-semibold">{uploadedFileName}</p>
                      <p className="text-stone-400 text-sm">Cliquez pour changer</p>
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
                        frontImage === template.imageUrl && !uploadedFileName
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
                      {frontImage === template.imageUrl && !uploadedFileName && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center shadow-md">
                          <Check size={14} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

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
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Cher(e)... Nous voici au bout du monde, le soleil se couche sur la mer et je pense à vous..."
                      rows={5}
                      maxLength={500}
                      className="w-full rounded-2xl border border-stone-200 shadow-inner focus:border-indigo-500 focus:ring-indigo-500 text-sm p-5 font-handwriting text-lg bg-white leading-relaxed text-stone-700 resize-none placeholder:text-stone-300"
                    />
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
                        className="w-full rounded-xl border border-stone-200 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-xl py-3 px-4 font-handwriting bg-stone-50 focus:bg-white transition-colors placeholder:text-stone-400"
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
                          <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                            <Sparkles size={12} fill="currentColor" /> Premium activé
                          </span>
                        ) : (
                          <span className="text-stone-400">Option payante (+1€)</span>
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
                          accept="image/*,video/*"
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
                        <p className="text-stone-500 font-medium font-serif">Création de votre lien de partage...</p>
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
                        <p className="text-stone-500 font-medium font-serif">Création de votre lien de partage...</p>
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
                      Continuer
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
      {showFullscreen && (
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
      )}

      {/* Modal destinataire : iframe de la page réelle */}
      {showRecipientModal && shareUrl && (
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
      )}
      {/* Copy notification toast */}
      {showCopyToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-stone-900 border border-white/10 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md">
            <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
              <Check size={14} className="text-white" />
            </div>
            <span className="font-bold text-sm tracking-wide">Lien copié !</span>
          </div>
        </div>
      )}
    </div>
  )
}
