'use client'

import React, { useState, useTransition, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Postcard, Media, User } from '@/payload-types'
import { updatePostcard, getAllUsers } from '@/actions/manager-actions'
import { Camera, Loader2, Save, X, User as UserIcon, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fileToProcessedDataUrl, dataUrlToBlob } from '@/lib/image-processing'

export type UpdatePostcardFn = (
  id: number,
  data: Record<string, unknown>,
) => Promise<{ success: boolean; error?: string }>

interface EditPostcardDialogProps {
  postcard: Postcard | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  /** When true, show a "duplication" title instead of "Modifier la carte". */
  isDuplicateMode?: boolean
  /** When provided, used instead of the default admin updatePostcard (e.g. for espace client). */
  updatePostcardFn?: UpdatePostcardFn
  /** When true, show the "Client (Auteur)" field so the manager can change the user associated with the card. */
  allowChangeAuthor?: boolean
}

function isMedia(media: any): media is Media {
  return media && typeof media === 'object' && 'url' in media
}

function getFrontImageUrl(postcard: Postcard): string {
  if (postcard.frontImageURL) return postcard.frontImageURL
  if (isMedia(postcard.frontImage) && postcard.frontImage.url) return postcard.frontImage.url
  return 'https://img.cartepostale.cool/demo/photo-1507525428034-b723cf961d3e.jpg'
}

