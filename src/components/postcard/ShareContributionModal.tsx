'use client'

import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Copy, Link2, QrCode, Mail, MessageSquare, Share2 } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

interface ShareContributionModalProps {
  isOpen: boolean
  onClose: () => void
  contributeUrl: string
}

const SHARE_MESSAGE = 'Ajoute tes photos à ma carte postale ! 📸\n\n'

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  )
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

  const fullMessage = `${SHARE_MESSAGE}${contributeUrl}`

  const shareLinks = [
    {
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encodeURIComponent(fullMessage)}`,
      icon: <WhatsAppIcon />,
      className: 'bg-[#25D366] hover:bg-[#20bd5a] text-white',
    },
    {
      label: 'SMS',
      href: `sms:?body=${encodeURIComponent(fullMessage)}`,
      icon: <MessageSquare size={18} />,
      className: 'bg-blue-500 hover:bg-blue-600 text-white',
    },
    {
      label: 'Email',
      href: `mailto:?subject=${encodeURIComponent('Ajoute tes photos à ma carte postale !')}&body=${encodeURIComponent(fullMessage)}`,
      icon: <Mail size={18} />,
      className: 'bg-stone-700 hover:bg-stone-800 text-white',
    },
    {
      label: 'Telegram',
      href: `https://t.me/share/url?url=${encodeURIComponent(contributeUrl)}&text=${encodeURIComponent(SHARE_MESSAGE.trim())}`,
      icon: <TelegramIcon />,
      className: 'bg-[#2CA5E0] hover:bg-[#229ed9] text-white',
    },
  ]

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: 'Ajoute tes photos à ma carte postale !',
        text: SHARE_MESSAGE,
        url: contributeUrl,
      })
    } catch {
      // User cancelled or API not available
    }
  }

  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share

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
        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-teal-700">
              <QrCode size={24} />
              <h2 className="text-lg font-bold">Inviter à ajouter des photos</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-700 transition-colors"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>
          </div>

          <p className="text-sm text-stone-600">
            Partagez ce lien pour permettre à quelqu&apos;un d&apos;ajouter ses photos à cette
            carte.
          </p>

          {/* QR Code */}
          <div className="flex justify-center p-4 bg-white rounded-xl border border-stone-200">
            <QRCodeSVG
              value={contributeUrl}
              size={160}
              level="M"
              includeMargin
              bgColor="#ffffff"
              fgColor="#0d9488"
            />
          </div>

          {/* Link + Copy */}
          <div className="space-y-2">
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

          {/* Share buttons */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Envoyer directement via
            </p>
            <div className="grid grid-cols-4 gap-2">
              {shareLinks.map(({ label, href, icon, className }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl text-xs font-semibold transition-all active:scale-95 ${className}`}
                >
                  {icon}
                  <span>{label}</span>
                </a>
              ))}
            </div>
            {canNativeShare && (
              <button
                onClick={handleNativeShare}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-sm transition-colors"
              >
                <Share2 size={16} />
                Autres options de partage…
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
