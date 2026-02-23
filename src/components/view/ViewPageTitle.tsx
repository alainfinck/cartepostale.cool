'use client'

import React, { useEffect } from 'react'
import { motion, easeOut } from 'framer-motion'
import { Heart } from 'lucide-react'
import { fireSideCannons } from '@/components/ui/confetti'
import { TextAnimate } from '@/components/ui/text-animate'

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

interface ViewPageTitleProps {
  title: string
  senderName: string
  location?: string
  date?: string
}

export default function ViewPageTitle({ title, senderName, location, date }: ViewPageTitleProps) {
  useEffect(() => {
    // Confettis une seule fois, après que le titre, l'expéditeur et le pin soient affichés
    const timer = setTimeout(() => {
      fireSideCannons()
    }, 3500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="text-center mb-6 md:mb-8 px-4 mt-8 md:mt-12 pt-8 landscape:mb-2 landscape:mt-2.5 landscape:pt-0 relative z-10 flex flex-col items-center gap-2">
      <TextAnimate
        animation="blurInUp"
        by="word"
        duration={2}
        startOnView={false}
        className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-stone-800 leading-tight tracking-tight max-w-5xl mx-auto [-webkit-font-smoothing:antialiased]"
      >
        {title}
      </TextAnimate>

      <motion.div
        className="flex items-baseline justify-center gap-2 text-stone-500 mt-2 md:mt-4"
        initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ delay: 1.8, duration: 1.2, ease: easeOut }}
      >
        <span className="text-lg md:text-xl font-medium tracking-wide whitespace-nowrap">
          De la part de
        </span>
        <span className="font-bold text-teal-600 flex items-center gap-2 text-2xl md:text-4xl lg:text-5xl font-serif whitespace-nowrap">
          {senderName}
          <Heart
            className="inline-block text-red-500 fill-red-500 animate-pulse shrink-0 w-6 h-6 md:w-8 md:h-8"
            strokeWidth={2.5}
          />
        </span>
      </motion.div>
      {/* Bloc lieu / date — pin rouge type Google qui se « plante » */}
      <motion.div
        className="mt-4 inline-flex items-center gap-3 px-4 py-3 rounded-2xl border border-stone-200/80 bg-gradient-to-br from-stone-50 to-teal-50/30 shadow-sm"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.2, duration: 0.6, ease: easeOut }}
      >
        <motion.div
          className="relative flex items-center justify-center w-10 h-10 shrink-0 origin-bottom"
          initial={{ y: -56, opacity: 0, rotate: -14, scale: 0.6 }}
          animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
          transition={{
            delay: 2.4,
            type: 'spring',
            stiffness: 380,
            damping: 14,
            mass: 0.8,
          }}
        >
          <GooglePinIcon className="w-8 h-12 drop-shadow-md" />
        </motion.div>
        <p className="font-sans text-base md:text-lg text-stone-600 font-medium">
          {location
            ? `Carte postale envoyée depuis ${location}${date ? `, le ${date}` : ''}`
            : date
              ? `Carte postale envoyée le ${date}`
              : 'Carte postale envoyée avec amour'}
        </p>
      </motion.div>
    </div>
  )
}
