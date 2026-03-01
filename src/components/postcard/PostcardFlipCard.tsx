'use client'

/**
 * PostcardFlipCard — carte postale recto/verso isolée et réutilisable.
 *
 * Contient uniquement la FlipCard (photo recto + message/timbre/carte verso)
 * issue de PostcardScrollFlow. Pas de navigation, pas d'album, pas de galerie.
 *
 * Usage :
 *   <PostcardFlipCard postcard={postcard} />
 *   <PostcardFlipCard postcard={postcard} className="shadow-xl" />
 */

import React, { useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Postcard } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Compass, Mail, Search, Minus, Plus, RotateCw, ChevronDown, X } from 'lucide-react'
import FlipCard from '@/components/ui/FlipCard'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { cn, isCoordinate } from '@/lib/utils'
import { getOptimizedImageUrl } from '@/lib/image-processing'
import {
  getCaptionStyle,
  getCaptionBgColor,
  getCaptionExtraStyle,
  captionPresetHidesBg,
} from '@/lib/caption-style'

const MiniMap = dynamic(() => import('@/components/postcard/MiniMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-stone-100 animate-pulse flex items-center justify-center text-stone-300 font-bold uppercase tracking-widest text-[10px]">
      Chargement…
    </div>
  ),
})

/** Polices disponibles pour le message au verso */
const BACK_MESSAGE_FONTS = [
  {
    id: 'dancing' as const,
    name: 'Dancing Script',
    fontFamily: "'Dancing Script', cursive",
  },
  {
    id: 'greatVibes' as const,
    name: 'Great Vibes',
    fontFamily: "'Great Vibes', cursive",
  },
  {
    id: 'parisienne' as const,
    name: 'Parisienne',
    fontFamily: "'Parisienne', cursive",
  },
  {
    id: 'sans' as const,
    name: 'Standard',
    fontFamily: 'var(--font-sans), system-ui, sans-serif',
  },
  {
    id: 'serif' as const,
    name: 'Classique (Serif)',
    fontFamily: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
  },
  {
    id: 'indieFlower' as const,
    name: 'Indie Flower',
    fontFamily: "'Indie Flower', cursive",
  },
  {
    id: 'gochiHand' as const,
    name: 'Gochi Hand',
    fontFamily: "'Gochi Hand', cursive",
  },
]

type FontId = (typeof BACK_MESSAGE_FONTS)[number]['id']

interface PostcardFlipCardProps {
  postcard: Postcard
  className?: string
}

