'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, Copy, Check, X } from 'lucide-react'
import confetti from 'canvas-confetti'
import { incrementShares } from '@/actions/social-actions'

interface ShareButtonProps {
    postcardId: number
    publicId: string
    senderName: string
}

const SHARE_TARGETS = [
    { name: 'WhatsApp', icon: '💬', urlFn: (url: string, text: string) => `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}` },
    { name: 'X', icon: '𝕏', urlFn: (url: string, text: string) => `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}` },
    { name: 'Facebook', icon: '📘', urlFn: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
]

export default function ShareButton({ postcardId, publicId, senderName }: ShareButtonProps) {
    const [showPopup, setShowPopup] = useState(false)
    const [copied, setCopied] = useState(false)
    const popupRef = useRef<HTMLDivElement>(null)

    const shareUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/carte/${publicId}`
        : `/carte/${publicId}`
    const shareText = `Regarde la carte postale de ${senderName} !`

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
                setShowPopup(false)
            }
        }
        if (showPopup) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [showPopup])

    const fireConfetti = () => {
        confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.7 },
            colors: ['#14b8a6', '#f97316', '#eab308', '#ec4899'],
        })
    }

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Carte postale de ${senderName}`,
                    text: shareText,
                    url: shareUrl,
                })
                fireConfetti()
                await incrementShares(postcardId)
            } catch {
                // User cancelled
            }
        } else {
            setShowPopup(true)
        }
    }

    const handleShareTarget = async (urlFn: (url: string, text: string) => string) => {
        window.open(urlFn(shareUrl, shareText), '_blank', 'width=600,height=400')
        fireConfetti()
        setShowPopup(false)
        await incrementShares(postcardId)
    }

    const handleCopy = async () => {
        await navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        fireConfetti()
        await incrementShares(postcardId)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="relative">
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors cursor-pointer"
            >
                <Share2 size={16} />
                Partager
            </motion.button>

            <AnimatePresence>
                {showPopup && (
                    <motion.div
                        ref={popupRef}
                        initial={{ opacity: 0, scale: 0.9, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 8 }}
                        className="absolute bottom-full mb-2 right-0 bg-white rounded-xl shadow-lg border border-stone-200 p-3 min-w-[200px] z-50"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-stone-500 uppercase">Partager via</span>
                            <button onClick={() => setShowPopup(false)} className="text-stone-400 hover:text-stone-600">
                                <X size={14} />
                            </button>
                        </div>
                        <div className="flex gap-2 mb-3">
                            {SHARE_TARGETS.map((target) => (
                                <button
                                    key={target.name}
                                    onClick={() => handleShareTarget(target.urlFn)}
                                    className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-stone-50 transition-colors flex-1"
                                    title={target.name}
                                >
                                    <span className="text-xl">{target.icon}</span>
                                    <span className="text-[10px] text-stone-500">{target.name}</span>
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={handleCopy}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:bg-stone-50 transition-colors"
                        >
                            {copied ? <Check size={14} className="text-teal-600" /> : <Copy size={14} />}
                            {copied ? 'Copié !' : 'Copier le lien'}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
