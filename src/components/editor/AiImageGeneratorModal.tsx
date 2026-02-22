'use client'

import React, { useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Sparkles,
  Loader2,
  Image as ImageIcon,
  Wand2,
  CreditCard,
  Lock,
  RefreshCw,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const AI_GENERATION_PRICE_EUR = 0.99

const PROMPT_SUGGESTIONS = [
  { label: 'Plage paradisiaque', prompt: 'A stunning tropical beach with crystal clear turquoise water, white sand, palm trees, golden sunset light' },
  { label: 'Paris romantique', prompt: 'Romantic view of the Eiffel Tower at sunset with warm golden light, Parisian rooftops, beautiful sky' },
  { label: 'Montagne enneigée', prompt: 'Majestic snow-capped mountain peaks at sunrise with pink and orange sky, alpine landscape' },
  { label: 'Village méditerranéen', prompt: 'Charming Mediterranean coastal village with colorful houses, blue sea, bougainvillea flowers' },
  { label: 'Forêt enchantée', prompt: 'Magical enchanted forest with sunlight filtering through tall trees, moss-covered path, misty atmosphere' },
  { label: 'Coucher de soleil', prompt: 'Breathtaking sunset over the ocean with dramatic clouds painted in orange, pink and purple' },
]

interface AiImageGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (imageUrl: string) => void
  hasPaid: boolean
  onRequestPayment: () => void
}

