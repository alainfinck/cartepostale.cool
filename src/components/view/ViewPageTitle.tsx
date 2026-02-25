'use client'

import React, { useEffect } from 'react'
import { motion, easeOut } from 'framer-motion'
import { Heart } from 'lucide-react'
import { fireSideCannons } from '@/components/ui/confetti'
import { TextAnimate } from '@/components/ui/text-animate'
import type { TemplateCategory } from '@/types'
import { getEventTheme } from '@/lib/event-theme'

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
  eventType?: TemplateCategory
}

export default function ViewPageTitle({ title, senderName, location, date, eventType }: ViewPageTitleProps) {
  const theme = getEventTheme(eventType)

  useEffect(() => {
    // Confettis une seule fois, après que le titre, l'expéditeur et le pin soient affichés
    const timer = setTimeout(() => {
      fireSideCannons()
    }, 3500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="text-center mb-4 md:mb-6 px-4 mt-2 md:mt-4 pt-2 landscape:mb-1 landscape:mt-1 landscape:pt-0 relative z-10 flex flex-col items-center gap-2">
      <TextAnimate
        animation="fadeIn"
        by="character"
        duration={1.5}
        startOnView={false}
        className="text-xl sm:text-2xl md:text-4xl font-serif font-bold text-stone-800 leading-tight tracking-tight [-webkit-font-smoothing:antialiased] mx-auto max-w-xs sm:max-w-none"
      >
        {theme.icon ? `${theme.heroTitle} ${theme.icon}` : theme.heroTitle}
      </TextAnimate>
      <motion.div
        className="flex items-center justify-center text-stone-500"
        initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ delay: 1.5, duration: 1.2, ease: easeOut }}
      >
        <span className="font-handwriting text-teal-600 flex items-center justify-center text-5xl md:text-7xl lg:text-8xl whitespace-nowrap py-2">
          {senderName}
        </span>
      </motion.div>{' '}
    </div>
  )
}
