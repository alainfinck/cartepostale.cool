'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface ScratchCardProps {
  coverImage?: string
  senderName?: string
  onRevealed?: () => void
  children: React.ReactNode
}

const SCRATCH_THRESHOLD = 55
const BRUSH_RADIUS = 30

export default function ScratchCard({
  coverImage,
  senderName,
  onRevealed,
  children,
}: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isRevealed, setIsRevealed] = useState(false)
  const [percentage, setPercentage] = useState(0)
  const [isScratching, setIsScratching] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const isDrawingRef = useRef(false)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)
  const coverLoadedRef = useRef(false)

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const rect = container.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.scale(dpr, dpr)

    if (coverImage) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height)
        coverLoadedRef.current = true
      }
      img.onerror = () => {
        drawDefaultCover(ctx, rect.width, rect.height)
        coverLoadedRef.current = true
      }
      img.src = coverImage
    } else {
      drawDefaultCover(ctx, rect.width, rect.height)
      coverLoadedRef.current = true
    }
  }, [coverImage])

  useEffect(() => {
    if (isRevealed) return
    initCanvas()

    const handleResize = () => {
      if (!isRevealed && !hasStarted) {
        initCanvas()
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [initCanvas, isRevealed, hasStarted])

  const drawDefaultCover = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ) => {
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#d4a574')
    gradient.addColorStop(0.3, '#c9956a')
    gradient.addColorStop(0.5, '#b8845e')
    gradient.addColorStop(0.7, '#c9956a')
    gradient.addColorStop(1, '#d4a574')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    ctx.globalAlpha = 0.08
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      const r = Math.random() * 2
      ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#000000'
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
    ctx.lineWidth = 1
    const spacing = 20
    for (let x = -height; x < width + height; x += spacing) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x + height, height)
      ctx.stroke()
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.font = `bold ${Math.min(width * 0.06, 28)}px system-ui, -apple-system, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
    ctx.shadowBlur = 8
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2

    ctx.fillText('Grattez pour d\u00e9couvrir !', width / 2, height / 2 - 14)

    ctx.font = `${Math.min(width * 0.035, 16)}px system-ui, -apple-system, sans-serif`
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.shadowBlur = 4
    ctx.fillText(
      senderName ? `Un message de ${senderName}` : 'Un message vous attend',
      width / 2,
      height / 2 + 20,
    )

    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

    const starSize = Math.min(width * 0.04, 18)
    drawStar(ctx, width * 0.15, height * 0.2, starSize, 'rgba(255, 255, 255, 0.3)')
    drawStar(ctx, width * 0.85, height * 0.25, starSize * 0.7, 'rgba(255, 255, 255, 0.2)')
    drawStar(ctx, width * 0.2, height * 0.8, starSize * 0.8, 'rgba(255, 255, 255, 0.25)')
    drawStar(ctx, width * 0.8, height * 0.75, starSize * 0.6, 'rgba(255, 255, 255, 0.2)')
    drawStar(ctx, width * 0.5, height * 0.15, starSize * 0.5, 'rgba(255, 255, 255, 0.15)')
  }

  const drawStar = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    size: number,
    color: string,
  ) => {
    ctx.fillStyle = color
    ctx.beginPath()
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2
      const method = i === 0 ? 'moveTo' : 'lineTo'
      ctx[method](cx + size * Math.cos(angle), cy + size * Math.sin(angle))
    }
    ctx.closePath()
    ctx.fill()
  }

  const getEventPos = (
    e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent,
  ): { x: number; y: number } | null => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()

    if ('touches' in e) {
      if (e.touches.length === 0) return null
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      }
    }
    return {
      x: (e as MouseEvent).clientX - rect.left,
      y: (e as MouseEvent).clientY - rect.top,
    }
  }

  const scratch = useCallback(
    (x: number, y: number) => {
      const canvas = canvasRef.current
      if (!canvas || isRevealed) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.globalCompositeOperation = 'destination-out'

      const last = lastPointRef.current
      if (last) {
        const dist = Math.sqrt((x - last.x) ** 2 + (y - last.y) ** 2)
        const steps = Math.max(1, Math.floor(dist / 4))
        for (let i = 0; i <= steps; i++) {
          const t = i / steps
          const ix = last.x + (x - last.x) * t
          const iy = last.y + (y - last.y) * t

          ctx.beginPath()
          ctx.arc(ix, iy, BRUSH_RADIUS, 0, Math.PI * 2)
          ctx.fill()
        }
      } else {
        ctx.beginPath()
        ctx.arc(x, y, BRUSH_RADIUS, 0, Math.PI * 2)
        ctx.fill()
      }

      lastPointRef.current = { x, y }
      ctx.globalCompositeOperation = 'source-over'
    },
    [isRevealed],
  )

  const calculateScratchPercentage = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return 0

    const ctx = canvas.getContext('2d')
    if (!ctx) return 0

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const pixels = imageData.data
    let transparent = 0
    const total = pixels.length / 4

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 128) transparent++
    }

    return (transparent / total) * 100
  }, [])

  const checkReveal = useCallback(() => {
    const pct = calculateScratchPercentage()
    setPercentage(Math.round(pct))
    if (pct >= SCRATCH_THRESHOLD && !isRevealed) {
      setIsRevealed(true)
      onRevealed?.()
    }
  }, [calculateScratchPercentage, isRevealed, onRevealed])

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isRevealed) return
    e.preventDefault()
    isDrawingRef.current = true
    lastPointRef.current = null
    setIsScratching(true)
    setHasStarted(true)
    const pos = getEventPos(e)
    if (pos) scratch(pos.x, pos.y)
  }

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingRef.current || isRevealed) return
    e.preventDefault()
    const pos = getEventPos(e)
    if (pos) scratch(pos.x, pos.y)
  }

  const handleEnd = () => {
    if (!isDrawingRef.current) return
    isDrawingRef.current = false
    lastPointRef.current = null
    setIsScratching(false)
    checkReveal()
  }

  useEffect(() => {
    if (isRevealed) {
      document.body.style.overflow = ''
    }
  }, [isRevealed])

  return (
    <div className="relative w-full" ref={containerRef}>
      {children}

      <AnimatePresence>
        {!isRevealed && (
          <motion.div
            key="scratch-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.6, ease: 'easeOut' } }}
            className="absolute inset-0 z-40"
          >
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-none"
              onMouseDown={handleStart}
              onMouseMove={handleMove}
              onMouseUp={handleEnd}
              onMouseLeave={handleEnd}
              onTouchStart={handleStart}
              onTouchMove={handleMove}
              onTouchEnd={handleEnd}
              onTouchCancel={handleEnd}
            />

            {!hasStarted && (
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-50"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <motion.div
                  className="bg-white/20 backdrop-blur-sm rounded-full p-4 mb-3"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 48 48"
                    fill="none"
                    className="text-white drop-shadow-lg"
                  >
                    <path
                      d="M24 4C12.954 4 4 12.954 4 24s8.954 20 20 20 20-8.954 20-20S35.046 4 24 4z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      fill="none"
                    />
                    <path
                      d="M16 20c0-4.418 3.582-8 8-8"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <circle cx="24" cy="24" r="3" fill="currentColor" />
                    <path
                      d="M28 32l4-4-4-4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.div>
              </motion.div>
            )}

            {hasStarted && percentage > 0 && percentage < SCRATCH_THRESHOLD && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-500" />
                  <span className="text-sm font-bold text-stone-700">
                    {percentage}% gratt\u00e9
                  </span>
                  <div className="w-20 h-2 bg-stone-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(percentage / SCRATCH_THRESHOLD) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isRevealed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-full px-4 py-2 shadow-lg">
              <Sparkles size={16} className="text-amber-500" />
              <span className="text-sm font-bold text-amber-700">
                R\u00e9v\u00e9l\u00e9 !
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
