'use client'

import React, { useRef, useCallback } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Download, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface PostcardQRCodeProps {
  /** URL complète de la carte (ex. https://cartepostale.cool/carte/abc123) */
  postcardUrl: string
  /** Afficher le texte sur l'impression / collage sur une vraie carte */
  showPrintHint?: boolean
  /** Version compacte (ex. dans un modal) */
  compact?: boolean
  /** Taille du QR en pixels */
  size?: number
  className?: string
}

/**
 * Affiche un QR code élégant pour accéder à une carte postale, avec bouton de téléchargement.
 * Même composant utilisé en fin de process éditeur et dans l'espace client.
 */
export default function PostcardQRCode({
  postcardUrl,
  showPrintHint = true,
  compact = false,
  size = compact ? 160 : 200,
  className = '',
}: PostcardQRCodeProps) {
  const qrWrapRef = useRef<HTMLDivElement>(null)

  const handleDownload = useCallback(() => {
    const wrap = qrWrapRef.current
    if (!wrap) return
    const svg = wrap.querySelector('svg')
    if (!svg) return
    try {
      const svgString = new XMLSerializer().serializeToString(svg)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)
      const img = new Image()
      img.onload = () => {
        const padding = 24
        canvas.width = img.width + padding * 2
        canvas.height = img.height + padding * 2
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, padding, padding, img.width, img.height)
        URL.revokeObjectURL(url)
        const a = document.createElement('a')
        a.download = 'carte-postale-qr.png'
        a.href = canvas.toDataURL('image/png')
        a.click()
      }
      img.onerror = () => URL.revokeObjectURL(url)
      img.src = url
    } catch {
      // fallback: open in new tab so user can right-click save
      window.open(postcardUrl, '_blank')
    }
  }, [])

  return (
    <div
      className={
        compact
          ? `rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm ${className}`
          : `rounded-3xl border border-stone-200/80 bg-white p-6 md:p-8 shadow-lg ${className}`
      }
    >
      <div className="flex flex-col items-center text-center gap-4">
        <div className="flex items-center gap-2 text-teal-700">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50">
            <QrCode size={22} className="text-teal-600" />
          </div>
          <span className="font-semibold text-stone-800">
            {compact ? 'QR code de la carte' : 'Accédez à votre carte postale'}
          </span>
        </div>

        <div
          ref={qrWrapRef}
          className="flex justify-center rounded-2xl border-2 border-stone-100 bg-white p-4 shadow-inner"
        >
          <QRCodeSVG
            value={postcardUrl}
            size={size}
            level="M"
            includeMargin
            bgColor="#ffffff"
            fgColor="#0d9488"
          />
        </div>

        {showPrintHint && (
          <p className="max-w-[280px] text-xs text-stone-500 leading-relaxed">
            Vous pourrez l&apos;imprimer pour le coller sur une vraie carte postale par exemple.
          </p>
        )}

        <Button
          type="button"
          variant="outline"
          size={compact ? 'sm' : 'default'}
          onClick={handleDownload}
          className="gap-2 border-teal-200 text-teal-700 hover:bg-teal-50 hover:border-teal-300"
        >
          <Download size={compact ? 14 : 18} />
          Télécharger le QR code
        </Button>
      </div>
    </div>
  )
}
