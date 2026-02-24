'use client'

import React, { useState, useRef } from 'react'
import { Search, Image as ImageIcon, Upload, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { type UserMediaItem, addUserGalleryImage } from '@/actions/client-gallery-actions'
import { fileToProcessedDataUrl, dataUrlToBlob, MAX_IMAGE_PX } from '@/lib/image-processing'
import { extractExifData } from '@/lib/extract-exif'

interface Props {
  items: UserMediaItem[]
}

export default function UserGalerieClient({ items: initialItems }: Props) {
  const [items, setItems] = useState<UserMediaItem[]>(initialItems)
  const [search, setSearch] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredItems = items.filter((item) => {
    if (!search) return true
    return item.alt.toLowerCase().includes(search.toLowerCase())
  })

  // Handle local file selection and R2 upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      // 1. Read, Extract EXIF & Resize via browser canvas (fileToProcessedDataUrl handles HEIC too!)
      const exif = await extractExifData(file)
      const resizedDataUrl = await fileToProcessedDataUrl(file)

      const blob = await dataUrlToBlob(resizedDataUrl)
      if (!blob) throw new Error('Failed to create image blob')

      const filename = `gallery-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const mimeType = blob.type
      const filesize = blob.size

      // 3. Get generic presigned URL for upload
      const presignedRes = await fetch('/api/upload-presigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, mimeType, filesize, folder: 'gallery' }),
      })
      if (!presignedRes.ok) {
        throw new Error('Erreur lors de la génération du lien upload')
      }
      const { url: uploadUrl, key } = await presignedRes.json()

      // 4. Upload directly to R2
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': mimeType },
        body: blob,
      })
      if (!uploadRes.ok) {
        throw new Error('Erreur lors de l’envoi du fichier vers le serveur')
      }

      // 5. Save the relation in Payload via server action
      const saveRes = await addUserGalleryImage(key, mimeType, filesize, file.name, exif)
      if (!saveRes.success) {
        throw new Error(saveRes.error || 'Erreur lors de la sauvegarde du média')
      }

      // 6. Optimistically add to UI
      const newItem: UserMediaItem = {
        id: saveRes.id!,
        url: `/media/${encodeURIComponent(key)}`,
        alt: file.name,
        addedAt: new Date().toISOString(),
      }
      setItems((prev) => [newItem, ...prev])
    } catch (err: any) {
      console.error('Upload Error:', err)
      alert(err.message || 'Une erreur est survenue lors de l’upload.')
    } finally {
      setIsUploading(false)
      // reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <Input
            placeholder="Rechercher une image..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white border-stone-200"
          />
        </div>

        <div>
          <input
            type="file"
            accept="image/jpeg, image/png, image/webp"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-teal-500 hover:bg-teal-600 text-white shadow-sm flex items-center gap-2"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Ajouter une image
          </Button>
        </div>
      </div>

      {/* Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-stone-50 border border-dashed border-stone-200 rounded-2xl">
          <ImageIcon className="h-10 w-10 text-stone-400 mx-auto mb-4 opacity-50" />
          <p className="text-stone-900 font-medium mb-1">Aucune image trouvée</p>
          <p className="text-sm text-stone-500">
            {items.length === 0
              ? "Vous n'avez pas encore d'images dans votre galerie."
              : 'Aucune image ne correspond à votre recherche.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-xl border border-stone-200 bg-white overflow-hidden hover:shadow-md transition-all"
            >
              <div className="aspect-square bg-stone-100 relative">
                <Image src={item.url} alt={item.alt} fill className="object-cover" />
              </div>
              <div className="p-3">
                <h3 className="font-medium text-xs text-stone-700 truncate" title={item.alt}>
                  {item.alt}
                </h3>
                <p className="text-[10px] text-stone-400 mt-1">
                  Ajoutée le {new Date(item.addedAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
