'use client'

import React, { useState, useTransition, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  X,
  Camera,
  Loader2,
  Save,
  MapPin,
  User,
  Users,
  MessageSquare,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  createAgencyPostcard,
  getAgencyPostcards,
  type CreateAgencyPostcardData,
} from '@/actions/agence-actions'
import { fileToProcessedDataUrl, dataUrlToBlob } from '@/lib/image-processing'
import ManagerClient from '@/app/(frontend)/manager/ManagerClient'
import type { PostcardsResult } from '@/actions/manager-actions'
import { toast } from 'sonner'

// ─── Stamp style picker ───────────────────────────────────────────────────────

const STAMP_STYLES = [
  { value: 'classic' as const, label: 'Classic', emoji: '🏛️', desc: 'Style traditionnel' },
  { value: 'modern' as const, label: 'Modern', emoji: '✨', desc: 'Design épuré' },
  { value: 'airmail' as const, label: 'Airmail', emoji: '✈️', desc: 'Courrier aérien' },
]

// ─── Demo photo presets ───────────────────────────────────────────────────────

const DEMO_PHOTOS = [
  {
    url: 'https://img.cartepostale.cool/demo/photo-1507525428034-b723cf961d3e.jpg',
    label: 'Plage tropicale',
  },
  {
    url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80',
    label: 'Paris, Tour Eiffel',
  },
  {
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    label: 'Montagnes alpines',
  },
  {
    url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
    label: 'Bord de lac',
  },
  {
    url: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80',
    label: 'Ruelle colorée',
  },
  {
    url: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=800&q=80',
    label: 'Coucher de soleil',
  },
]

// ─── Create demo card dialog ──────────────────────────────────────────────────

