'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Postcard } from '@/types'
import { MapPin, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getOptimizedImageUrl } from '@/lib/image-processing'
import { getCaptionStyle, getCaptionBgColor } from '@/lib/caption-style'

interface MobilePostcardViewProps {
  postcard: Postcard
}

export default function MobilePostcardView({ postcard }: MobilePostcardViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-2xl mx-auto px-4 flex flex-col gap-0"
    >
      {/* 1. Front Image — full width, tall */}
      <div className="relative w-full rounded-t-2xl overflow-hidden shadow-xl border border-stone-200 border-b-0">
        <div className="w-full aspect-[4/3] relative">
          <Image
            loader={({ src, width, quality }) =>
              getOptimizedImageUrl(src, { width, quality: quality || 80 })
            }
            src={
              postcard.frontImage ||
              'https://img.cartepostale.cool/demo/photo-1507525428034-b723cf961d3e.jpg'
            }
            alt="Carte postale recto"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 512px"
            priority
          />
          {/* Gradient overlay at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Stickers */}
          {postcard.stickers?.map((sticker) => (
            <div
              key={sticker.id}
              className="absolute pointer-events-none"
              style={{
                left: `${sticker.x}%`,
                top: `${sticker.y}%`,
                transform: `translate(-50%, -50%) scale(${sticker.scale}) rotate(${sticker.rotation}deg)`,
                width: '60px',
                height: '60px',
              }}
            >
              <img
                src={getOptimizedImageUrl(sticker.imageUrl || '', { width: 150 })}
                alt="Sticker"
                className="w-full h-full object-contain"
              />
            </div>
          ))}

          {/* Caption + emoji (position personnalisée ou en bas par défaut) */}
          {postcard.frontCaption?.trim() &&
            (() => {
              const captionStyle = getCaptionStyle(postcard)
              const bgColor = getCaptionBgColor(postcard)
              return (
                <div
                  className={cn(
                    'z-10 flex items-center gap-2.5 rounded-xl border border-white/40 backdrop-blur-xl px-4 py-3 shadow-lg w-fit max-w-[calc(100%-2rem)]',
                    postcard.frontCaptionPosition ? 'absolute' : 'absolute bottom-4 left-4 right-4',
                  )}
                  style={
                    postcard.frontCaptionPosition
                      ? {
                          left: `${postcard.frontCaptionPosition.x}%`,
                          top: `${postcard.frontCaptionPosition.y}%`,
                          transform: 'translate(-50%, -50%)',
                          backgroundColor: bgColor,
                        }
                      : { backgroundColor: bgColor }
                  }
                >
                  {postcard.frontEmoji && (
                    <span className="text-2xl leading-none shrink-0">{postcard.frontEmoji}</span>
                  )}
                  <p
                    className="m-0 font-bold leading-tight break-words line-clamp-2"
                    style={{
                      fontFamily: captionStyle.fontFamily,
                      fontSize: captionStyle.fontSize,
                      color: captionStyle.color,
                      textShadow:
                        captionStyle.color === '#ffffff' || captionStyle.color === '#000000'
                          ? '0 1px 2px rgba(0,0,0,0.2), 0 1px 4px rgba(0,0,0,0.15)'
                          : '0 1px 2px rgba(255,255,255,0.8)',
                    }}
                  >
                    {postcard.frontCaption}
                  </p>
                </div>
              )
            })()}

          {/* Location badge */}
          {postcard.location && (
            <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md text-teal-900 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-lg flex items-center gap-1.5">
              <MapPin size={12} className="text-orange-500 shrink-0" />
              <span className="max-w-[200px] truncate">{postcard.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Message Section — styled as the verso */}
      <div className="relative w-full bg-[#fafaf9] rounded-b-2xl shadow-xl border border-stone-200 border-t-0 p-6 pb-8">
        {/* Decorative postal lines */}
        <div
          className="absolute inset-0 rounded-b-2xl overflow-hidden opacity-[0.03]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 27px, #78716c 27px, #78716c 28px)',
          }}
        />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <Mail size={14} className="text-teal-600" />
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">
              Message de {postcard.senderName}
            </span>
          </div>

          {/* Message */}
          <div className="min-h-[120px]">
            <p className="font-handwriting text-stone-700 text-xl leading-relaxed whitespace-pre-wrap break-words">
              {postcard.message}
            </p>
          </div>

          {/* Signature */}
          {postcard.senderName && (
            <div className="mt-4 transform -rotate-2">
              <p
                className="font-handwriting text-teal-700 text-2xl font-bold"
                style={{
                  fontFamily: "'Dancing Script', cursive",
                }}
              >
                — {postcard.senderName}
              </p>
            </div>
          )}

          {/* Location + Date */}
          <div className="mt-6 flex items-center justify-between text-xs text-stone-400">
            <div className="flex items-center gap-1.5">
              <MapPin size={12} className="text-teal-500" />
              <span className="font-medium">{postcard.location}</span>
            </div>
            {postcard.date && <span className="font-medium">{postcard.date}</span>}
          </div>

          {/* Watermark */}
          <div className="mt-4 flex flex-col items-center justify-center gap-2">
            <div className="flex items-center gap-1.5 opacity-40">
              <Mail size={10} className="text-teal-600" />
              <span className="text-[9px] font-semibold tracking-[0.2em] uppercase text-stone-500">
                cartepostale.cool
              </span>
            </div>

            <div className="flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full bg-white/40 border border-stone-200/50 text-stone-400">
              <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-center">
                Cliquez sur le texte ou la carte pour agrandir
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
