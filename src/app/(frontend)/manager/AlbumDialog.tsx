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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Postcard } from '@/payload-types'
import {
  Camera,
  Loader2,
  Save,
  X,
  Images,
  ImageIcon,
  ArrowLeft,
  ArrowRight,
  MessageSquare,
  ArrowUpDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { fileToProcessedDataUrl, dataUrlToBlob, getOptimizedImageUrl } from '@/lib/image-processing'
import { UpdatePostcardFn } from './EditPostcardDialog'
import UserGalleryModal from '@/components/editor/UserGalleryModal'
import type { UserMediaItem } from '@/actions/client-gallery-actions'

function getItemUrl(item: any): string {
  if (item.tempUrl) return item.tempUrl
  if (typeof item.media === 'object' && item.media !== null) {
    let url = item.media.url || ''
    if (!url && item.media.filename) {
      url = `/media/${item.media.filename}`
    }
    // Decode any %2F that may have been introduced by old generateFileURL encoding
    if (url) url = url.replace(/%2F/gi, '/')
    return url ? getOptimizedImageUrl(url, { width: 400 }) : ''
  }
  return ''
}

interface AlbumDialogProps {
  postcard: Postcard | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  updatePostcardFn?: UpdatePostcardFn
}

export default function AlbumDialog({
  postcard,
  isOpen,
  onClose,
  onSuccess,
  updatePostcardFn,
}: AlbumDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [mediaItems, setMediaItems] = useState<any[]>([])
  const [isUploadingAlbum, setIsUploadingAlbum] = useState(false)
  const [galleryPickerOpen, setGalleryPickerOpen] = useState(false)
  const [editingNoteIdx, setEditingNoteIdx] = useState<number | null>(null)
  const [tempNote, setTempNote] = useState('')

  useEffect(() => {
    if (postcard) {
      setMediaItems(postcard.mediaItems ? [...postcard.mediaItems] : [])
    }
  }, [postcard])

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

    setMediaItems((prev) => [...prev, ...newItems])
    setIsUploadingAlbum(false)
  }

  const handleAddFromGallery = (items: UserMediaItem[]) => {
    const newItems = items.map((item) => ({
      media: { id: item.id, url: item.url },
      type: 'image' as const,
    }))
    setMediaItems((prev) => [...prev, ...newItems])
    setGalleryPickerOpen(false)
  }

  const handleRemove = (idx: number) => {
    setMediaItems((prev) => {
      const next = [...prev]
      next.splice(idx, 1)
      return next
    })
  }

  const moveItem = (idx: number, dir: 1 | -1) => {
    setMediaItems((prev) => {
      const next = [...prev]
      if (idx + dir < 0 || idx + dir >= next.length) return prev
      const temp = next[idx]
      next[idx] = next[idx + dir]
      next[idx + dir] = temp
      return next
    })
  }

  const reverseOrder = () => {
    setMediaItems((prev) => [...prev].reverse())
  }

  const handleSubmit = () => {
    if (!postcard || !updatePostcardFn) return

    startTransition(async () => {
      const normalizedItems = mediaItems.map((item) => {
        if (item.newKey || item.newBase64) return item
        if (typeof item.media === 'object' && item.media !== null) {
          return { media: item.media.id, type: item.type, note: item.note }
        }
        return item
      })

      const result = await updatePostcardFn(postcard.id, { mediaItems: normalizedItems })
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
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isPending && !isUploadingAlbum && onClose()}
    >
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Images size={18} className="text-teal-600" />
            Album photo — carte #{postcard.publicId}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <Label>
              {mediaItems.length} photo{mediaItems.length !== 1 ? 's' : ''} dans l&apos;album
            </Label>
            {mediaItems.length > 1 && (
              <Button variant="outline" size="sm" onClick={reverseOrder} className="h-8 gap-1">
                <ArrowUpDown size={14} /> Inverser l&apos;ordre
              </Button>
            )}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {mediaItems.map((item, idx) => {
              const url = getItemUrl(item)
              return (
                <div
                  key={idx}
                  className="relative aspect-square rounded-lg overflow-hidden border border-border group"
                >
                  {url ? (
                    <img
                      src={url}
                      alt={`Album photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                      Erreur
                    </div>
                  )}
                  {item.note && (
                    <div className="absolute top-1 left-1 bg-teal-500 text-white p-1 rounded-full w-5 h-5 flex items-center justify-center">
                      <MessageSquare size={10} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => moveItem(idx, -1)}
                        className="w-7 h-7 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center disabled:opacity-30"
                        disabled={idx === 0}
                      >
                        <ArrowLeft size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingNoteIdx(idx)
                          setTempNote(item.note || '')
                        }}
                        className="w-7 h-7 bg-teal-500/80 hover:bg-teal-500 text-white rounded-full flex items-center justify-center"
                      >
                        <MessageSquare size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(idx)}
                        className="w-7 h-7 bg-red-500/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center"
                      >
                        <X size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(idx, 1)}
                        className="w-7 h-7 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center disabled:opacity-30"
                        disabled={idx === mediaItems.length - 1}
                      >
                        <ArrowRight size={14} />
                      </button>
                    </div>
                    {item.note && (
                      <div className="text-[10px] text-white/90 truncate w-full px-2 text-center bg-black/20 py-0.5">
                        {item.note}
                      </div>
                    )}
                  </div>
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

            <button
              type="button"
              onClick={() => setGalleryPickerOpen(true)}
              className={cn(
                'flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-teal-200 hover:border-teal-500/50 hover:bg-teal-50/50 hover:text-teal-600 transition-colors cursor-pointer bg-muted/20 text-muted-foreground',
              )}
            >
              <ImageIcon size={20} className="text-teal-600" />
              <span className="text-[10px] mt-1 font-medium select-none">Galerie</span>
            </button>
          </div>
        </div>

        <UserGalleryModal
          open={galleryPickerOpen}
          onOpenChange={setGalleryPickerOpen}
          onSelect={() => {}}
          onSelectMediaItems={handleAddFromGallery}
          multiple
        />

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isPending || isUploadingAlbum}
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || isUploadingAlbum || !updatePostcardFn}
            className="bg-teal-600 hover:bg-teal-700 text-white gap-2"
          >
            {isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isPending ? 'Enregistrement...' : "Enregistrer l'album"}
          </Button>
        </DialogFooter>
      </DialogContent>

      <Dialog
        open={editingNoteIdx !== null}
        onOpenChange={(open) => !open && setEditingNoteIdx(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Commentaire de la photo</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Textarea
              value={tempNote}
              onChange={(e) => setTempNote(e.target.value)}
              placeholder="Ajouter un commentaire..."
              className="resize-none h-32"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingNoteIdx(null)}>
              Annuler
            </Button>
            <Button
              className="bg-teal-600 hover:bg-teal-700 text-white"
              onClick={() => {
                setMediaItems((prev) => {
                  const next = [...prev]
                  if (editingNoteIdx !== null) {
                    next[editingNoteIdx] = { ...next[editingNoteIdx], note: tempNote.trim() }
                  }
                  return next
                })
                setEditingNoteIdx(null)
              }}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
