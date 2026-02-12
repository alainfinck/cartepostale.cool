'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface ViewPageTitleProps {
  title: string
  senderName: string
}

// Titre : apparaît en très gros (scale 2.8), puis réduit à taille normale après l’apparition des mots
const INITIAL_SCALE = 2.8
const STAGGER_DURATION = 0.08 + 8 * 0.06 + 0.4
const SCALE_DOWN_DELAY = STAGGER_DURATION * 0.55

const container = {
  hidden: { scale: INITIAL_SCALE },
  visible: {
    scale: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
      delay: SCALE_DOWN_DELAY,
      duration: 0.7,
      ease: [0.22, 0.61, 0.36, 1] as const,
    },
  },
}

const wordReveal = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 0.61, 0.36, 1] as const },
  },
}

const lineReveal = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 0.61, 0.36, 1] as const },
  },
}

export default function ViewPageTitle({ title, senderName }: ViewPageTitleProps) {
  const words = title.split(' ')

  return (
    <div className="text-center mb-4 md:mb-8 px-4 landscape:mb-2 mt-6 md:mt-12 pt-4 md:pt-6">
      <motion.h1
        className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-stone-800 mb-2 md:mb-3 landscape:text-xl max-w-4xl mx-auto leading-tight tracking-tight"
        style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.25em' }}
      >
        <motion.span
          className="inline-flex flex-wrap justify-center gap-[0.25em] origin-center"
          variants={container}
          initial="hidden"
          animate="visible"
          style={{ transformOrigin: 'center center' }}
        >
          {words.map((word, i) => (
            <motion.span
              key={i}
              variants={wordReveal}
              className="inline-block"
              style={{ whiteSpace: 'pre' }}
            >
              {word}
            </motion.span>
          ))}
        </motion.span>
      </motion.h1>
      <motion.p
        className="text-stone-500 text-sm md:text-lg landscape:text-xs"
        variants={lineReveal}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.35 + STAGGER_DURATION * 0.5, duration: 0.5, ease: [0.22, 0.61, 0.36, 1] as const }}
      >
        De la part de <span className="font-semibold text-teal-600">{senderName}</span>
      </motion.p>
    </div>
  )
}
