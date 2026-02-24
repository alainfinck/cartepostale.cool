'use client'

import React, { useState, useCallback } from 'react'
import {
  Search,
  Image as ImageIcon,
  Upload,
  Loader2,
  CloudUpload,
  X,
  Send,
  Trash2,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import {
  type UserMediaItem,
  addUserGalleryImage,
  deleteUserGalleryImage,
} from '@/actions/client-gallery-actions'
import { getOptimizedImageUrl } from '@/lib/image-processing'
import { fileToProcessedDataUrl, dataUrlToBlob } from '@/lib/image-processing'
import { extractExifData } from '@/lib/extract-exif'
import { useDropzone } from 'react-dropzone'
import { MobileUploadQrCode } from '@/components/gallery/MobileUploadQrCode'

interface Props {
  items: UserMediaItem[]
}

export default function UserGalerieClient({ items: initialItems }: Props) {
  const [items, setItems] = useState<UserMediaItem[]>(initialItems)
  const [search, setSearch] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [selectedImage, setSelectedImage] = useState<UserMediaItem | null>(null)

  const filteredItems = items.filter((item) => {
    if (!search) return true
    return item.alt.toLowerCase().includes(search.toLowerCase())
  })

  // Handle local file selection and R2 upload (one file)
  const uploadFile = async (file: File) => {
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
    }
  }

  const handleDelete = async (e: React.MouseEvent, item: UserMediaItem) => {
    e.stopPropagation()
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette image de votre galerie ?')) return

    setIsDeleting(item.id)
    try {
      const res = await deleteUserGalleryImage(item.id)
      if (res.success) {
        setItems((prev) => prev.filter((i) => i.id !== item.id))
        if (selectedImage?.id === item.id) {
          setSelectedImage(null)
        }
      } else {
        alert(res.error || 'Erreur lors de la suppression')
      }
    } catch (err) {
      console.error('Delete Error:', err)
      alert('Une erreur est survenue lors de la suppression.')
    } finally {
      setIsDeleting(null)
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    // Upload files sequentially to avoid overwhelming the server/browser
    for (const file of acceptedFiles) {
      await uploadFile(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
      'image/heic': [],
      'image/heif': [],
    },
    noClick: true,
    noKeyboard: true,
  })

  return (
    <div {...getRootProps()} className="space-y-6 relative rounded-2xl min-h-[500px] outline-none">
      {/* Drop overlay when drag is active */}
      {isDragActive && (
        <div className="absolute inset-0 z-50 bg-teal-500/10 backdrop-blur-[2px] border-2 border-dashed border-teal-500 rounded-2xl flex flex-col items-center justify-center transition-all animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-full shadow-lg mb-4">
            <CloudUpload className="h-10 w-10 text-teal-500" />
          </div>
          <h3 className="text-2xl font-bold text-teal-800">Déposez vos images ici</h3>
          <p className="text-teal-600 mt-2 font-medium">
            Elles seront redimensionnées et envoyées automatiquement
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mobile QR Code Upload */}
        <MobileUploadQrCode />

        {/* Drop Zone Box */}
        <div
          onClick={open}
          className="group relative border-2 border-dashed border-stone-300 rounded-2xl p-8 flex flex-col items-center justify-center bg-stone-50/50 hover:bg-white hover:border-teal-500 hover:shadow-md transition-all cursor-pointer overflow-hidden min-h-[200px]"
        >
          {isUploading && (
            <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 text-teal-500 animate-spin" />
                <p className="text-sm font-medium text-stone-600">Envoi en cours...</p>
              </div>
            </div>
          )}

          <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
            <CloudUpload className="h-8 w-8 text-stone-400 group-hover:text-teal-500" />
          </div>
          <h3 className="text-stone-900 font-semibold mb-1 text-center">
            Glissez-déposez vos photos ici
          </h3>
          <p className="text-sm text-stone-500 text-center">
            ou <span className="text-teal-600 font-medium">parcourez vos fichiers</span> pour les
            ajouter
          </p>
          <p className="text-[11px] text-stone-400 mt-3 flex items-center gap-4">
            <span>JPG, PNG, WebP, HEIC</span>
            <span className="w-1 h-1 bg-stone-300 rounded-full" />
            <span>Plusieurs fichiers</span>
          </p>
          <input {...getInputProps()} />
        </div>
      </div>

      {/* Search and Filter */}
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

        {filteredItems.length > 0 && (
          <p className="text-xs text-stone-400 font-medium">
            {filteredItems.length} image{filteredItems.length > 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Grid */}
      {filteredItems.length === 0 ? (
        items.length > 0 && (
          <div className="text-center py-20 bg-stone-50 border border-dashed border-stone-200 rounded-2xl">
            <ImageIcon className="h-10 w-10 text-stone-400 mx-auto mb-4 opacity-50" />
            <p className="text-stone-900 font-medium">
              Aucune image ne correspond à votre recherche
            </p>
          </div>
        )
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedImage(item)}
              className="group relative rounded-xl border border-stone-200 bg-white overflow-hidden hover:shadow-md transition-all cursor-pointer"
            >
              <div className="aspect-square bg-stone-100 relative">
                <Image
                  src={getOptimizedImageUrl(item.url, { width: 400, quality: 80 })}
                  alt={item.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                />
              </div>
              <div className="p-3 bg-white">
                <h3 className="font-medium text-xs text-stone-700 truncate" title={item.alt}>
                  {item.alt}
                </h3>
                <p className="text-[10px] text-stone-400 mt-1">
                  {new Date(item.addedAt).toLocaleDateString('fr-FR')}
                </p>
              </div>

              {/* Action Overlay on Hover */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => handleDelete(e, item)}
                  disabled={isDeleting === item.id}
                  className="p-2 bg-white/90 hover:bg-red-50 text-stone-600 hover:text-red-500 rounded-full shadow-sm transition-colors disabled:opacity-50"
                  title="Supprimer l'image"
                >
                  {isDeleting === item.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl max-h-screen flex flex-col">
            {/* Top Toolbar */}
            <div className="flex justify-between items-center p-4">
              <span className="text-white font-medium drop-shadow-md truncate max-w-xs">
                {selectedImage.alt}
              </span>
              <button
                onClick={() => setSelectedImage(null)}
                className="bg-stone-800/50 hover:bg-stone-700 p-2 rounded-full text-white transition-colors"
                aria-label="Fermer"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Main Image */}
            <div className="relative flex-1 min-h-[50vh] flex items-center justify-center">
              <Image
                src={selectedImage.url}
                alt={selectedImage.alt}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-center p-6 mt-4">
              <button
                onClick={() => {
                  window.location.href = `/editor?imageId=${selectedImage.id}`
                }}
                className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-full shadow-lg flex items-center gap-3 transition-transform hover:scale-105 active:scale-95"
              >
                <Send className="h-5 w-5" />
                Utiliser pour une vraie carte
              </button>

              <button
                onClick={(e) => handleDelete(e, selectedImage)}
                disabled={isDeleting === selectedImage.id}
                className="bg-stone-800/80 hover:bg-red-500/90 text-white font-medium py-3 px-6 rounded-full shadow-lg flex items-center gap-3 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {isDeleting === selectedImage.id ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Trash2 className="h-5 w-5" />
                )}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
