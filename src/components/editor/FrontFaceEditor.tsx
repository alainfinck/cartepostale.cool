'use client'

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { getOptimizedImageUrl } from '@/lib/image-processing'
import { captionPresetHidesBg } from '@/lib/caption-style'
import {
  FrontCaptionPosition,
  FrontImageCrop,
  FrontImageFilter,
  StickerPlacement,
  EmojiSticker,
} from '@/types'
import { motion } from 'framer-motion'
import { MapPin, Move, RotateCcw, Maximize2, GripVertical } from 'lucide-react'
import { isCoordinate } from '@/lib/utils'

interface FrontFaceEditorProps {
  frontImage: string
  frontImageCrop?: FrontImageCrop
  frontImageFilter?: FrontImageFilter
  frontCaption?: string
  frontEmoji?: string
  frontCaptionPosition: FrontCaptionPosition
  frontTextBgOpacity: number
  frontCaptionPreset?: string
  frontCaptionWidth?: number
  location?: string
  stickers?: StickerPlacement[]
  emojiStickers?: EmojiSticker[]
  onCaptionPositionChange: (pos: FrontCaptionPosition) => void
  onCaptionStyleChange?: (style: CaptionStyle) => void
  onEmojiStickerChange?: (stickers: EmojiSticker[]) => void
  className?: string
}

export interface CaptionStyle {
  fontSize: number
  rotation: number
}

const DEFAULT_CAPTION_POSITION: FrontCaptionPosition = { x: 50, y: 85 }
const DEFAULT_FRONT_FILTER: FrontImageFilter = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  sepia: 0,
  grayscale: 0,
}

const FALLBACK_FRONT_IMAGE =
  'https://img.cartepostale.cool/demo/photo-1507525428034-b723cf961d3e.jpg'

const buildFrontImageFilterCss = (filter?: FrontImageFilter): string => {
  const f = filter ?? DEFAULT_FRONT_FILTER
  return [
    `brightness(${f.brightness}%)`,
    `contrast(${f.contrast}%)`,
    `saturate(${f.saturation}%)`,
    `sepia(${f.sepia}%)`,
    `grayscale(${f.grayscale}%)`,
  ].join(' ')
}

const POSTCARD_ASPECT = 4 / 3

