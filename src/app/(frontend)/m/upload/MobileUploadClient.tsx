'use client'

import React, { useState, useRef } from 'react'
import { Image as ImageIcon, Loader2, CheckCircle } from 'lucide-react'
import {
  verifyAndAddMobileGalleryImage,
  validateMobileToken,
} from '@/actions/mobile-upload-actions'
import { fileToProcessedDataUrl, dataUrlToBlob } from '@/lib/image-processing'
import { extractExifData } from '@/lib/extract-exif'
import Image from 'next/image'

export default function MobileUploadClient({ token }: { token: string }) {
  const [isUploading, setIsUploading] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>(
    'idle',
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [totalFiles, setTotalFiles] = useState(0)
  const [currentFileIndex, setCurrentFileIndex] = useState(0)
  const [uploadDetail, setUploadDetail] = useState('')
  const [progressPercent, setProgressPercent] = useState(0)

  React.useEffect(() => {
    async function checkToken() {
      const { success } = await validateMobileToken(token)
      if (!success) {
        setErrorMessage('Code invalide ou expiré. Scannez à nouveau le QR code.')
        setUploadStatus('error')
      }
      setIsValidating(false)
    }
    checkToken()
  }, [token])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadStatus('uploading')
    setErrorMessage(null)

    try {
      // Show preview of the first file selected
      const firstFile = files[0]
      const objectUrl = URL.createObjectURL(firstFile)
      setPreviewUrl(objectUrl)

      // Upload each file sequentially
      setTotalFiles(files.length)
      for (let i = 0; i < files.length; i++) {
        setCurrentFileIndex(i + 1)
        const file = files[i]

        // 1. Read, Extract EXIF & Resize via browser canvas
        setUploadDetail(`Analyse de la photo ${i + 1}/${files.length}...`)
        setProgressPercent(10)
        const exif = await extractExifData(file)

        setUploadDetail(`Création de la vignette...`)
        setProgressPercent(20)
        const resizedDataUrl = await fileToProcessedDataUrl(file)

        setProgressPercent(30)
        const blob = await dataUrlToBlob(resizedDataUrl)
        if (!blob) throw new Error('Failed to create image blob')

        const filename = `mobile-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const mimeType = blob.type
        const filesize = blob.size

        // 3. Get generic presigned URL for upload
        setUploadDetail(`Préparation de l'envoi...`)
        setProgressPercent(40)
        const presignedRes = await fetch('/api/upload-presigned', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename, mimeType, filesize, folder: 'gallery' }),
        })
        if (!presignedRes.ok) {
          throw new Error("Erreur réseau lors de la préparation de l'envoi")
        }
        const { url: uploadUrl, key } = await presignedRes.json()

        // 4. Upload directly to R2
        setUploadDetail(`Envoi en cours...`)
        setProgressPercent(40)

        await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.open('PUT', uploadUrl, true)
          xhr.setRequestHeader('Content-Type', mimeType)

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const percentComplete = Math.round((e.loaded / e.total) * 40) // 40% to 80%
              setProgressPercent(40 + percentComplete)
              setUploadDetail(`Envoi en cours (${Math.round((e.loaded / e.total) * 100)}%)...`)
            }
          }

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(true)
            } else {
              reject(new Error('Erreur lors de l’envoi du fichier vers le serveur'))
            }
          }

          xhr.onerror = () => reject(new Error('Erreur réseau lors de l’envoi'))
          xhr.send(blob)
        })

        // 5. Save the relation in Payload via Server Action, using the token
        setUploadDetail(`Sauvegarde...`)
        setProgressPercent(90)
        const saveRes = await verifyAndAddMobileGalleryImage(
          token,
          key,
          mimeType,
          filesize,
          file.name,
          exif,
        )
        if (!saveRes.success) {
          throw new Error(
            saveRes.error || 'Erreur lors de la sauvegarde du média (Token invalide?)',
          )
        }

        setProgressPercent(100)
      }

      setUploadStatus('success')
    } catch (err: any) {
      console.error('Upload Error:', err)
      setErrorMessage(err.message || 'Une erreur est survenue lors de l’upload.')
      setUploadStatus('error')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const resetState = () => {
    setUploadStatus('idle')
    setPreviewUrl(null)
    setErrorMessage(null)
    setProgressPercent(0)
    setCurrentFileIndex(0)
    setTotalFiles(0)
    setUploadDetail('')
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Success State */}
      {uploadStatus === 'success' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-emerald-100 text-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-emerald-800 mb-2">Photos envoyées !</h2>
          <p className="text-emerald-700 mb-6 font-medium">
            Elles sont maintenant accessibles dans votre galerie sur votre ordinateur.
          </p>

          {previewUrl && (
            <div className="relative aspect-square w-full max-w-[200px] mx-auto rounded-xl overflow-hidden shadow-sm mb-6 border-4 border-white">
              <Image src={previewUrl} alt="Aperçu" fill className="object-cover" />
            </div>
          )}

          <button
            onClick={resetState}
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-4 px-6 rounded-xl transition-colors shadow-sm"
          >
            Envoyer d&apos;autres photos
          </button>
        </div>
      )}

      {/* Error state */}
      {uploadStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-xl font-bold text-red-800 mb-2">Oups...</h2>
          <p className="text-red-700 mb-6 font-medium">{errorMessage}</p>
          <button
            onClick={resetState}
            className="w-full border-2 border-red-300 hover:bg-red-100 active:bg-red-200 text-red-700 font-bold py-4 px-6 rounded-xl transition-colors"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Validation loading state */}
      {isValidating && (
        <div className="flex flex-col items-center justify-center p-12 text-stone-400">
          <Loader2 className="h-10 w-10 animate-spin mb-4" />
          <p className="font-medium">Vérification du code...</p>
        </div>
      )}

      {/* Idle / Uploading State */}
      {!isValidating && (uploadStatus === 'idle' || uploadStatus === 'uploading') && (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
            <p className="text-stone-600 text-center mb-6 font-medium leading-relaxed">
              Choisissez des photos dans votre galerie pour les ajouter à votre carte postale.
            </p>

            {/* Hidden Input */}
            <input
              type="file"
              multiple
              accept="image/jpeg, image/png, image/webp, image/heic, image/heif"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={isUploading}
            />

            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className={`relative flex flex-col items-center justify-center p-10 rounded-xl border-2 transition-all overflow-hidden
                  ${
                    isUploading
                      ? 'border-teal-200 bg-teal-50 text-teal-700'
                      : 'border-dashed border-stone-300 bg-stone-50 hover:bg-stone-100 active:bg-stone-200 text-stone-700 hover:border-teal-500 hover:text-teal-600'
                  }`}
              >
                {/* Upload Overlay */}
                {isUploading && (
                  <div className="absolute inset-0 z-10 bg-teal-500/95 backdrop-blur-sm flex flex-col items-center justify-center text-white animate-in fade-in duration-300 p-6">
                    <Loader2 className="h-10 w-10 animate-spin mb-4" />
                    <p className="font-bold text-lg mb-1">
                      Envoi {currentFileIndex} sur {totalFiles}
                    </p>
                    <p className="text-teal-100 text-sm mb-4 font-medium text-center h-5">
                      {uploadDetail}
                    </p>

                    {/* Progress Bar Container */}
                    <div className="w-full max-w-[200px] h-2 bg-teal-800/50 rounded-full overflow-hidden mb-2">
                      {/* Progress Bar Fill */}
                      <div
                        className="h-full bg-white rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <p className="text-xs text-teal-100 font-bold">{progressPercent}%</p>
                  </div>
                )}

                <ImageIcon className="h-14 w-14 mb-4 text-stone-400 group-hover:text-teal-500 transition-colors" />
                <span className="font-bold text-xl">Choisir des photos</span>
                <span className="text-sm mt-1 opacity-70 font-medium">Depuis votre galerie</span>
              </button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-stone-400 font-medium">
              Transfert sécurisé vers votre carte postale
            </p>
          </div>
        </>
      )}
    </div>
  )
}
