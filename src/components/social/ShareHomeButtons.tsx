'use client'

import { useState } from 'react'
import { Share2, Copy, Check } from 'lucide-react'
import { motion } from 'framer-motion'

const SHARE_TARGETS = [
  { name: 'WhatsApp', icon: '💬', urlFn: (url: string, text: string) => `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}` },
  { name: 'X', icon: '𝕏', urlFn: (url: string, text: string) => `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}` },
  { name: 'Facebook', icon: '📘', urlFn: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
]

const SHARE_TEXT = 'Découvre CartePostale.cool — crée des cartes postales virtuelles en un clic ! ✨📮'

export default function ShareHomeButtons() {
  const [copied, setCopied] = useState(false)
  const url = typeof window !== 'undefined' ? window.location.origin : ''
  const shareUrl = url || 'https://cartepostale.cool'

  const handleShareTarget = (urlFn: (url: string, text: string) => string) => {
    window.open(urlFn(shareUrl, SHARE_TEXT), '_blank', 'width=600,height=400')
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      {SHARE_TARGETS.map((target) => (
        <motion.button
          key={target.name}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleShareTarget(target.urlFn)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border-2 border-stone-200 text-stone-700 font-semibold text-sm shadow-sm hover:border-pink-300 hover:shadow-md hover:bg-pink-50/50 transition-all"
        >
          <span className="text-lg">{target.icon}</span>
          <span>{target.name}</span>
        </motion.button>
      ))}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleCopy}
        className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold text-sm shadow-lg shadow-pink-500/25 hover:opacity-95 transition-opacity"
      >
        {copied ? <Check size={18} /> : <Copy size={18} />}
        {copied ? 'Copié !' : 'Copier le lien'}
      </motion.button>
    </>
  )
}