export function AiImageGeneratorModal({
  isOpen,
  onClose,
  onSelect,
  hasPaid,
  onRequestPayment,
}: AiImageGeneratorModalProps) {
  const [prompt, setPrompt] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const handleGenerate = useCallback(
    async (customPrompt?: string) => {
      const finalPrompt = (customPrompt || prompt).trim()
      if (!finalPrompt) return

      if (!hasPaid) {
        onRequestPayment()
        return
      }

      setLoading(true)
      setError(null)
      setImages([])
      setSelectedImage(null)

      try {
        const res = await fetch('/api/ai-postcard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: finalPrompt, num: 2 }),
        })

        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'Erreur lors de la génération.')
          return
        }

        if (data.images && data.images.length > 0) {
          setImages(data.images)
        } else {
          setError('Aucune image générée. Essayez une autre description.')
        }
      } catch (err) {
        setError('Erreur réseau. Vérifiez votre connexion et réessayez.')
      } finally {
        setLoading(false)
      }
    },
    [prompt, hasPaid, onRequestPayment],
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGenerate()
    }
  }

  const handleSelectImage = (url: string) => {
    setSelectedImage(url)
  }

  const handleConfirm = () => {
    if (selectedImage) {
      onSelect(selectedImage)
      setPrompt('')
      setImages([])
      setSelectedImage(null)
    }
  }

  const handleSuggestionClick = (suggestionPrompt: string) => {
    setPrompt(suggestionPrompt)
    handleGenerate(suggestionPrompt)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-w-[95vw] max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white border-none shadow-2xl">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-serif font-bold text-stone-800 flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-violet-500" />
            Générer une image par IA
          </DialogTitle>
          <DialogDescription className="text-stone-500">
            Décrivez l&apos;image de vos rêves et notre IA la créera pour votre carte postale.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 flex flex-col gap-5 overflow-hidden flex-1">
          {/* Paid feature badge */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-200">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
              <Sparkles className="w-4 h-4 text-violet-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-violet-800">
                Option premium — {AI_GENERATION_PRICE_EUR.toFixed(2).replace('.', ',')} &euro;
              </p>
              <p className="text-xs text-violet-600/80">
                Générez des images uniques par IA pour vos cartes postales
              </p>
            </div>
            {hasPaid ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                <Check className="w-3 h-3" /> Débloqué
              </span>
            ) : (
              <Button
                size="sm"
                onClick={onRequestPayment}
                className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl gap-1.5 px-4"
              >
                <CreditCard className="w-3.5 h-3.5" />
                Débloquer
              </Button>
            )}
          </div>

          {/* Prompt input */}
          <div className="relative group">
            <Wand2 className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-violet-500 transition-colors" size={20} />
            <Input
              placeholder="Décrivez votre image (ex: plage tropicale au coucher de soleil)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={500}
              className="pl-12 h-14 text-lg rounded-2xl border-stone-200 bg-stone-50/50 focus:border-violet-400 focus:ring-violet-400 transition-all"
            />
            <Button
              onClick={() => handleGenerate()}
              disabled={loading || !prompt.trim() || (!hasPaid && false)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-violet-500 hover:bg-violet-600 text-white h-10 px-6 font-bold transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : !hasPaid ? (
                <>
                  <Lock size={14} />
                  Générer
                </>
              ) : (
                'Générer'
              )}
            </Button>
          </div>

          {/* Suggestions */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-widest self-center mr-1">
              Inspirations :
            </span>
            {PROMPT_SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                onClick={() => handleSuggestionClick(s.prompt)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-semibold transition-all',
                  prompt === s.prompt
                    ? 'bg-violet-500 text-white shadow-md shadow-violet-100'
                    : 'bg-stone-100 text-stone-600 hover:bg-violet-100 hover:text-violet-700',
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto pr-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-violet-100 border-t-violet-500 animate-spin" />
                  <Wand2 size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-violet-500" />
                </div>
                <p className="text-stone-500 font-medium animate-pulse">
                  Notre IA crée votre image...
                </p>
                <p className="text-stone-400 text-xs">Cela peut prendre quelques secondes</p>
              </div>
            ) : error ? (
              <div className="p-6 text-center bg-red-50 rounded-2xl border border-red-100">
                <p className="text-red-600 font-medium">{error}</p>
                <Button
                  variant="outline"
                  onClick={() => handleGenerate()}
                  className="mt-4 border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700 gap-2"
                >
                  <RefreshCw size={14} />
                  Réessayer
                </Button>
              </div>
            ) : images.length > 0 ? (
              <div>
                <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">
                  Choisissez votre image
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {images.map((url, i) => (
                    <div
                      key={i}
                      className={cn(
                        'group relative aspect-[3/2] rounded-xl overflow-hidden bg-stone-100 cursor-pointer border-2 transition-all duration-300',
                        selectedImage === url
                          ? 'border-violet-500 ring-2 ring-violet-200 shadow-lg'
                          : 'border-stone-200 hover:border-violet-300 hover:shadow-lg hover:-translate-y-0.5',
                      )}
                      onClick={() => handleSelectImage(url)}
                    >
                      <img
                        src={url}
                        alt={`Image IA ${i + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {selectedImage === url && (
                        <div className="absolute top-3 right-3 bg-violet-500 text-white rounded-full p-1.5 shadow-lg">
                          <Check size={16} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  ))}
                </div>

                {/* Regenerate button */}
                <div className="flex justify-center mt-4">
                  <Button
                    variant="outline"
                    onClick={() => handleGenerate()}
                    disabled={loading}
                    className="gap-2 rounded-xl border-violet-200 text-violet-600 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-300"
                  >
                    <RefreshCw size={14} />
                    Regénérer de nouvelles images
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ImageIcon size={24} className="text-violet-400" />
                </div>
                <p className="text-stone-800 font-bold text-lg">Prêt à créer</p>
                <p className="text-stone-500 text-sm mt-1">
                  Décrivez l&apos;image souhaitée ou choisissez une inspiration ci-dessus.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
          <p className="text-[10px] text-stone-400 font-medium flex items-center gap-1">
            Propulsé par{' '}
            <span className="font-bold text-violet-500">NanoBanana AI</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 font-bold uppercase tracking-widest text-[10px]"
            >
              Fermer
            </Button>
            {selectedImage && (
              <Button
                size="sm"
                onClick={handleConfirm}
                className="bg-violet-500 hover:bg-violet-600 text-white font-bold rounded-xl gap-1.5 px-5"
              >
                <Check size={14} />
                Utiliser cette image
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { AI_GENERATION_PRICE_EUR }