// Composant interne pour un emoji sticker interactif (drag + pinch zoom)
function EmojiStickerEl({
  sticker,
  containerRef,
  onUpdate,
  onRemove,
}: {
  sticker: EmojiSticker
  containerRef: React.RefObject<HTMLDivElement | null>
  onUpdate: (s: EmojiSticker) => void
  onRemove: (id: string) => void
}) {
  const posRef = useRef({ x: sticker.x, y: sticker.y })
  const scaleRef = useRef(sticker.scale)
  const [localX, setLocalX] = useState(sticker.x)
  const [localY, setLocalY] = useState(sticker.y)
  const [localScale, setLocalScale] = useState(sticker.scale)
  const draggingRef = useRef(false)
  const touchRef = useRef<{ dist: number; scale: number } | null>(null)

  // Sync depuis les props quand on ne drag pas
  useEffect(() => {
    if (!draggingRef.current) {
      posRef.current = { x: sticker.x, y: sticker.y }
      scaleRef.current = sticker.scale
      setLocalX(sticker.x)
      setLocalY(sticker.y)
      setLocalScale(sticker.scale)
    }
  }, [sticker.x, sticker.y, sticker.scale])

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button === 2) return // clic droit → ignorer
    e.stopPropagation()
    e.preventDefault()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    draggingRef.current = true
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return
    e.stopPropagation()
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const x = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100))
    const y = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100))
    posRef.current = { x, y }
    setLocalX(x)
    setLocalY(y)
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!draggingRef.current) return
    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    draggingRef.current = false
    onUpdate({ ...sticker, x: posRef.current.x, y: posRef.current.y, scale: scaleRef.current })
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const factor = e.deltaY > 0 ? 0.9 : 1.1
    const newScale = Math.max(0.3, Math.min(5, scaleRef.current * factor))
    scaleRef.current = newScale
    setLocalScale(newScale)
    onUpdate({ ...sticker, x: posRef.current.x, y: posRef.current.y, scale: newScale })
  }

  const getTouchDist = (t: React.TouchList) => {
    if (t.length < 2) return 0
    const dx = t[0].clientX - t[1].clientX
    const dy = t[0].clientY - t[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      touchRef.current = { dist: getTouchDist(e.touches), scale: scaleRef.current }
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchRef.current || e.touches.length < 2) return
    e.preventDefault()
    const factor = getTouchDist(e.touches) / touchRef.current.dist
    const newScale = Math.max(0.3, Math.min(5, touchRef.current.scale * factor))
    scaleRef.current = newScale
    setLocalScale(newScale)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchRef.current) {
      touchRef.current = null
      onUpdate({ ...sticker, x: posRef.current.x, y: posRef.current.y, scale: scaleRef.current })
    }
  }

  return (
    <motion.div
      className="absolute touch-none select-none group/es"
      initial={{ opacity: 0, scale: 0, x: '-50%', y: '-50%' }}
      animate={{ opacity: 1, scale: localScale, x: '-50%', y: '-50%' }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
      }}
      style={{
        left: `${localX}%`,
        top: `${localY}%`,
        fontSize: '48px',
        lineHeight: 1,
        zIndex: 25,
        cursor: draggingRef.current ? 'grabbing' : 'grab',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <span style={{ userSelect: 'none', pointerEvents: 'none' }}>{sticker.emoji}</span>
      {/* Bouton supprimer au survol */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onRemove(sticker.id)
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute -top-2 -right-2 hidden group-hover/es:flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold shadow-lg"
        style={{ fontSize: '10px', lineHeight: 1 }}
      >
        ×
      </button>
    </motion.div>
  )
}

export default function FrontFaceEditor({
  frontImage,
  frontImageCrop,
  frontImageFilter,
  frontCaption,
  frontEmoji,
  frontCaptionPosition,
  frontTextBgOpacity,
  frontCaptionPreset,
  frontCaptionWidth,
  location,
  stickers,
  emojiStickers,
  onCaptionPositionChange,
  onCaptionStyleChange,
  onEmojiStickerChange,
  className,
}: FrontFaceEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const captionRef = useRef<HTMLDivElement>(null)

  const [imgNaturalSize, setImgNaturalSize] = useState<{ w: number; h: number } | null>(null)
  const [isImageLoading, setIsImageLoading] = useState(true)

  const [isDragging, setIsDragging] = useState(false)
  const [localPosition, setLocalPosition] = useState<FrontCaptionPosition>(frontCaptionPosition)

  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>({ fontSize: 100, rotation: 0 })
  const [isResizing, setIsResizing] = useState(false)

  const dragStateRef = useRef<{
    startX: number
    startY: number
    startPosX: number
    startPosY: number
    rafId: number | null
    lastUpdate: number
  } | null>(null)

  const touchStateRef = useRef<{
    initialDistance: number
    initialScale: number
    initialAngle: number
    initialRotation: number
  } | null>(null)

  useEffect(() => {
    if (!isDragging) {
      setLocalPosition(frontCaptionPosition)
    }
  }, [frontCaptionPosition, isDragging])

  const frontImageSrc = frontImage || FALLBACK_FRONT_IMAGE
  const frontImageFilterCss = useMemo(
    () => buildFrontImageFilterCss(frontImageFilter),
    [frontImageFilter],
  )
  const clampedOpacity = Math.max(0, Math.min(100, frontTextBgOpacity))
  const frontTextBgColor = `rgba(255, 255, 255, ${clampedOpacity / 100})`
  const captionHidesBg = captionPresetHidesBg(frontCaptionPreset)
  const captionBgColor = captionHidesBg ? 'transparent' : frontTextBgColor

  const showCaption = Boolean(frontCaption?.trim())
  const showCaptionWithEmoji = showCaption && Boolean(frontEmoji)
  const showCaptionOnly = showCaption && !frontEmoji

  const updatePosition = useCallback((clientX: number, clientY: number) => {
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const xPct = ((clientX - rect.left) / rect.width) * 100
    const yPct = ((clientY - rect.top) / rect.height) * 100

    const x = Math.max(10, Math.min(90, xPct))
    const y = Math.max(10, Math.min(90, yPct))

    setLocalPosition({ x, y })
  }, [])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!showCaption) return

      e.stopPropagation()
      e.preventDefault()

      const target = e.currentTarget as HTMLElement
      target.setPointerCapture(e.pointerId)

      setIsDragging(true)

      dragStateRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startPosX: localPosition.x,
        startPosY: localPosition.y,
        rafId: null,
        lastUpdate: performance.now(),
      }
    },
    [showCaption, localPosition],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || !dragStateRef.current) return

      e.stopPropagation()
      e.preventDefault()

      const now = performance.now()
      if (now - dragStateRef.current.lastUpdate < 16) return
      dragStateRef.current.lastUpdate = now

      if (dragStateRef.current.rafId !== null) {
        cancelAnimationFrame(dragStateRef.current.rafId)
      }

      dragStateRef.current.rafId = requestAnimationFrame(() => {
        updatePosition(e.clientX, e.clientY)
      })
    },
    [isDragging, updatePosition],
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return

      e.stopPropagation()

      const target = e.currentTarget as HTMLElement
      target.releasePointerCapture(e.pointerId)

      if (dragStateRef.current?.rafId != null) {
        cancelAnimationFrame(dragStateRef.current.rafId)
      }

      setIsDragging(false)
      onCaptionPositionChange(localPosition)
      dragStateRef.current = null
    },
    [isDragging, localPosition, onCaptionPositionChange],
  )

  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const getTouchAngle = (touches: React.TouchList) => {
    if (touches.length < 2) return 0
    return (
      Math.atan2(touches[1].clientY - touches[0].clientY, touches[1].clientX - touches[0].clientX) *
      (180 / Math.PI)
    )
  }

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        setIsResizing(true)
        touchStateRef.current = {
          initialDistance: getTouchDistance(e.touches),
          initialScale: captionStyle.fontSize,
          initialAngle: getTouchAngle(e.touches),
          initialRotation: captionStyle.rotation,
        }
      }
    },
    [captionStyle],
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isResizing || !touchStateRef.current || e.touches.length < 2) return

      e.preventDefault()

      const currentDistance = getTouchDistance(e.touches)
      const currentAngle = getTouchAngle(e.touches)

      const scaleFactor = currentDistance / touchStateRef.current.initialDistance
      const newFontSize = Math.max(
        50,
        Math.min(200, touchStateRef.current.initialScale * scaleFactor),
      )

      const angleDiff = currentAngle - touchStateRef.current.initialAngle
      const newRotation = touchStateRef.current.initialRotation + angleDiff

      setCaptionStyle({
        fontSize: Math.round(newFontSize),
        rotation: Math.round(newRotation),
      })
    },
    [isResizing],
  )

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (isResizing) {
        setIsResizing(false)
        touchStateRef.current = null
        onCaptionStyleChange?.(captionStyle)
      }
    },
    [isResizing, captionStyle, onCaptionStyleChange],
  )

  const resetCaptionPosition = useCallback(() => {
    setLocalPosition(DEFAULT_CAPTION_POSITION)
    onCaptionPositionChange(DEFAULT_CAPTION_POSITION)
    setCaptionStyle({ fontSize: 100, rotation: 0 })
  }, [onCaptionPositionChange])

  const imageStyle = useMemo(() => {
    if (!frontImageCrop || !imgNaturalSize) return { filter: frontImageFilterCss }

    const imgAspect = imgNaturalSize.w / imgNaturalSize.h
    let w: number, h: number

    if (imgAspect > POSTCARD_ASPECT) {
      h = 100 * frontImageCrop.scale
      w = (h * imgAspect) / POSTCARD_ASPECT
    } else {
      w = 100 * frontImageCrop.scale
      h = (w / imgAspect) * POSTCARD_ASPECT
    }

    const left = 50 - (frontImageCrop.x / 100) * w
    const top = 50 - (frontImageCrop.y / 100) * h

    return {
      position: 'absolute' as const,
      width: `${w}%`,
      height: `${h}%`,
      left: `${left}%`,
      top: `${top}%`,
      filter: frontImageFilterCss,
    }
  }, [frontImageCrop, imgNaturalSize, frontImageFilterCss])

  const captionTransform = useMemo(() => {
    const baseTransform = 'translate(-50%, -50%)'
    if (captionStyle.rotation !== 0) {
      return `${baseTransform} rotate(${captionStyle.rotation}deg)`
    }
    return baseTransform
  }, [captionStyle.rotation])

  const captionFontScale = captionStyle.fontSize / 100

  return (
    <div className={cn('relative w-full', className)}>
      <div
        ref={containerRef}
        className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-2xl border border-stone-200 bg-white"
      >
        <div className="absolute inset-0 z-0">
          {frontImageCrop && imgNaturalSize ? (
            <div className="absolute pointer-events-none" style={imageStyle}>
              <img
                src={getOptimizedImageUrl(frontImageSrc, { width: 1600 })}
                alt="Photo de la carte"
                className={cn(
                  'block w-full h-full object-cover transition-opacity duration-500',
                  isImageLoading ? 'opacity-0' : 'opacity-100',
                )}
                onLoad={(e) => {
                  setImgNaturalSize({
                    w: e.currentTarget.naturalWidth,
                    h: e.currentTarget.naturalHeight,
                  })
                  setIsImageLoading(false)
                }}
                draggable={false}
              />
            </div>
          ) : (
            <img
              src={getOptimizedImageUrl(frontImageSrc, { width: 1600 })}
              alt="Photo de la carte"
              className={cn(
                'w-full h-full object-cover pointer-events-none transition-opacity duration-500',
                isImageLoading ? 'opacity-0' : 'opacity-100',
              )}
              style={{ filter: frontImageFilterCss }}
              onLoad={(e) => {
                setImgNaturalSize({
                  w: e.currentTarget.naturalWidth,
                  h: e.currentTarget.naturalHeight,
                })
                setIsImageLoading(false)
              }}
              draggable={false}
            />
          )}
        </div>

        {stickers && stickers.length > 0 && (
          <div className="absolute inset-0 pointer-events-none z-10">
            {stickers.map((sticker) => (
              <div
                key={sticker.id}
                className="absolute"
                style={{
                  left: `${sticker.x}%`,
                  top: `${sticker.y}%`,
                  transform: `translate(-50%, -50%) scale(${sticker.scale}) rotate(${sticker.rotation}deg)`,
                  width: '80px',
                  height: '80px',
                }}
              >
                <img
                  src={getOptimizedImageUrl(sticker.imageUrl || '', { width: 200 })}
                  alt="Sticker"
                  className="w-full h-full object-contain"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        )}

        {/* Emoji stickers interactifs */}
        {emojiStickers && emojiStickers.length > 0 && onEmojiStickerChange && (
          <div className="absolute inset-0 z-20">
            {emojiStickers.map((es) => (
              <EmojiStickerEl
                key={es.id}
                sticker={es}
                containerRef={containerRef}
                onUpdate={(updated) =>
                  onEmojiStickerChange(
                    emojiStickers.map((s) => (s.id === updated.id ? updated : s)),
                  )
                }
                onRemove={(id) => onEmojiStickerChange(emojiStickers.filter((s) => s.id !== id))}
              />
            ))}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none z-5" />

        {location && !isCoordinate(location) && (
          <div className="absolute left-4 sm:left-6 bottom-4 sm:bottom-6 z-10 bg-white/90 backdrop-blur-md text-teal-900 px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-semibold shadow-lg flex items-center gap-1.5 pointer-events-none">
            <MapPin size={12} className="text-orange-500 shrink-0" />
            <span className="normal-case tracking-wide break-words max-w-[160px] sm:max-w-[220px]">
              {location}
            </span>
          </div>
        )}

        {showCaptionOnly && (
          <div
            ref={captionRef}
            className={cn(
              'absolute z-20 w-fit max-w-[calc(100%-2rem)] sm:max-w-[calc(100%-3rem)] px-3 py-2 sm:px-4 sm:py-2.5',
              'rounded-md transition-shadow duration-200',
              !captionHidesBg && 'border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)]',
              isDragging
                ? 'cursor-grabbing shadow-[0_12px_40px_rgb(0,0,0,0.2)] ring-2 ring-teal-400/50'
                : cn(
                    'cursor-grab',
                    !captionHidesBg && 'hover:shadow-[0_10px_35px_rgb(0,0,0,0.15)]',
                  ),
              'touch-none select-none',
            )}
            style={{
              left: `${localPosition.x}%`,
              top: `${localPosition.y}%`,
              transform: captionTransform,
              backgroundColor: captionBgColor,
              willChange: isDragging ? 'transform, left, top' : 'auto',
              ...(frontCaptionWidth != null && { width: `${frontCaptionWidth}%` }),
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="absolute -top-1.5 -right-1.5 opacity-0 group-hover:opacity-100 pointer-events-none">
              <div className="bg-teal-500 text-white rounded-full p-0.5">
                <Move size={10} />
              </div>
            </div>
            <p
              className="m-0 font-bold leading-tight tracking-tight text-stone-900 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)] break-words"
              style={{ fontSize: `${1 * captionFontScale}rem` }}
            >
              {frontCaption}
            </p>
            {isDragging && (
              <div className="absolute inset-0 border-2 border-dashed border-teal-400 rounded-md pointer-events-none" />
            )}
          </div>
        )}

        {showCaptionWithEmoji && (
          <div
            ref={captionRef}
            className={cn(
              'absolute z-20 flex items-center gap-3 rounded-2xl sm:rounded-3xl',
              'px-5 py-3.5 sm:px-6 sm:py-4 w-fit max-w-[calc(100%-2rem)]',
              !captionHidesBg && 'border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)]',
              'transition-shadow duration-200',
              isDragging
                ? 'cursor-grabbing shadow-[0_12px_40px_rgb(0,0,0,0.2)] ring-2 ring-teal-400/50'
                : cn(
                    'cursor-grab',
                    !captionHidesBg && 'hover:shadow-[0_10px_35px_rgb(0,0,0,0.15)]',
                  ),
              'touch-none select-none group',
            )}
            style={{
              left: `${localPosition.x}%`,
              top: `${localPosition.y}%`,
              transform: captionTransform,
              backgroundColor: captionBgColor,
              willChange: isDragging ? 'transform, left, top' : 'auto',
              ...(frontCaptionWidth != null && { width: `${frontCaptionWidth}%` }),
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-teal-500 text-white rounded-full px-2 py-0.5 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider shadow-lg">
                <GripVertical size={10} />
                Déplacer
              </div>
            </div>
            <span
              className="leading-none shrink-0"
              style={{ fontSize: `${2.25 * captionFontScale}rem` }}
              aria-hidden
            >
              {frontEmoji}
            </span>
            <p
              className="m-0 font-bold leading-tight tracking-tight text-stone-900 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)] break-words line-clamp-2"
              style={{ fontSize: `${1.125 * captionFontScale}rem` }}
            >
              {frontCaption}
            </p>
            {isDragging && (
              <div className="absolute inset-0 border-2 border-dashed border-teal-400 rounded-2xl pointer-events-none" />
            )}
          </div>
        )}

        {isImageLoading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-stone-50">
            <div className="relative">
              <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin" />
            </div>
            <p className="mt-4 text-xs font-bold text-stone-400 uppercase tracking-widest animate-pulse">
              Chargement...
            </p>
          </div>
        )}
      </div>

      {showCaption && (
        <div className="mt-3 flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-3 text-xs text-stone-500">
            <span className="flex items-center gap-1.5">
              <Move size={14} className="text-teal-500" />
              <span className="hidden sm:inline">Glisser pour déplacer</span>
              <span className="sm:hidden">Déplacer</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-stone-100 rounded-lg px-2 py-1">
              <span className="text-[10px] font-medium text-stone-500 tabular-nums">
                X: {Math.round(localPosition.x)}%
              </span>
              <span className="text-stone-300">|</span>
              <span className="text-[10px] font-medium text-stone-500 tabular-nums">
                Y: {Math.round(localPosition.y)}%
              </span>
            </div>

            <button
              type="button"
              onClick={resetCaptionPosition}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-stone-500 hover:text-teal-600 bg-stone-100 hover:bg-teal-50 rounded-lg transition-colors"
              title="Réinitialiser la position"
            >
              <RotateCcw size={12} />
              <span className="hidden sm:inline">Réinitialiser</span>
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .group:hover .opacity-0 {
          opacity: 1;
        }
      `}</style>
    </div>
  )
}
