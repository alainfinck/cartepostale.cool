'use client'

import React, { useState, useRef, useCallback } from 'react'
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
} from 'lucide-react'
import { Postcard, Template } from '@/types'
import PostcardView from '@/components/postcard/PostcardView'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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
  const [message, setMessage] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [senderName, setSenderName] = useState('')
  const [location, setLocation] = useState('')

  const [stampStyle, setStampStyle] = useState<Postcard['stampStyle']>('classic')
  const [stampLabel, setStampLabel] = useState('Digital Poste')
  const [stampYear, setStampYear] = useState('2024')
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [mediaItems, setMediaItems] = useState<Postcard['mediaItems']>([])
  const [isPremium, setIsPremium] = useState(false)
  const [showFullscreen, setShowFullscreen] = useState(false)

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep)
  const showBack = currentStep === 'redaction'

  const canGoNext = () => {
    switch (currentStep) {
      case 'photo':
        return frontImage !== ''
      case 'redaction':
        return (
          message.trim().length > 0 &&
          recipientName.trim() !== '' &&
          senderName.trim() !== '' &&
          location.trim() !== ''
        )
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
      () => {
        setIsLocating(false)
      },
      () => {
        setIsLocating(false)
      }
    )
  }

  const handleAlbumUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newItems = Array.from(e.target.files).map((file: File) => ({
        id: Date.now() + Math.random().toString(),
        type: file.type.startsWith('video') ? 'video' : 'image',
        url: URL.createObjectURL(file), // Note: In a real app, this would be an upload URL
      })) as Postcard['mediaItems']

      setMediaItems((prev) => {
        const updated = [...(prev || []), ...(newItems || [])]
        setIsPremium(updated.length > 0)
        return updated
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
    message: message || 'Votre message apparaîtra ici...',
    recipientName: recipientName || 'Destinataire',
    senderName: senderName || 'Expéditeur',

    location: location || 'Quelque part...',
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
  }

  const filteredTemplates =
    selectedCategory === 'all'
      ? SAMPLE_TEMPLATES
      : SAMPLE_TEMPLATES.filter((t) => t.category === selectedCategory)

  const handlePublish = () => {
    alert('Publication en cours... (fonctionnalité bientôt disponible)')
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
              <PostcardView postcard={currentPostcard} flipped={showBack} />
              <p className="text-stone-400 text-xs mt-3 text-center">L&apos;aperçu se met à jour en temps réel</p>
              <Button
                variant="outline"
                className="w-full mt-4 rounded-xl border-stone-200 text-stone-600 hover:bg-stone-50 gap-2"
                onClick={() => setShowFullscreen(true)}
              >
                <Eye size={18} />
                Voir comme le destinataire (Plein écran)
              </Button>
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
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="ex: Bali, Indonésie"
                          className="w-full rounded-xl border border-stone-200 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-base py-3 px-4 bg-stone-50 focus:bg-white transition-colors placeholder:text-stone-400"
                        />
                        <button
                          onClick={handleGeolocation}
                          disabled={isLocating}
                          className="p-3 bg-stone-100 hover:bg-teal-100 text-stone-500 hover:text-teal-700 rounded-xl border border-stone-200 transition-colors flex-shrink-0"
                          title="Ma position actuelle"
                        >
                          {isLocating ? (
                            <RefreshCw size={18} className="animate-spin" />
                          ) : (
                            <Locate size={18} />
                          )}
                        </button>
                      </div>
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
                <h2 className="text-2xl font-serif font-bold text-stone-800 mb-2">
                  Votre carte est prête !
                </h2>
                <p className="text-stone-500 mb-6">
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
                    <button
                      onClick={() => setCurrentStep('photo')}
                      className="ml-auto text-teal-500 hover:text-teal-700 text-xs font-bold"
                    >
                      Modifier
                    </button>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-stone-50 rounded-xl">
                    <Type size={18} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                        Message
                      </p>
                      <p className="text-stone-700 text-sm mt-0.5 line-clamp-2">{message}</p>
                    </div>
                    <button
                      onClick={() => setCurrentStep('redaction')}
                      className="ml-auto text-teal-500 hover:text-teal-700 text-xs font-bold flex-shrink-0"
                    >
                      Modifier
                    </button>
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
                    <button
                      onClick={() => setCurrentStep('redaction')}
                      className="ml-auto text-teal-500 hover:text-teal-700 text-xs font-bold"
                    >
                      Modifier
                    </button>
                  </div>
                </div>

                {/* Publish Button */}
                <Button
                  onClick={handlePublish}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold text-lg py-6 h-auto shadow-lg shadow-orange-200 flex items-center justify-center gap-3 transition-all hover:-translate-y-0.5"
                >
                  <Send size={20} />
                  Envoyer ma carte postale
                </Button>
              </div>
            )}

            {/* Mobile Card Preview — always visible below editor on small screens */}
            <div className="lg:hidden mt-8">
              <div className="flex items-center gap-2 mb-3">
                <Eye size={14} className="text-teal-500" />
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Aperçu de votre carte
                </span>
                <div className="flex items-center gap-1.5 ml-auto text-stone-400 text-[10px] font-medium">
                  <RefreshCw size={10} className="animate-spin" style={{ animationDuration: '3s' }} />
                  Temps réel
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
        </div>
      </div>

      {/* Modal plein écran : voir comme le destinataire */}
      {showFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-stone-900/95 flex items-center justify-center p-4"
          onClick={() => setShowFullscreen(false)}
        >
          <button
            onClick={() => setShowFullscreen(false)}
            className="absolute top-6 right-6 p-2 text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/10"
            aria-label="Fermer"
          >
            <X size={28} />
          </button>
          <div className="scale-110" onClick={(e) => e.stopPropagation()}>
            <PostcardView postcard={currentPostcard} flipped={showBack} />
          </div>
        </div>
      )}
    </div>
  )
}
