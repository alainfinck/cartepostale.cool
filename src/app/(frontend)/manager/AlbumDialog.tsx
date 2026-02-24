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
import { Postcard } from '@/payload-types'
import { Camera, Loader2, Save, X, Images } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fileToProcessedDataUrl, dataUrlToBlob } from '@/lib/image-processing'
import { UpdatePostcardFn } from './EditPostcardDialog'

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

  const handleRemove = (idx: number) => {
    setMediaItems((prev) => {
      const next = [...prev]
      next.splice(idx, 1)
      return next
    })
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isPending && !isUploadingAlbum && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Images size={18} className="text-teal-600" />
            Album photo — carte #{postcard.publicId}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Label>
            {mediaItems.length} photo{mediaItems.length !== 1 ? 's' : ''} dans l&apos;album
          </Label>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {mediaItems.map((item, idx) => {
              let url = item.tempUrl || ''
              if (!url && typeof item.media === 'object' && item.media) {
                url = item.media.url || (item.media.filename ? `/media/${item.media.filename}` : '')
              }
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
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
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
            {isPending ? 'Enregistrement...' : 'Enregistrer l\'album'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
