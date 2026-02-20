'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Loader2, Image as ImageIcon } from 'lucide-react'
import { getUserGalleryMedia, type UserMediaItem } from '@/actions/client-gallery-actions'
import Image from 'next/image'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (url: string) => void
}

export default function UserGalleryModal({ open, onOpenChange, onSelect }: Props) {
  const [items, setItems] = useState<UserMediaItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    getUserGalleryMedia()
      .then(setItems)
      .finally(() => setLoading(false))
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0 overflow-hidden bg-stone-50 border-stone-200">
        <DialogHeader className="p-6 pb-2 border-b border-stone-200 bg-white shadow-sm shrink-0">
          <DialogTitle className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <ImageIcon className="text-teal-500" />
            Ma Galerie
          </DialogTitle>
          <DialogDescription className="text-stone-500">
            Choisissez une image déjà utilisée dans vos précédentes cartes postales.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-stone-500 space-y-3">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-stone-300" />
              </div>
              <p>Vous n&apos;avez pas encore d&apos;images dans votre galerie.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelect(item.url)
                    onOpenChange(false)
                  }}
                  className="group relative aspect-square rounded-xl overflow-hidden border border-stone-200 bg-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-500 hover:border-teal-400 focus:border-transparent transition-all"
                >
                  <Image
                    src={item.url}
                    alt={item.alt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
