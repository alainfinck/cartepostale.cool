'use client'

import React, { useState } from 'react'
import { Postcard } from '@/types'
import PostcardView from '@/components/postcard/PostcardView'
import MobilePostcardView from '@/components/view/MobilePostcardView'
import { Eye } from 'lucide-react'
import { NumberTicker } from '@/components/ui/number-ticker'
import { Smartphone, CreditCard } from 'lucide-react'

interface PostcardViewToggleProps {
  postcard: Postcard
  views: number
}

export default function PostcardViewToggle({ postcard, views }: PostcardViewToggleProps) {
  const [isMobileView, setIsMobileView] = useState(false)

  return (
    <div className="w-full flex flex-col items-center">
      {/* Toggle button */}
      <div className="mb-4 flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-full border border-stone-200 shadow-sm p-1">
        <button
          onClick={() => setIsMobileView(false)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
            !isMobileView
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          <CreditCard size={13} />
          <span>Carte</span>
        </button>
        <button
          onClick={() => setIsMobileView(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
            isMobileView
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          <Smartphone size={13} />
          <span>Lecture</span>
        </button>
      </div>

      {/* Card view + compteur de vues (même bloc, aligné à droite sous la carte) */}
      <div className="inline-flex flex-col items-end">
        {isMobileView ? (
          <MobilePostcardView postcard={postcard} />
        ) : (
          <PostcardView
            postcard={postcard}
            flipped={false}
            isLarge={true}
            className="shadow-[0_20px_50px_rgba(0,0,0,0.15)] md:shadow-[0_30px_70px_rgba(0,0,0,0.2)] hover:shadow-[0_28px_60px_rgba(0,0,0,0.2)] md:hover:shadow-[0_40px_90px_rgba(0,0,0,0.25)]"
          />
        )}
        <div className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/50 backdrop-blur-sm border border-stone-100/50 text-stone-400 text-xs font-bold uppercase tracking-widest shadow-sm">
          <Eye size={14} className="text-stone-300" />
          <NumberTicker value={views} className="text-stone-400 font-bold" />
          <span>vues</span>
        </div>
      </div>
    </div>
  )
}