export default function EditPostcardDialog({
  postcard,
  isOpen,
  onClose,
  onSuccess,
  isDuplicateMode = false,
  updatePostcardFn,
  allowChangeAuthor = false,
}: EditPostcardDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState({
    senderName: '',
    recipientName: '',
    location: '',
    message: '',
    frontCaption: '',
    frontEmoji: '',
    frontImage: '',
    mediaItems: [] as any[],
  })
  const [author, setAuthor] = useState<User | null>(null)
  const [userSearch, setUserSearch] = useState('')
  const [userResults, setUserResults] = useState<User[]>([])
  const [isSearchingUsers, setIsSearchingUsers] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [frontImageKey, setFrontImageKey] = useState<string | null>(null)
  const [frontImageMimeType, setFrontImageMimeType] = useState<string | null>(null)
  const [frontImageFilesize, setFrontImageFilesize] = useState<number | null>(null)
  const [isUploadingAlbum, setIsUploadingAlbum] = useState(false)

  useEffect(() => {
    if (postcard) {
      setFormData({
        senderName: postcard.senderName || '',
        recipientName: postcard.recipientName || '',
        location: postcard.location || '',
        message: postcard.message || '',
        frontCaption: postcard.frontCaption || '',
        frontEmoji: postcard.frontEmoji || '',
        frontImage: '',
        mediaItems: postcard.mediaItems ? [...postcard.mediaItems] : [],
      })
      setAuthor(typeof postcard.author === 'object' ? postcard.author : null)
      setUserSearch('')
      setUserResults([])
      setImagePreview(getFrontImageUrl(postcard))
      setFrontImageKey(null)
      setFrontImageMimeType(null)
      setFrontImageFilesize(null)
    }
  }, [postcard])

  useEffect(() => {
    if (!userSearch.trim()) {
      setUserResults([])
      return
    }
    const timer = setTimeout(async () => {
      setIsSearchingUsers(true)
      try {
        const res = await getAllUsers({ search: userSearch, limit: 5 })
        setUserResults(res.docs)
      } finally {
        setIsSearchingUsers(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [userSearch])

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Resize max 2k, JPEG 80%, puis upload du résultat
    const dataUrl = await fileToProcessedDataUrl(file).catch(() => null)
    if (!dataUrl) {
      alert('Impossible de charger cette image.')
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
          setImagePreview(dataUrl)
          setFormData((prev) => ({ ...prev, frontImage: '' }))
          return
        }
      }
    } catch (_) {
      /* fallback to base64 */
    }
    setFrontImageKey(null)
    setFrontImageMimeType(null)
    setFrontImageFilesize(null)
    setImagePreview(dataUrl)
    setFormData((prev) => ({ ...prev, frontImage: dataUrl }))
  }

  const handleAlbumImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setIsUploadingAlbum(true)

    const newItems: any[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const dataUrl = await fileToProcessedDataUrl(file).catch(() => null)
      if (!dataUrl) continue

      const blob = await dataUrlToBlob(dataUrl)
      const safeName = `postcard-album-${Date.now()}-${i}.jpg`

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
            newItems.push({
              tempUrl: dataUrl,
              newKey: key,
              mimeType: 'image/jpeg',
              filesize: blob.size,
              type: 'image',
            })
            continue
          }
        }
      } catch (_) {}
      newItems.push({
        tempUrl: dataUrl,
        newBase64: dataUrl,
        type: 'image',
      })
    }

    setFormData((prev) => ({ ...prev, mediaItems: [...prev.mediaItems, ...newItems] }))
    setIsUploadingAlbum(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!postcard) return

    startTransition(async () => {
      const dataToUpdate: any = {
        senderName: formData.senderName,
        recipientName: formData.recipientName,
        location: formData.location,
        message: formData.message,
        frontCaption: formData.frontCaption,
        frontEmoji: formData.frontEmoji,
        mediaItems: formData.mediaItems.map((item) => {
          // Normalize existing media back to its ID or keep new file info
          if (item.newKey || item.newBase64) return item
          if (typeof item.media === 'object' && item.media !== null) {
            return { media: item.media.id, type: item.type, note: item.note }
          }
          return item
        }),
      }

      if (frontImageKey) {
        dataToUpdate.frontImageKey = frontImageKey
        dataToUpdate.frontImageMimeType = frontImageMimeType ?? undefined
        dataToUpdate.frontImageFilesize = frontImageFilesize ?? undefined
      } else if (formData.frontImage) {
        dataToUpdate.frontImage = formData.frontImage
      }

      if (allowChangeAuthor) {
        dataToUpdate.author = author?.id ?? null
      }

      const updateFn = updatePostcardFn ?? updatePostcard
      const result = await updateFn(postcard.id, dataToUpdate)
      if (result.success) {
        onSuccess()
        onClose()
      } else {
        alert(result.error || 'Une erreur est survenue lors de la mise à jour.')
      }
    })
  }

  if (!postcard) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isDuplicateMode
              ? 'Vous dupliquez cette carte — modifiez le texte et les photos'
              : `Modifier la carte #${postcard.publicId}`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Image Upload Preview */}
          <div className="space-y-2">
            <Label>Photo de la carte</Label>
            <div className="relative group aspect-[3/2] w-full rounded-xl overflow-hidden border-2 border-dashed border-border/50 hover:border-teal-500/50 transition-colors bg-muted/30">
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="cursor-pointer bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full border border-white/30 flex items-center gap-2 hover:bg-white/30 transition-colors">
                      <Camera size={18} />
                      Changer la photo
                      <input
                        type="file"
                        accept="image/*,.heic,.heif,.avif,.webp,.tiff,.bmp"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                </>
              ) : (
                <label className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-teal-500 transition-colors">
                  <Camera size={32} />
                  <span>Ajouter une photo</span>
                  <input
                    type="file"
                    accept="image/*,.heic,.heif,.avif,.webp,.tiff,.bmp"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Album section */}
          <div className="space-y-4 pt-4 border-t border-border/50">
            <Label>Album photo de la carte ({formData.mediaItems.length})</Label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {formData.mediaItems.map((item, idx) => {
                let url = item.tempUrl || ''
                if (!url && typeof item.media === 'object' && item.media) {
                  url =
                    item.media.url || (item.media.filename ? `/media/${item.media.filename}` : '')
                }
                return (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-lg overflow-hidden border border-border group"
                  >
                    {url ? (
                      <img
                        src={url}
                        alt={`Album img ${idx}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center text-xs">
                        Erreur
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => {
                          const newArr = [...prev.mediaItems]
                          newArr.splice(idx, 1)
                          return { ...prev, mediaItems: newArr }
                        })
                      }}
                      className="absolute top-1 right-1 w-6 h-6 bg-black/50 hover:bg-red-500/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )
              })}

              <label
                className={cn(
                  'flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-border/50 hover:border-teal-500/50 hover:text-teal-600 transition-colors cursor-pointer bg-muted/20 text-muted-foreground',
                  isUploadingAlbum && 'opacity-50 cursor-not-allowed',
                )}
              >
                {isUploadingAlbum ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Camera size={20} />
                )}
                <span className="text-[10px] mt-1 font-medium select-none">Ajouter</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,.heic,.heif,.avif,.webp,.tiff,.bmp"
                  className="hidden"
                  onChange={handleAlbumImageChange}
                  disabled={isUploadingAlbum}
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="frontCaption">Texte avant</Label>
              <Input
                id="frontCaption"
                value={formData.frontCaption}
                onChange={(e) => setFormData((prev) => ({ ...prev, frontCaption: e.target.value }))}
                placeholder="Texte sur la face avant"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frontEmoji">Emoji avant</Label>
              <Input
                id="frontEmoji"
                value={formData.frontEmoji}
                onChange={(e) => setFormData((prev) => ({ ...prev, frontEmoji: e.target.value }))}
                placeholder="Emoji (ex: 🌴)"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="senderName">Expéditeur</Label>
              <Input
                id="senderName"
                value={formData.senderName}
                onChange={(e) => setFormData((prev) => ({ ...prev, senderName: e.target.value }))}
                placeholder="Nom de l'expéditeur"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipientName">Destinataire</Label>
              <Input
                id="recipientName"
                value={formData.recipientName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, recipientName: e.target.value }))
                }
                placeholder="Nom du destinataire"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Lieu</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
              placeholder="Lieu (ex: Paris, France)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
              placeholder="Écrivez votre message ici..."
              className="min-h-[120px] resize-none"
              required
            />
          </div>

          {allowChangeAuthor && (
            <div className="space-y-3 p-4 bg-muted/30 rounded-xl border border-border/50">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Client (Compte associé)
              </Label>

              {author ? (
                <div className="flex items-center justify-between p-2 bg-background rounded-lg border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-[10px]">
                      {(author.name || author.email).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold truncate">
                        {author.name || 'Sans Nom'}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate">
                        {author.email}
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-red-500"
                    onClick={() => setAuthor(null)}
                  >
                    <X size={14} />
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Rechercher un client par nom ou email..."
                    className="pl-9 bg-background/50"
                  />
                  {isSearchingUsers && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 size={14} className="animate-spin text-muted-foreground" />
                    </div>
                  )}
                  {userResults.length > 0 && (
                    <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg overflow-hidden">
                      {userResults.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          className="w-full flex items-center gap-3 p-2 hover:bg-muted transition-colors text-left"
                          onClick={() => {
                            setAuthor(user)
                            setUserSearch('')
                            setUserResults([])
                          }}
                        >
                          <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-[10px]">
                            {(user.name || user.email).charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-medium truncate">
                              {user.name || 'Sans Nom'}
                            </span>
                            <span className="text-[10px] text-muted-foreground truncate">
                              {user.email}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-teal-600 hover:bg-teal-700 text-white gap-2"
            >
              {isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
