'use client'

import React, { useEffect, useState } from 'react'
import { generateMobileUploadToken } from '@/actions/mobile-upload-actions'
import { QRCodeSVG } from 'qrcode.react'
import { QrCode, Loader2, Smartphone, Check, Link as LinkIcon } from 'lucide-react'

export function MobileUploadQrCode() {
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function initClient() {
      try {
        const res = await generateMobileUploadToken()
        if (res.success && res.token) {
          const origin = window.location.origin
          setUrl(`${origin}/m/upload?t=${res.token}`)
        } else {
          setError(res.error || 'Erreur inconnue')
        }
      } catch (err: any) {
        setError(err.message || 'Impossible de générer le QR code')
      } finally {
        setLoading(false)
      }
    }
    initClient()
  }, [])

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-500 text-sm p-4 bg-red-50 rounded-xl">
        <QrCode className="h-5 w-5" />
        <p>{error}</p>
      </div>
    )
  }

  const copyToClipboard = async () => {
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy', err)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-white border border-stone-200 rounded-2xl shadow-sm h-full">
      <div className="flex-shrink-0 bg-stone-50 p-4 rounded-xl border border-stone-100 flex items-center justify-center min-w-[160px] min-h-[160px]">
        {loading || !url ? (
          <Loader2 className="h-8 w-8 text-stone-300 animate-spin" />
        ) : (
          <QRCodeSVG value={url} size={132} level="Q" className="text-stone-900" />
        )}
      </div>
      <div className="text-center sm:text-left flex flex-col justify-center">
        <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
          <Smartphone className="h-5 w-5 text-teal-600" />
          <h3 className="text-lg font-semibold text-stone-900">Depuis votre mobile</h3>
        </div>
        <p className="text-stone-600 text-sm mb-4">
          Scannez ce QR code avec l'appareil photo de votre smartphone pour accéder à une interface
          d'envoi simplifiée. Les clichés seront instantanément ajoutés à droite.
        </p>

        {url && (
          <button
            onClick={copyToClipboard}
            className="flex items-center justify-center sm:justify-start gap-2 text-sm font-medium transition-colors text-stone-500 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 border border-stone-200 px-3 py-2 rounded-lg"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-500" />
                <span className="text-emerald-600">Lien copié !</span>
              </>
            ) : (
              <>
                <LinkIcon className="h-4 w-4" />
                <span>Copier le lien d'envoi</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
