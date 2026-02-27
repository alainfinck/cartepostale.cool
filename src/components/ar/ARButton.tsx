'use client'

import React, { useState, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import type { Postcard } from '@/types'

const ARPostcardViewer = dynamic(() => import('./ARPostcardViewer'), {
  ssr: false,
  loading: () => null,
})

interface ARButtonProps {
  postcard: Postcard
  className?: string
}

const ARButton: React.FC<ARButtonProps> = ({ postcard, className }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleOpen = useCallback(() => {
    setIsOpen(true)
  }, [])

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  if (!mounted) return null

  const isSupported = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia

  if (!isSupported) return null

  return (
    <>
      <button onClick={handleOpen} className={className} title="Voir en réalité augmentée">
        <div className="w-11 h-11 rounded-full bg-stone-100 flex items-center justify-center group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors shadow-sm">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 shrink-0"
          >
            <path d="M12 3L2 7l10 4 10-4-10-4z" />
            <path d="M2 17l10 4 10-4" />
            <path d="M2 12l10 4 10-4" />
          </svg>
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-stone-500">
          AR
        </span>
      </button>

      {isOpen && <ARPostcardViewer postcard={postcard} onClose={handleClose} />}
    </>
  )
}

export default ARButton