function CreateDemoCardDialog({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [step, setStep] = useState<'photo' | 'details' | 'success'>('photo')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [frontImageKey, setFrontImageKey] = useState<string | null>(null)
  const [frontImageMimeType, setFrontImageMimeType] = useState<string | null>(null)
  const [frontImageFilesize, setFrontImageFilesize] = useState<number | null>(null)
  const [frontImageBase64, setFrontImageBase64] = useState<string | null>(null)
  const [selectedDemoUrl, setSelectedDemoUrl] = useState<string | null>(null)

  const [form, setForm] = useState({
    senderName: '',
    recipientName: '',
    message: '',
    location: '',
    frontCaption: '',
    frontEmoji: '',
    stampStyle: 'classic' as 'classic' | 'modern' | 'airmail',
    status: 'published' as 'published' | 'draft',
  })

  const reset = () => {
    setStep('photo')
    setImagePreview(null)
    setFrontImageKey(null)
    setFrontImageMimeType(null)
    setFrontImageFilesize(null)
    setFrontImageBase64(null)
    setSelectedDemoUrl(null)
    setForm({
      senderName: '',
      recipientName: '',
      message: '',
      location: '',
      frontCaption: '',
      frontEmoji: '',
      stampStyle: 'classic',
      status: 'published',
    })
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const dataUrl = await fileToProcessedDataUrl(file).catch(() => null)
      if (!dataUrl) {
        toast.error('Impossible de charger cette image.')
        return
      }

      const blob = await dataUrlToBlob(dataUrl)
      const safeName = `agency-demo-${Date.now()}.jpg`

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
            setFrontImageBase64(null)
            setSelectedDemoUrl(null)
            setImagePreview(dataUrl)
            return
          }
        }
      } catch (_) {
        /* fallback to base64 */
      }

      setFrontImageKey(null)
      setFrontImageBase64(dataUrl)
      setSelectedDemoUrl(null)
      setImagePreview(dataUrl)
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const selectDemoPhoto = (url: string) => {
    setSelectedDemoUrl(url)
    setFrontImageKey(null)
    setFrontImageBase64(null)
    setImagePreview(url)
  }

  const handleSubmit = () => {
    if (!form.senderName.trim() || !form.message.trim()) {
      toast.error("Le nom de l'expéditeur et le message sont obligatoires.")
      return
    }

    startTransition(async () => {
      const payload: CreateAgencyPostcardData = {
        senderName: form.senderName.trim(),
        recipientName: form.recipientName.trim() || undefined,
        message: form.message.trim(),
        location: form.location.trim() || undefined,
        frontCaption: form.frontCaption.trim() || undefined,
        frontEmoji: form.frontEmoji.trim() || undefined,
        stampStyle: form.stampStyle,
        status: form.status,
      }

      if (frontImageKey) {
        payload.frontImageKey = frontImageKey
        payload.frontImageMimeType = frontImageMimeType ?? undefined
        payload.frontImageFilesize = frontImageFilesize ?? undefined
      } else if (frontImageBase64) {
        payload.frontImage = frontImageBase64
      } else if (selectedDemoUrl) {
        payload.frontImage = selectedDemoUrl
      }

      const result = await createAgencyPostcard(payload)
      if (result.success) {
        setStep('success')
        toast.success('Carte démo créée avec succès !')
        setTimeout(() => {
          onSuccess()
          handleClose()
        }, 1800)
      } else {
        toast.error(result.error || 'Erreur lors de la création.')
      }
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center">
              <Sparkles size={18} className="text-teal-600" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">Créer une carte démo</h2>
              <p className="text-xs text-muted-foreground">
                Associée à votre agence · Visible immédiatement
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          >
            <X size={18} />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-0 px-6 py-3 border-b border-border shrink-0">
          {[
            { key: 'photo', label: 'Photo' },
            { key: 'details', label: 'Contenu' },
          ].map((s, i) => (
            <React.Fragment key={s.key}>
              <div
                className={cn(
                  'flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full transition-all',
                  step === s.key
                    ? 'bg-teal-600 text-white'
                    : step === 'success' || (s.key === 'photo' && step === 'details')
                      ? 'text-teal-600'
                      : 'text-muted-foreground',
                )}
              >
                <span
                  className={cn(
                    'w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold border',
                    step === s.key
                      ? 'bg-white text-teal-600 border-white'
                      : step === 'success' || (s.key === 'photo' && step === 'details')
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'border-current',
                  )}
                >
                  {step === 'success' || (s.key === 'photo' && step === 'details') ? '✓' : i + 1}
                </span>
                {s.label}
              </div>
              {i < 1 && <div className="h-px flex-1 bg-border mx-2" />}
            </React.Fragment>
          ))}
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          <AnimatePresence mode="wait">
            {/* ── Step 1: Photo ── */}
            {step === 'photo' && (
              <motion.div
                key="step-photo"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="p-6 space-y-6"
              >
                {/* Upload zone */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Photo personnalisée
                  </Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.heic,.heif,.avif,.webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      'relative group aspect-[16/9] w-full rounded-xl overflow-hidden border-2 border-dashed cursor-pointer transition-all',
                      imagePreview
                        ? 'border-teal-500/50 hover:border-teal-500'
                        : 'border-border hover:border-teal-400 bg-muted/20 hover:bg-teal-50/20',
                    )}
                  >
                    {imagePreview ? (
                      <>
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full border border-white/30">
                            <Camera size={16} />
                            <span className="text-sm font-medium">Changer la photo</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground hover:text-teal-500 transition-colors">
                        <div className="p-4 bg-muted rounded-2xl group-hover:bg-teal-100 transition-colors">
                          <Camera size={28} />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">Glissez une photo ou cliquez</p>
                          <p className="text-xs text-muted-foreground mt-0.5">JPEG, PNG, WEBP</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Demo photos presets */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Ou choisir une photo démo
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {DEMO_PHOTOS.map((photo) => (
                      <button
                        key={photo.url}
                        type="button"
                        onClick={() => selectDemoPhoto(photo.url)}
                        className={cn(
                          'relative group aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all',
                          imagePreview === photo.url
                            ? 'border-teal-500 ring-2 ring-teal-500/30'
                            : 'border-transparent hover:border-teal-400/60',
                        )}
                      >
                        <img
                          src={photo.url}
                          alt={photo.label}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                          <span className="text-[10px] text-white font-medium">{photo.label}</span>
                        </div>
                        {imagePreview === photo.url && (
                          <div className="absolute top-1 right-1 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                            <CheckCircle2 size={12} className="text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Details ── */}
            {step === 'details' && (
              <motion.div
                key="step-details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="p-6 space-y-5"
              >
                {/* Preview thumbnail */}
                {imagePreview && (
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/50">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-16 h-12 object-cover rounded-lg"
                    />
                    <div>
                      <p className="text-xs font-medium text-foreground">Photo sélectionnée</p>
                      <button
                        type="button"
                        onClick={() => setStep('photo')}
                        className="text-xs text-teal-600 hover:underline"
                      >
                        Changer →
                      </button>
                    </div>
                  </div>
                )}

                {/* Sender / Recipient */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="senderName" className="flex items-center gap-1.5 text-xs">
                      <User size={12} className="text-muted-foreground" />
                      Expéditeur *
                    </Label>
                    <Input
                      id="senderName"
                      value={form.senderName}
                      onChange={(e) => setForm((p) => ({ ...p, senderName: e.target.value }))}
                      placeholder="Ex: Voyages Lumière"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="recipientName" className="flex items-center gap-1.5 text-xs">
                      <Users size={12} className="text-muted-foreground" />
                      Destinataire (optionnel)
                    </Label>
                    <Input
                      id="recipientName"
                      value={form.recipientName}
                      onChange={(e) => setForm((p) => ({ ...p, recipientName: e.target.value }))}
                      placeholder="Ex: Marie Dupont"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                  <Label htmlFor="location" className="flex items-center gap-1.5 text-xs">
                    <MapPin size={12} className="text-muted-foreground" />
                    Lieu
                  </Label>
                  <Input
                    id="location"
                    value={form.location}
                    onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                    placeholder="Ex: Bali, Indonésie"
                  />
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <Label htmlFor="message" className="flex items-center gap-1.5 text-xs">
                    <MessageSquare size={12} className="text-muted-foreground" />
                    Message *
                  </Label>
                  <Textarea
                    id="message"
                    value={form.message}
                    onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                    placeholder="Chers voyageurs, nous vous envoyons nos plus belles pensées depuis..."
                    className="min-h-[120px] resize-none"
                    required
                  />
                </div>

                {/* Front caption & emoji */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="frontCaption" className="text-xs">
                      Texte face avant
                    </Label>
                    <Input
                      id="frontCaption"
                      value={form.frontCaption}
                      onChange={(e) => setForm((p) => ({ ...p, frontCaption: e.target.value }))}
                      placeholder="Ex: Découvrez Bali"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="frontEmoji" className="text-xs">
                      Emoji
                    </Label>
                    <Input
                      id="frontEmoji"
                      value={form.frontEmoji}
                      onChange={(e) => setForm((p) => ({ ...p, frontEmoji: e.target.value }))}
                      placeholder="🌴"
                      className="text-lg"
                    />
                  </div>
                </div>

                {/* Stamp style */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Style du timbre
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {STAMP_STYLES.map((stamp) => (
                      <button
                        key={stamp.value}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, stampStyle: stamp.value }))}
                        className={cn(
                          'flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center',
                          form.stampStyle === stamp.value
                            ? 'border-teal-500 bg-teal-50 text-teal-800'
                            : 'border-border hover:border-teal-300 hover:bg-muted/30',
                        )}
                      >
                        <span className="text-xl">{stamp.emoji}</span>
                        <span className="text-xs font-semibold">{stamp.label}</span>
                        <span className="text-[10px] text-muted-foreground">{stamp.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Statut initial
                  </Label>
                  <div className="flex gap-2">
                    {(
                      [
                        { value: 'published', label: '✅ Publiée', desc: 'Visible immédiatement' },
                        { value: 'draft', label: '📝 Brouillon', desc: 'Enregistrée, non visible' },
                      ] as const
                    ).map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, status: s.value }))}
                        className={cn(
                          'flex-1 flex flex-col p-3 rounded-xl border-2 transition-all text-left',
                          form.status === s.value
                            ? 'border-teal-500 bg-teal-50 text-teal-800'
                            : 'border-border hover:border-teal-300',
                        )}
                      >
                        <span className="text-xs font-semibold">{s.label}</span>
                        <span className="text-[10px] text-muted-foreground">{s.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Success ── */}
            {step === 'success' && (
              <motion.div
                key="step-success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-12 flex flex-col items-center text-center gap-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                  className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center"
                >
                  <CheckCircle2 size={36} className="text-teal-600" />
                </motion.div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Carte créée !</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Votre carte démo est maintenant visible dans la liste.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {step !== 'success' && (
          <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-between gap-3 shrink-0">
            <Button variant="ghost" onClick={handleClose} disabled={isPending}>
              Annuler
            </Button>
            <div className="flex gap-2">
              {step === 'details' && (
                <Button variant="outline" onClick={() => setStep('photo')} disabled={isPending}>
                  ← Retour
                </Button>
              )}
              {step === 'photo' && (
                <Button
                  onClick={() => setStep('details')}
                  className="bg-teal-600 hover:bg-teal-700 text-white gap-2"
                >
                  Suivant →
                </Button>
              )}
              {step === 'details' && (
                <Button
                  onClick={handleSubmit}
                  disabled={isPending || !form.senderName.trim() || !form.message.trim()}
                  className="bg-teal-600 hover:bg-teal-700 text-white gap-2"
                >
                  {isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Création…
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Créer la carte
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

// ─── Main exported component ──────────────────────────────────────────────────

interface AgenceCartesClientProps {
  initialData: PostcardsResult
}

export default function AgenceCartesClient({ initialData }: AgenceCartesClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [data, setData] = useState(initialData)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSuccess = async () => {
    // Re-fetch to get updated list
    const updated = await getAgencyPostcards()
    setData(updated)
    setRefreshKey((k) => k + 1)
    setDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Page header with create button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cartes postales</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Gérez et créez des cartes démo pour présenter votre agence.
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="gap-2 bg-teal-600 hover:bg-teal-700 text-white shadow-md hover:shadow-teal-200/50 transition-all"
        >
          <Plus size={18} />
          Créer une carte démo
        </Button>
      </div>

      {/* Dialog */}
      <AnimatePresence>
        {dialogOpen && (
          <CreateDemoCardDialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            onSuccess={handleSuccess}
          />
        )}
      </AnimatePresence>

      {/* Manager client */}
      <ManagerClient key={refreshKey} initialData={data} useAgenceActions hideStats />
    </div>
  )
}
