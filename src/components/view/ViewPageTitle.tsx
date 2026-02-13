'use client'

import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { fireSideCannons } from '@/components/ui/confetti'
import { TextAnimate } from '@/components/ui/text-animate'

interface ViewPageTitleProps {
  title: string
  senderName: string
}

export default function ViewPageTitle({ title, senderName }: ViewPageTitleProps) {
  useEffect(() => {
    // Fire confetti on mount
    const timer = setTimeout(() => {
      fireSideCannons();
    }, 2000); // Slight delay to sync with text appearance
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="text-center mb-12 md:mb-20 px-4 landscape:mb-4 mt-8 md:mt-16 pt-4 md:pt-6 relative z-10 flex flex-col items-center gap-6">
      <TextAnimate
        animation="blurInUp"
        by="word"
        duration={2}
        className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-stone-800 leading-tight tracking-tight max-w-5xl mx-auto [-webkit-font-smoothing:antialiased]"
      >
        {title}
      </TextAnimate>

      <motion.div
        className="flex items-baseline justify-center gap-2 text-stone-500 mt-2 md:mt-4"
        initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ delay: 1.8, duration: 1.2, ease: "easeOut" }}
      >
        <span className="text-lg md:text-xl font-medium tracking-wide whitespace-nowrap">De la part de</span>
        <span className="font-bold text-teal-600 flex items-center gap-2 text-2xl md:text-4xl lg:text-5xl font-serif whitespace-nowrap">
          {senderName}
          <Heart className="inline-block text-red-500 fill-red-500 animate-pulse shrink-0" size={32} strokeWidth={2.5} />
        </span>
      </motion.div>
    </div>
  )
}
