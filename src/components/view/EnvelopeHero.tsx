'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { Heart } from 'lucide-react'
import { fireSideCannons } from '@/components/ui/confetti'
import type { TemplateCategory } from '@/types'
import { getEventTheme } from '@/lib/event-theme'

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
  eventType?: TemplateCategory
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

/** Affiche le titre héros avec retours à la ligne corrects et "postale" jamais coupé (whitespace-nowrap). Exporté pour ViewPageTitle. */
export function HeroTitleWithBreaks({
  title,
  icon,
  className = 'text-xl sm:text-2xl md:text-3xl font-serif font-bold text-stone-800 leading-tight mx-auto max-w-xs sm:max-w-none',
}: {
  title: string
  icon: string
  className?: string
}) {
  const lines = title.split('\n')
  const content: React.ReactNode[] = []
  lines.forEach((line, i) => {
    if (i > 0) content.push(<br key={`br-${i}`} />)
    if (line.includes('postale')) {
      const before = line.slice(0, line.indexOf('postale'))
      content.push(
        <React.Fragment key={i}>
          {before}
          <span className="whitespace-nowrap">postale</span>
        </React.Fragment>,
      )
    } else {
      content.push(<React.Fragment key={i}>{line}</React.Fragment>)
    }
  })
  if (icon) content.push(' ', icon)
  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.2 }}
      className={className}
      aria-label={title.replace(/\n/g, ' ')}
    >
      {content}
    </motion.p>
  )
}

export default function EnvelopeHero({
  senderName,
  location,
  date,
  coords,
  isOpened = false,
  eventType,
}: EnvelopeHeroProps) {
  const theme = getEventTheme(eventType)
  useEffect(() => {
    if (isOpened) {
      const timer = setTimeout(() => {
        fireSideCannons()
      }, 500) // fire confetti shortly after opening
      return () => clearTimeout(timer)
    }
  }, [isOpened])

  return (
    <div
      className={`flex flex-col items-center gap-3 w-full max-w-[min(540px,90vw)] mx-auto px-2 sm:px-4 ${isOpened ? 'mt-2 md:mt-4 pt-2' : ''}`}
    >
      {/* Title & Sender — retours à la ligne contrôlés, "postale" jamais coupé */}
      <div className="text-center space-y-5">
        <HeroTitleWithBreaks
          title={theme.heroTitle}
          icon={theme.icon}
          className={
            isOpened
              ? 'text-xl sm:text-2xl md:text-3xl font-serif font-bold text-stone-800 leading-tight mx-auto max-w-xs sm:max-w-none'
              : 'text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-stone-800 leading-tight mx-auto max-w-sm sm:max-w-none'
          }
        />

        <motion.div
          className="flex items-center justify-center text-stone-500"
          initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: 1.5, duration: 1.2 }}
        >
          <span className="font-handwriting text-teal-600 flex items-center justify-center text-3xl md:text-5xl whitespace-nowrap py-2">
            {senderName}
          </span>
        </motion.div>
      </div>

      {/* MiniMap container - Hidden once opened as requested */}
      {!isOpened && (
        <div className="w-full max-w-[min(95vw,1400px)] aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border-4 border-white relative mt-3">
          {coords ? (
            <div className="w-full h-full relative">
              <MiniMap coords={coords} zoom={5} className="w-full h-full" />
            </div>
          ) : (
            <div className="w-full h-full bg-stone-100 flex items-center justify-center">
              <GooglePinIcon className="w-8 h-12 opacity-20" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
