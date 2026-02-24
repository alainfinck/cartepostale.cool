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
  onSelect: (url: string | string[]) => void
  multiple?: boolean
}

export default function UserGalleryModal({
  open,
  onOpenChange,
  onSelect,
  multiple = false,
}: Props) {
  const [items, setItems] = useState<UserMediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!open) {
      setSelectedUrls(new Set())
      return
    }
    setLoading(true)
    getUserGalleryMedia()
      .then(setItems)
      .finally(() => setLoading(false))
  }, [open])

  const toggleSelection = (url: string) => {
    if (!multiple) {
      onSelect(url)
      onOpenChange(false)
      return
    }

    const next = new Set(selectedUrls)
    if (next.has(url)) {
      next.delete(url)
    } else {
      next.add(url)
    }
    setSelectedUrls(next)
  }

  const handleConfirm = () => {
    if (selectedUrls.size > 0) {
      onSelect(Array.from(selectedUrls))
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0 overflow-hidden bg-stone-50 border-stone-200">
        <DialogHeader className="p-6 pb-2 border-b border-stone-200 bg-white shadow-sm shrink-0">
          <DialogTitle className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <ImageIcon className="text-teal-500" />
            Ma Galerie
          </DialogTitle>
          <div className="flex items-center justify-between">
            <DialogDescription className="text-stone-500">
              Choisissez une ou plusieurs images déjà utilisées dans vos précédentes cartes
              postales.
            </DialogDescription>
            {multiple && (
              <button
                type="button"
                onClick={handleConfirm}
                disabled={selectedUrls.size === 0}
                className="ml-4 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Valider ({selectedUrls.size})
              </button>
            )}
          </div>
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
              {items.map((item) => {
                const isSelected = selectedUrls.has(item.url)
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleSelection(item.url)}
                    className={`group relative aspect-square rounded-xl overflow-hidden border-2 focus:outline-none transition-all ${
                      isSelected
                        ? 'border-teal-500 ring-2 ring-teal-500/50'
                        : 'border-stone-200 bg-stone-100 hover:border-teal-400'
                    }`}
                  >
                    <Image
                      src={item.url}
                      alt={item.alt}
                      fill
                      className={`object-cover transition-transform duration-300 ${
                        isSelected ? 'scale-105' : 'group-hover:scale-105'
                      }`}
                    />
                    <div
                      className={`absolute inset-0 transition-colors ${
                        isSelected ? 'bg-teal-500/20' : 'bg-black/0 group-hover:bg-black/20'
                      }`}
                    />
                    {multiple && isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-white shadow-md">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
