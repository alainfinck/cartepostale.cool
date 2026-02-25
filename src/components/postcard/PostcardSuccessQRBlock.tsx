'use client'

import React, { useState, useEffect } from 'react'
import * as motion from 'motion/react-client'
import PostcardQRCode from './PostcardQRCode'

interface PostcardSuccessQRBlockProps {
  slug: string
  show: boolean
}

/**
 * Bloc affiché en fin de process éditeur (page /carte/[slug]?payment_success=true).
 * Affiche un QR code téléchargeable pour accéder à la carte, avec rappel impression.
 */
export default function PostcardSuccessQRBlock({ slug, show }: PostcardSuccessQRBlockProps) {
  const [postcardUrl, setPostcardUrl] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && slug) {
      setPostcardUrl(`${window.location.origin}/carte/${slug}`)
    }
  }, [slug])

  if (!show || !postcardUrl) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full px-4 py-8 md:py-12"
    >
      <div className="max-w-md mx-auto">
        <PostcardQRCode
          postcardUrl={postcardUrl}
          showPrintHint
          compact={false}
          size={200}
          className="mx-auto"
        />
      </div>
    </motion.section>
  )
}
