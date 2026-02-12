'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
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
  Twitter,
  Share2,
  Maximize2,
} from 'lucide-react'
import { Postcard, Template } from '@/types'
import PostcardView from '@/components/postcard/PostcardView'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { createPostcard } from '@/actions/postcard-actions'

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

export default function EditorPage() {
  const [currentStep, setCurrentStep] = useState<StepId>('photo')
  const [selectedCategory, setSelectedCategory] = useState<Template['category'] | 'all'>('all')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLocating, setIsLocating] = useState(false)

  // Postcard state
  const [frontImage, setFrontImage] = useState('')
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
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [mediaItems, setMediaItems] = useState<Postcard['mediaItems']>([])
  const [isPremium, setIsPremium] = useState(false)
  const [showFullscreen, setShowFullscreen] = useState(false)

  // Sharing state
  const [recipientEmails, setRecipientEmails] = useState<string[]>([])
  const [recipientPhones, setRecipientPhones] = useState<string[]>([])
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [isPublishing, setIsPublishing] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [shareError, setShareError] = useState<string | null>(null)

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep)
  const showBack = currentStep === 'redaction'

  // Auto-publish when reaching preview step
  useEffect(() => {
    if (currentStep === 'preview' && !shareUrl && !isPublishing && !shareError) {
      handlePublish()
    }
  }, [currentStep, shareUrl, isPublishing, shareError])

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
    if (file) {
      setUploadedFileName(file.name)
      const reader = new FileReader()
      reader.onloadend = () => {
        setFrontImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
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
    if (e.target.files) {
      const files = Array.from(e.target.files)
      
      files.forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const newItem = {
            id: Date.now() + Math.random().toString(),
            type: file.type.startsWith('video') ? 'video' : 'image',
            url: reader.result as string,
          } as any

          setMediaItems((prev) => {
            const updated = [...(prev || []), newItem]
            setIsPremium(updated.length > 0)
            return updated
          })
        }
        reader.readAsDataURL(file)
      })
    }
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
    message: message || '',
    recipientName: recipientName || '',
    senderName: senderName || '',
    senderEmail: senderEmail || undefined,

    location: location || '',
    stampStyle,
    stampLabel: stampLabel.trim() || undefined,
    stampYear: stampYear.trim() || undefined,
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

  const handleAddEmail = () => {
    if (newEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setRecipientEmails([...recipientEmails, newEmail])
      setNewEmail('')
    }
  }

  const handleAddPhone = () => {
    if (newPhone) {
      setRecipientPhones([...recipientPhones, newPhone])
      setNewPhone('')
    }
  }

  const removeEmail = (email: string) => setRecipientEmails(recipientEmails.filter(e => e !== email))
  const removePhone = (phone: string) => setRecipientPhones(recipientPhones.filter(p => p !== phone))

  const handlePublish = async () => {
    setIsPublishing(true)
    setShareError(null)

    // Prepare recipients data
    const recipients = [
      ...recipientEmails.map(email => ({ email })),
      ...recipientPhones.map(phone => ({ phone }))
    ]

    const result = await createPostcard({
      ...currentPostcard,
      recipients,
      // If uploaded file, we might need to handle upload separately in a real app
      // For now we assume frontImage is base64 or URL
    })

    if (result.success && result.publicId) {
      setShareUrl(`${window.location.origin}/view/${result.publicId}`)
      // No longer switching step, sharing UI appears in 'preview' step
    } else {
      setShareError(result.error || 'Une erreur est survenue lors de la création de la carte.')
    }
    setIsPublishing(false)
  }

  const copyToClipboard = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl)
      // Could add toast here
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

                  {/* Step 3 sharing options in left panel */}
                  {currentStep === 'preview' && shareUrl && (
                    <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3 text-center">Partager votre création</p>
                      
                      <div className="flex gap-2 mb-4">
                        <input
                          type="text"
                          readOnly
                          value={shareUrl}
                          className="flex-1 bg-stone-50 border border-stone-100 rounded-lg px-3 text-xs text-stone-600 focus:outline-none py-2"
                        />
                        <Button onClick={copyToClipboard} variant="ghost" size="sm" className="text-teal-600 hover:bg-teal-50 h-8">
                          <Copy size={12} className="mr-1" /> Copier
                        </Button>
                      </div>

                      <div className="flex justify-center gap-3">
                        <a href={`https://wa.me/?text=${encodeURIComponent(`Regarde ma carte postale ! ${shareUrl}`)}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#25D366] text-white rounded-full hover:opacity-90 transition-opacity shadow-sm">
                          <Share2 size={16} />
                        </a>
                        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#1877F2] text-white rounded-full hover:opacity-90 transition-opacity shadow-sm">
                          <Facebook size={16} />
                        </a>
                        <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Regarde ma carte postale !`)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#1DA1F2] text-white rounded-full hover:opacity-90 transition-opacity shadow-sm">
                          <Twitter size={16} />
                        </a>
                      </div>
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
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-serif font-bold text-stone-800">
                    Votre carte est prête !
                  </h2>
                  <Button
                    onClick={() => setShowFullscreen(true)}
                    variant="ghost"
                    size="sm"
                    className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Maximize2 size={14} /> Aperçu plein écran
                  </Button>
                </div>
                <p className="text-stone-500 mb-6 text-sm">
                  Vérifiez le rendu final. Cliquez sur la carte pour la retourner.
                </p>

                {/* Summary */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3 p-4 bg-stone-50 rounded-xl">
                    <ImageIcon size={18} className="text-teal-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                        Photo
                      </p>
                      <p className="text-stone-700 text-sm mt-0.5">
                        {uploadedFileName || 'Modèle sélectionné'}
                      </p>
                    </div>
                    {!shareUrl && (
                      <button
                        onClick={() => setCurrentStep('photo')}
                        className="ml-auto text-teal-500 hover:text-teal-700 text-xs font-bold"
                      >
                        Modifier
                      </button>
                    )}
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-stone-50 rounded-xl">
                    <Type size={18} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                        Message
                      </p>
                      <p className="text-stone-700 text-sm mt-0.5 line-clamp-2">{message}</p>
                    </div>
                    {!shareUrl && (
                      <button
                        onClick={() => setCurrentStep('redaction')}
                        className="ml-auto text-teal-500 hover:text-teal-700 text-xs font-bold flex-shrink-0"
                      >
                        Modifier
                      </button>
                    )}
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-stone-50 rounded-xl">
                    <MapPin size={18} className="text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                        Détails
                      </p>
                      <p className="text-stone-700 text-sm mt-0.5">
                        De <span className="font-semibold">{senderName}</span> pour{' '}
                        <span className="font-semibold">{recipientName}</span> depuis{' '}
                        <span className="font-semibold">{location}</span>
                      </p>
                    </div>
                    {!shareUrl && (
                      <button
                        onClick={() => setCurrentStep('redaction')}
                        className="ml-auto text-teal-500 hover:text-teal-700 text-xs font-bold"
                      >
                        Modifier
                      </button>
                    )}
                  </div>
                </div>

                {!shareUrl && (
                  <div className="border-t border-stone-200 pt-6">
                    <h3 className="font-serif font-bold text-lg text-stone-800 mb-1">Ajouter des destinataires <span className="text-stone-500 font-normal text-sm">(optionnel)</span></h3>
                    <p className="text-stone-500 text-sm mb-4">
                      Une fois la carte créée, un lien à partager vous sera fourni. Vous pourrez l’envoyer à qui vous voulez.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Emails */}
                      <div>
                        <label className="block text-sm font-bold text-stone-700 mb-2">E-mails</label>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="exemple@email.com"
                            className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-teal-500 focus:ring-teal-500"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddEmail()}
                          />
                          <button onClick={handleAddEmail} className="bg-stone-100 hover:bg-teal-100 text-stone-600 hover:text-teal-700 p-2 rounded-lg transition-colors"><Check size={18} /></button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {recipientEmails.map(email => (
                            <span key={email} className="inline-flex items-center gap-1 bg-stone-100 text-stone-600 text-xs px-2 py-1 rounded-md">
                              {email} <button onClick={() => removeEmail(email)} className="hover:text-red-500"><X size={12} /></button>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Phones */}
                      <div>
                        <label className="block text-sm font-bold text-stone-700 mb-2">Numéros (SMS)</label>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="tel"
                            value={newPhone}
                            onChange={(e) => setNewPhone(e.target.value)}
                            placeholder="06 12 34 56 78"
                            className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-teal-500 focus:ring-teal-500"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddPhone()}
                          />
                          <button onClick={handleAddPhone} className="bg-stone-100 hover:bg-teal-100 text-stone-600 hover:text-teal-700 p-2 rounded-lg transition-colors"><Check size={18} /></button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {recipientPhones.map(phone => (
                            <span key={phone} className="inline-flex items-center gap-1 bg-stone-100 text-stone-600 text-xs px-2 py-1 rounded-md">
                              {phone} <button onClick={() => removePhone(phone)} className="hover:text-red-500"><X size={12} /></button>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Sender Email Section */}
                    <div className="mt-8 pt-8 border-t border-stone-100">
                      <div className="bg-teal-50/50 rounded-2xl p-6 border border-teal-100">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="bg-teal-500 text-white p-2 rounded-lg mt-0.5">
                            <User size={18} />
                          </div>
                          <div>
                            <h3 className="font-serif font-bold text-lg text-stone-800">Votre E-mail (Expéditeur)</h3>
                            <p className="text-stone-500 text-sm mt-1">
                              Saisissez votre e-mail pour revoir votre carte, consulter les statistiques et suivre son envoi.
                            </p>
                          </div>
                        </div>
                        <div className="max-w-md flex gap-2">
                          <input
                            type="email"
                            value={senderEmail}
                            onChange={(e) => setSenderEmail(e.target.value)}
                            placeholder="votre@email.com"
                            className="flex-1 rounded-xl border border-stone-200 px-4 py-3 text-base focus:border-teal-500 focus:ring-teal-500 bg-white shadow-sm transition-all"
                          />
                          <Button 
                            variant="secondary"
                            className="rounded-xl h-auto px-5 bg-teal-500 hover:bg-teal-600 text-white border-0"
                            onClick={() => {
                              // Simple feedback since it's autosaved
                              alert("Email enregistré !")
                            }}
                          >
                            Valider
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {shareUrl && (
                  <div className="mt-8 bg-stone-50 rounded-2xl p-6 border border-stone-200 text-center animate-in fade-in slide-in-from-bottom-4">
                    <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send size={32} className="text-teal-600" />
                    </div>
                    <h3 className="text-xl font-serif font-bold text-stone-800 mb-2">Carte prête à être partagée !</h3>

                    <div className="mb-6 max-w-lg mx-auto">
                      <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 text-left">Lien de partage</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          value={shareUrl}
                          className="flex-1 bg-white border border-stone-200 rounded-lg px-3 text-sm text-stone-600 focus:outline-none py-2"
                        />
                        <Button onClick={copyToClipboard} variant="outline" className="bg-white hover:bg-stone-50 text-stone-600 border-stone-200 text-sm py-2 h-auto">
                          <Copy size={14} className="mr-2" /> Copier
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3">
                      <a href={`https://wa.me/?text=${encodeURIComponent(`Regarde ma carte postale ! ${shareUrl}`)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-full font-bold text-xs hover:opacity-90 transition-opacity">
                        <Share2 size={14} /> WhatsApp
                      </a>
                      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#1877F2] text-white rounded-full font-bold text-xs hover:opacity-90 transition-opacity">
                        <Facebook size={14} /> Facebook
                      </a>
                      <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Regarde ma carte postale !`)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2] text-white rounded-full font-bold text-xs hover:opacity-90 transition-opacity">
                        <Twitter size={14} /> Twitter
                      </a>
                    </div>
                  </div>
                )}
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
          <button
            onClick={() => setShowFullscreen(false)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/10 z-10"
            aria-label="Fermer"
          >
            <X size={28} />
          </button>
          <div onClick={(e) => e.stopPropagation()} className="flex items-center justify-center min-h-full py-2 w-full h-full">
            <PostcardView
              postcard={currentPostcard}
              flipped={showBack}
              className="w-auto h-auto max-w-full max-h-[95vh] aspect-[3/2] shadow-2xl hover:scale-100 cursor-default"
            />
          </div>
        </div>
      )}
    </div>
  )
}
