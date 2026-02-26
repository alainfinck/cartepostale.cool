'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface SmartphoneMockupProps {
  url: string
  className?: string
}

export default function SmartphoneMockup({ url, className = '' }: SmartphoneMockupProps) {
  return (
    <div className={`relative mx-auto ${className}`} style={{ width: '375px', height: '812px' }}>
      {/* Device Frame */}
      <div className="absolute inset-0 bg-stone-900 rounded-[3rem] shadow-2xl border-[8px] border-stone-800 overflow-hidden">
        {/* Notch / Dynamic Island */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-stone-900 rounded-b-2xl z-50 flex items-center justify-center">
          <div className="w-12 h-1 bg-stone-800 rounded-full" />
        </div>

        {/* Content Iframe */}
        <div className="absolute inset-0 pt-2 bg-white">
          <iframe
            src={url}
            className="w-full h-full border-none"
            title="Smartphone Preview"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-stone-300 rounded-full z-50 opacity-50" />
      </div>

      {/* Decorative Buttons */}
      <div className="absolute -left-2 top-24 w-1 h-12 bg-stone-800 rounded-l-md" />
      <div className="absolute -left-2 top-40 w-1 h-16 bg-stone-800 rounded-l-md" />
      <div className="absolute -left-2 top-60 w-1 h-16 bg-stone-800 rounded-l-md" />
      <div className="absolute -right-2 top-32 w-1 h-20 bg-stone-800 rounded-r-md" />
    </div>
  )
}
