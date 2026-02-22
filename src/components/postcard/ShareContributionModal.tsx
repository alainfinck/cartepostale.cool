'use client'

import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Copy, Link2, QrCode } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

interface ShareContributionModalProps {
  isOpen: boolean
  onClose: () => void
  contributeUrl: string
}

export default function ShareContributionModal({
  isOpen,
  onClose,
  contributeUrl,
}: ShareContributionModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contributeUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = contributeUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-teal-700">
              <QrCode size={24} />
              <h2 className="text-lg font-bold">
                Envoyer des photos depuis un téléphone
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-700 transition-colors"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>
          </div>

          <p className="text-sm text-stone-600 mb-6">
            Scannez le QR code avec votre téléphone ou partagez le lien pour
            permettre à quelqu&apos;un d&apos;ajouter des photos à cette carte.
          </p>

          {/* QR Code */}
          <div className="flex justify-center mb-6 p-4 bg-white rounded-xl border border-stone-200">
            <QRCodeSVG
              value={contributeUrl}
              size={200}
              level="M"
              includeMargin
              bgColor="#ffffff"
              fgColor="#0d9488"
            />
          </div>

          {/* Link section */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-stone-500 uppercase tracking-wider">
              <Link2 size={14} />
              Lien à partager
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={contributeUrl}
                className="flex-1 px-3 py-2.5 text-sm rounded-xl border border-stone-200 bg-stone-50 text-stone-700 truncate"
              />
              <button
                onClick={handleCopy}
                className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm flex items-center gap-2 transition-colors shrink-0"
              >
                {copied ? (
                  <>
                    <span className="text-green-200">✓</span>
                    Copié !
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copier
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