export default function PostcardFlipCard({ postcard, className }: PostcardFlipCardProps) {
  const {
    senderName,
    date,
    frontImage,
    message,
    location,
    frontCaption,
    frontCaptionPosition,
    frontEmoji,
    coords,
  } = postcard

  const captionStyle = getCaptionStyle(postcard)
  const captionBgColor = captionPresetHidesBg(postcard.frontCaptionPreset)
    ? 'transparent'
    : getCaptionBgColor(postcard)
  const captionExtraStyle = getCaptionExtraStyle(postcard.frontCaptionPreset)

  const [isFlipped, setIsFlipped] = useState(false)
  const [isFrontImageZoomOpen, setIsFrontImageZoomOpen] = useState(false)
  const [backTextScale, setBackTextScale] = useState(0.9)
  const [backMessageFont, setBackMessageFont] = useState<FontId>('dancing')
  const [isFontMenuOpen, setIsFontMenuOpen] = useState(false)
  const [fontMenuRect, setFontMenuRect] = useState<DOMRect | null>(null)
  const fontMenuAnchorRef = useRef<HTMLDivElement>(null)
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setPortalRoot(typeof document !== 'undefined' ? document.body : null)
  }, [])

  // Fermeture lightbox au clavier
  useEffect(() => {
    if (!isFrontImageZoomOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFrontImageZoomOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isFrontImageZoomOpen])

  // Position du dropdown polices via portal
  useEffect(() => {
    if (!isFontMenuOpen) {
      setFontMenuRect(null)
      return
    }
    const el = fontMenuAnchorRef.current
    if (el) setFontMenuRect(el.getBoundingClientRect())
    const onScrollOrResize = () => {
      if (fontMenuAnchorRef.current)
        setFontMenuRect(fontMenuAnchorRef.current.getBoundingClientRect())
    }
    window.addEventListener('scroll', onScrollOrResize, true)
    window.addEventListener('resize', onScrollOrResize)
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true)
      window.removeEventListener('resize', onScrollOrResize)
    }
  }, [isFontMenuOpen])

  // Fermeture dropdown police au clic extérieur
  useEffect(() => {
    if (!isFontMenuOpen) return
    const onPointerDown = (e: MouseEvent) => {
      const anchor = fontMenuAnchorRef.current
      const target = e.target as Node
      if (anchor?.contains(target)) return
      if (document.querySelector('[data-font-dropdown-flip]')?.contains(target)) return
      setIsFontMenuOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [isFontMenuOpen])

  return (
    <div className={cn('relative w-full', className)}>
      {/* FlipCard */}
      <section className="relative" style={{ perspective: '1000px' }}>
        <FlipCard
          isFlipped={isFlipped}
          className="w-full aspect-[4/3] cursor-pointer group"
          innerClassName="rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.15)]"
          springConfig={{ stiffness: 40, damping: 15 }}
          onClick={() => setIsFlipped(!isFlipped)}
          front={
            <div className="relative h-full w-full bg-white p-1.5 md:p-2.5 rounded-2xl border border-white">
              <div className="w-full h-full overflow-hidden rounded-xl relative bg-stone-100">
                <Image
                  src={getOptimizedImageUrl(frontImage, { width: 1200 })}
                  alt="Recto carte postale"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Bouton retourner */}
                <div className="absolute top-4 right-4 z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsFlipped(true)
                    }}
                    className="bg-black/60 hover:bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-white/20 transition-all active:scale-95 group/btn shadow-xl"
                  >
                    <RotateCw
                      size={14}
                      className="group-hover/btn:rotate-180 transition-transform duration-500"
                    />
                    <span>Retourner la photo</span>
                  </button>
                </div>

                {/* Caption / emoji */}
                {frontCaption?.trim() && frontCaptionPosition != null && (
                  <div
                    className="absolute z-10 pointer-events-none w-fit max-w-[calc(100%-2rem)] px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-white/40 shadow-lg"
                    style={{
                      left: `${frontCaptionPosition.x}%`,
                      top: `${frontCaptionPosition.y}%`,
                      transform: 'translate(-50%, -50%)',
                      backgroundColor: captionBgColor,
                      ...(postcard.frontCaptionWidth != null && {
                        width: `${postcard.frontCaptionWidth}%`,
                      }),
                    }}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      {frontEmoji && (
                        <span className="text-lg sm:text-xl leading-none shrink-0">
                          {frontEmoji}
                        </span>
                      )}
                      <p
                        className="m-0 font-bold leading-tight tracking-tight break-words text-[10px] sm:text-xs line-clamp-2"
                        style={{
                          fontFamily: captionStyle.fontFamily,
                          fontSize: captionStyle.fontSize,
                          color: captionStyle.color,
                          textShadow:
                            captionStyle.color === '#ffffff' || captionStyle.color === '#000000'
                              ? '0 1px 2px rgba(0,0,0,0.2)'
                              : '0 1px 2px rgba(255,255,255,0.8)',
                          ...captionExtraStyle,
                        }}
                      >
                        {frontCaption}
                      </p>
                    </div>
                  </div>
                )}

                {/* Localisation */}
                {location && !isCoordinate(location) && (
                  <div className="absolute left-4 sm:left-6 bottom-4 sm:bottom-6 z-10 bg-white/90 backdrop-blur-md text-teal-900 px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-semibold shadow-lg flex items-center gap-1.5 pointer-events-none">
                    <MapPin size={12} className="text-orange-500 shrink-0" />
                    <span className="normal-case tracking-wide break-words max-w-[160px] sm:max-w-[220px]">
                      {location}
                    </span>
                  </div>
                )}

                {/* Loupe */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsFrontImageZoomOpen(true)
                  }}
                  className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/70 backdrop-blur-sm hover:bg-white/90 shadow-md border border-stone-200/50 text-stone-600 hover:text-stone-900 transition-all focus:outline-none"
                  aria-label="Voir l'image en grand"
                >
                  <Search size={16} strokeWidth={2} className="sm:w-[18px] sm:h-[18px]" />
                </button>
              </div>
            </div>
          }
          back={
            <div className="relative h-full w-full bg-[#fdfaf3] p-5 md:p-10 rounded-2xl border border-stone-200/50 flex flex-col overflow-hidden">
              <div className="flex flex-1 gap-4 md:gap-10 min-h-0">
                {/* Colonne gauche : message */}
                <div className="flex-1 flex flex-col pt-1 overflow-hidden min-h-0">
                  {/* Barre de contrôles */}
                  <div className="flex items-center shrink-0 mb-0.5 min-w-0 max-w-full">
                    <div className="flex items-center gap-0 h-8 bg-white/90 sm:bg-white rounded-md sm:rounded-lg border border-stone-200/40 sm:border-stone-200/60 shadow-sm min-w-0 overflow-visible">
                      {/* Taille */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setBackTextScale((s) => Math.max(0.6, Number((s - 0.08).toFixed(2))))
                        }}
                        className="h-8 w-8 min-h-0 flex items-center justify-center rounded-md text-stone-500 hover:text-stone-700 hover:bg-stone-100/80 active:bg-stone-100 transition-colors shrink-0 border-0"
                        title="Réduire la taille"
                      >
                        <Minus size={10} strokeWidth={2.5} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setBackTextScale((s) => Math.min(1.5, Number((s + 0.08).toFixed(2))))
                        }}
                        className="h-8 w-8 min-h-0 flex items-center justify-center rounded-md text-stone-500 hover:text-stone-700 hover:bg-stone-100/80 active:bg-stone-100 transition-colors shrink-0 border-0"
                        title="Agrandir la taille"
                      >
                        <Plus size={10} strokeWidth={2.5} />
                      </button>

                      {/* Police */}
                      <div
                        className="relative flex items-center shrink-0 h-8 w-8 sm:w-9"
                        ref={fontMenuAnchorRef}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setIsFontMenuOpen((o) => !o)
                          }}
                          className={cn(
                            'h-8 min-h-0 w-full flex items-center justify-center px-1 rounded-md border-0 transition-all shrink-0',
                            isFontMenuOpen
                              ? 'bg-teal-50 text-teal-700'
                              : 'bg-white hover:bg-stone-50 text-stone-600',
                          )}
                        >
                          <span
                            className="text-[7px] sm:text-[8px] font-bold select-none uppercase tracking-tighter leading-none"
                            style={{
                              fontFamily: BACK_MESSAGE_FONTS.find((f) => f.id === backMessageFont)
                                ?.fontFamily,
                            }}
                          >
                            Aa
                          </span>
                          <ChevronDown size={8} className="ml-0.5 opacity-50 shrink-0" />
                        </button>
                      </div>

                      {/* Retourner */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsFlipped(false)
                        }}
                        className="h-8 w-8 flex items-center justify-center rounded-md bg-white hover:bg-stone-50 text-stone-600 border-0 transition-all active:scale-95 shrink-0 group/btn"
                        title="Retourner la carte"
                      >
                        <RotateCw
                          size={12}
                          className="group-hover/btn:rotate-180 transition-transform duration-500 shrink-0"
                        />
                      </button>
                    </div>
                  </div>

                  {/* Dropdown polices via portal */}
                  {portalRoot &&
                    fontMenuRect != null &&
                    createPortal(
                      <AnimatePresence>
                        {isFontMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.15 }}
                            className="fixed w-28 bg-white rounded-lg shadow-xl border border-stone-200 overflow-hidden z-[9998] py-0.5"
                            style={{
                              top: fontMenuRect.bottom + 4,
                              left: fontMenuRect.left,
                            }}
                            data-font-dropdown-flip
                          >
                            {BACK_MESSAGE_FONTS.map((font) => (
                              <button
                                key={font.id}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setBackMessageFont(font.id)
                                  setIsFontMenuOpen(false)
                                }}
                                className={cn(
                                  'w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-left text-[9px] transition-colors',
                                  backMessageFont === font.id
                                    ? 'bg-teal-50 text-teal-700'
                                    : 'hover:bg-stone-50 text-stone-600',
                                )}
                              >
                                <span
                                  className="font-bold w-3.5 text-center"
                                  style={{ fontFamily: font.fontFamily }}
                                >
                                  Aa
                                </span>
                                <span className="truncate">{font.name}</span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>,
                      portalRoot,
                    )}

                  {/* Zone texte */}
                  <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-1">
                    <p
                      className="font-handwriting text-stone-700 leading-relaxed italic whitespace-pre-wrap break-words max-w-full"
                      style={{
                        fontSize: `clamp(0.8125rem, ${1.15 * backTextScale}rem, 1.75rem)`,
                        fontFamily:
                          BACK_MESSAGE_FONTS.find((f) => f.id === backMessageFont)?.fontFamily ??
                          "'Dancing Script', cursive",
                      }}
                    >
                      {message}
                    </p>
                  </div>

                  {/* Signature */}
                  <div
                    className="mt-auto font-handwriting text-teal-700 pt-1 shrink-0"
                    style={{
                      fontSize: `clamp(1rem, ${1.5 * backTextScale}rem, 2rem)`,
                    }}
                  >
                    {senderName}
                  </div>
                </div>

                {/* Colonne droite : timbre + adresse + mini carte */}
                <div className="w-[40%] flex flex-col border-l border-stone-200/50 pl-3 md:pl-6 relative h-full">
                  {/* Timbre */}
                  <div className="self-end mb-2 group z-20">
                    <div className="relative w-10 h-14 md:w-16 md:h-20 bg-[#fdf5e6] p-0.5 md:p-1 border-[1px] border-orange-300/40 transform rotate-2 shadow-sm">
                      <div className="w-full h-full border border-orange-200/50 flex flex-col items-center justify-between p-0.5 bg-white/40">
                        <span className="text-[4px] md:text-[6px] font-bold text-orange-900/60 uppercase text-center leading-tight">
                          Digital Poste
                        </span>
                        <div className="flex-1 flex items-center justify-center opacity-40">
                          <Compass size={12} className="text-orange-900 md:w-4 md:h-4" />
                        </div>
                        <span className="text-[4px] md:text-[6px] font-bold text-orange-900/40">
                          2026
                        </span>
                      </div>
                      <div
                        className="absolute inset-0 border-[2px] border-[#fdfaf3] opacity-30 pointer-events-none"
                        style={{
                          mask: 'conic-gradient(from 45deg, transparent 0deg 90deg, black 90deg 360deg) 0 0/4px 4px round',
                        }}
                      />
                    </div>
                  </div>

                  {/* Tampon postal */}
                  <div className="absolute top-2 right-12 md:top-4 md:right-24 opacity-60 pointer-events-none transform -rotate-12 z-10">
                    <div className="relative">
                      <svg
                        width="70"
                        height="70"
                        viewBox="0 0 140 140"
                        className="text-stone-800/20 fill-current overflow-visible md:w-[100px] md:h-[100px]"
                      >
                        <circle
                          cx="70"
                          cy="70"
                          r="55"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeDasharray="2 3"
                        />
                        <circle
                          cx="70"
                          cy="70"
                          r="50"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                        <span className="text-[5px] md:text-[7px] font-black tracking-widest text-stone-600 uppercase mb-0.5">
                          POSTAL
                        </span>
                        <div className="h-px w-5 md:w-6 bg-stone-300 my-0.5" />
                        <span className="text-[4px] md:text-[6px] font-black text-teal-700 uppercase leading-none mb-0.5 max-w-[50px] md:max-w-[60px] truncate">
                          {location || 'DESTINATION'}
                        </span>
                        <span className="text-[4px] md:text-[5px] font-serif text-stone-500 italic block">
                          {date || 'FÉVR. 2026'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Lignes adresse */}
                  <div className="flex-initial flex flex-col justify-center gap-1.5 md:gap-2 py-1.5 md:py-2 max-h-[30%] md:max-h-[none] md:shrink-0">
                    <div className="border-b border-stone-200/60 pb-0.5 min-h-[1.25em]">
                      <span className="font-handwriting text-teal-800/80 text-[10px] sm:text-xs md:text-base leading-tight block truncate">
                        À : {postcard.recipientName || 'Family & Friends'}
                      </span>
                    </div>
                    <div className="border-b border-stone-200/60 pb-0.5 min-h-[1.25em]">
                      <span className="font-handwriting text-stone-500/60 text-[8px] md:text-sm leading-tight italic block truncate">
                        {location || 'Quelque part dans le monde'}
                      </span>
                    </div>
                    <div className="border-b border-stone-200/60 pb-0.5 min-h-[1.25em]">
                      <span className="font-handwriting text-stone-400/40 text-[8px] md:text-sm leading-tight italic block">
                        &nbsp;
                      </span>
                    </div>
                  </div>

                  {/* Mini carte */}
                  <div className="flex-1 min-h-0 mt-1 md:mt-2 mb-0.5 md:mb-1 flex flex-col">
                    <div className="relative w-full flex-1 min-h-[100px] md:min-h-[160px] aspect-[3/2] sm:aspect-[2/1] rounded-lg overflow-hidden border border-stone-200/60 shadow-md bg-stone-100">
                      {coords ? (
                        <div className="absolute inset-0 w-full h-full rounded-lg overflow-hidden">
                          <MiniMap
                            coords={coords}
                            zoom={10}
                            interactive={false}
                            showScale={false}
                            className="w-full h-full rounded-lg"
                          />
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-stone-100 text-stone-400 text-[10px] font-bold uppercase tracking-widest">
                          Pas de localisation
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        />

        {/* Ombre physique */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[95%] h-16 bg-black/10 blur-[60px] rounded-full -z-10" />
      </section>

      {/* Lightbox image en grand */}
      {portalRoot &&
        createPortal(
          <AnimatePresence>
            {isFrontImageZoomOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[999] bg-black/95 flex items-center justify-center overflow-auto"
                onClick={() => setIsFrontImageZoomOpen(false)}
                style={{
                  padding:
                    'max(1rem, env(safe-area-inset-top)) max(1rem, env(safe-area-inset-right)) max(1rem, env(safe-area-inset-bottom)) max(1rem, env(safe-area-inset-left))',
                }}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsFrontImageZoomOpen(false)
                  }}
                  className="fixed z-10 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/95 shadow-xl text-stone-700 hover:bg-white transition-all focus:outline-none"
                  style={{
                    top: 'max(1rem, env(safe-area-inset-top))',
                    right: 'max(1rem, env(safe-area-inset-right))',
                  }}
                  aria-label="Fermer"
                >
                  <X size={24} className="sm:w-7 sm:h-7" strokeWidth={2.5} />
                </button>
                <div
                  className="relative shrink-0 max-w-[min(90vw,1200px)] max-h-[85vh] w-full aspect-[4/3] overflow-hidden rounded-lg shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={getOptimizedImageUrl(frontImage, { width: 1600 })}
                    alt="Face avant de la carte postale"
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          portalRoot,
        )}
    </div>
  )
}
