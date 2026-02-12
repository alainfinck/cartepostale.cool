'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface ViewPageTitleProps {
  title: string
  senderName: string
}

const container = {
  hidden: { opacity: 0 },
  visible: (i = 1) => ({
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.08 },
  }),
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
        variants={container}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.25em' }}
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
      </motion.h1>
      <motion.p
        className="text-stone-500 text-sm md:text-lg landscape:text-xs"
        variants={lineReveal}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 0.61, 0.36, 1] as const }}
      >
        De la part de <span className="font-semibold text-teal-600">{senderName}</span>
      </motion.p>
    </div>
  )
}
