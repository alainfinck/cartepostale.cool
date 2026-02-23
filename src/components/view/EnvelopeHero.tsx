'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { Heart } from 'lucide-react'

const MiniMap = dynamic(() => import('@/components/postcard/MiniMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-stone-100 animate-pulse" />,
})

interface EnvelopeHeroProps {
  senderName: string
  location?: string
  date?: string
  coords?: { lat: number; lng: number }
  isOpened?: boolean
}

/** Épingle rouge type Google Maps — SVG drop shape */
function GooglePinIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 36"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24C24 5.373 18.627 0 12 0z"
        fill="#EA4335"
        stroke="#C5221F"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="4" fill="white" fillOpacity="0.9" />
    </svg>
  )
}

export default function EnvelopeHero({
  senderName,
  location,
  date,
  coords,
  isOpened = false,
}: EnvelopeHeroProps) {
  const [zoom, setZoom] = useState(1) // Start even further back

  useEffect(() => {
    const timer = setTimeout(() => {
      setZoom(6) // Wider final zoom
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto px-4">
      {/* Title & Sender */}
      <div className="text-center space-y-4">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-serif font-bold text-stone-800 leading-tight">
          Vous avez reçu une carte postale !
        </h1>

        <motion.div
          className="flex items-baseline justify-center gap-2 text-stone-500"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <span className="text-lg font-medium tracking-wide">De la part de</span>
          <span className="font-bold text-teal-600 flex items-center gap-2 text-2xl md:text-4xl font-serif">
            {senderName}
            <Heart
              className="inline-block text-red-500 fill-red-500 animate-pulse shrink-0 w-6 h-6 md:w-8 md:h-8"
              strokeWidth={2.5}
            />
          </span>
        </motion.div>
      </div>

      {/* MiniMap container - Hidden once opened as requested */}
      {!isOpened && (
        <div className="w-full max-w-sm aspect-video rounded-3xl overflow-hidden shadow-xl border-4 border-white relative mt-2">
          {coords ? (
            <div className="w-full h-full relative">
              <MiniMap coords={coords} zoom={zoom} className="w-full h-full" />

              {/* Animated Pin Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <motion.div
                  initial={{ y: -100, opacity: 0, scale: 0.5 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{
                    delay: 1.5,
                    type: 'spring',
                    stiffness: 300,
                    damping: 15,
                    mass: 0.8,
                  }}
                  className="mb-8" // Offset for pin placement
                >
                  <GooglePinIcon className="w-8 h-12 drop-shadow-xl" />
                </motion.div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-stone-100 flex items-center justify-center">
              <GooglePinIcon className="w-8 h-12 opacity-20" />
            </div>
          )}
        </div>
      )}

      {/* Info text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: isOpened ? 0.3 : 2.2 }}
        className="text-center space-y-1 bg-white/50 backdrop-blur-sm px-6 py-3 rounded-full border border-white/50 shadow-sm"
      >
        <p className="text-sm md:text-base text-stone-600 font-medium">
          Envoyée de <span className="text-stone-900 font-bold">{location || 'quelque part'}</span>
          {date && (
            <span>
              , le <span className="text-stone-900 font-bold">{date}</span>
            </span>
          )}
        </p>
      </motion.div>
    </div>
  )
}
