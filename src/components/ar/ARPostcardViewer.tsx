'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, RotateCw, ZoomIn, ZoomOut, Move, Smartphone, Camera, Maximize2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getOptimizedImageUrl } from '@/lib/image-processing'
import type { Postcard } from '@/types'

interface ARPostcardViewerProps {
  postcard: Postcard
  onClose: () => void
}

type ARStep = 'permission' | 'active'

interface TouchState {
  initialDistance: number | null
  initialAngle: number | null
  initialScale: number
  initialRotation: number
}

function getTouchDistance(t1: React.Touch | Touch, t2: React.Touch | Touch): number {
  return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
}

function getTouchAngle(t1: React.Touch | Touch, t2: React.Touch | Touch): number {
  return Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * (180 / Math.PI)
}

const ARPostcardViewer: React.FC<ARPostcardViewerProps> = ({ postcard, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [step, setStep] = useState<ARStep>('permission')
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isFlipped, setIsFlipped] = useState(false)
  const [showInstructions, setShowInstructions] = useState(true)

  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 })
  const [cardScale, setCardScale] = useState(0.7)
  const [cardRotation, setCardRotation] = useState(0)
  const [deviceTilt, setDeviceTilt] = useState({ x: 0, y: 0 })

  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const positionAtDragStart = useRef({ x: 0, y: 0 })
  const touchStateRef = useRef<TouchState>({
    initialDistance: null,
    initialAngle: null,
    initialScale: 0.7,
    initialRotation: 0,
  })

  const lastTapRef = useRef(0)
  const [showFlipHint, setShowFlipHint] = useState(true)
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setPortalRoot(document.body)
  }, [])

  useEffect(() => {
    if (showFlipHint && step === 'active') {
      const timer = setTimeout(() => setShowFlipHint(false), 6000)
      return () => clearTimeout(timer)
    }
  }, [showFlipHint, step])

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setStep('active')
      setCameraError(null)
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? "L'accès à la caméra a été refusé. Veuillez autoriser l'accès dans les paramètres de votre navigateur."
          : "Impossible d'accéder à la caméra. Vérifiez que votre appareil possède une caméra et que le site est servi en HTTPS."
      setCameraError(message)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => stopCamera()
  }, [stopCamera])

  useEffect(() => {
    if (step !== 'active') return

    let lastBeta = 0
    let lastGamma = 0

    const handleOrientation = (e: DeviceOrientationEvent) => {
      const beta = e.beta ?? 0
      const gamma = e.gamma ?? 0
      const smoothFactor = 0.15
      lastBeta = lastBeta + (beta - lastBeta) * smoothFactor
      lastGamma = lastGamma + (gamma - lastGamma) * smoothFactor
      setDeviceTilt({
        x: Math.max(-15, Math.min(15, lastGamma * 0.3)),
        y: Math.max(-15, Math.min(15, (lastBeta - 45) * 0.3)),
      })
    }

    if (typeof DeviceOrientationEvent !== 'undefined') {
      const doeAny = DeviceOrientationEvent as any
      if (typeof doeAny.requestPermission === 'function') {
        doeAny.requestPermission().then((response: string) => {
          if (response === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation)
          }
        }).catch(() => {})
      } else {
        window.addEventListener('deviceorientation', handleOrientation)
      }
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation)
    }
  }, [step])

  useEffect(() => {
    if (showInstructions && step === 'active') {
      const timer = setTimeout(() => setShowInstructions(false), 4000)
      return () => clearTimeout(timer)
    }
  }, [showInstructions, step])

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') return
    isDragging.current = true
    dragStart.current = { x: e.clientX, y: e.clientY }
    positionAtDragStart.current = { ...cardPosition }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || e.pointerType === 'touch') return
    setCardPosition({
      x: positionAtDragStart.current.x + (e.clientX - dragStart.current.x),
      y: positionAtDragStart.current.y + (e.clientY - dragStart.current.y),
    })
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') return
    isDragging.current = false
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDragging.current = true
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      positionAtDragStart.current = { ...cardPosition }
    } else if (e.touches.length === 2) {
      isDragging.current = false
      touchStateRef.current = {
        initialDistance: getTouchDistance(e.touches[0], e.touches[1]),
        initialAngle: getTouchAngle(e.touches[0], e.touches[1]),
        initialScale: cardScale,
        initialRotation: cardRotation,
      }
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    if (e.touches.length === 1 && isDragging.current) {
      setCardPosition({
        x: positionAtDragStart.current.x + (e.touches[0].clientX - dragStart.current.x),
        y: positionAtDragStart.current.y + (e.touches[0].clientY - dragStart.current.y),
      })
    } else if (e.touches.length === 2 && touchStateRef.current.initialDistance !== null) {
      const newDistance = getTouchDistance(e.touches[0], e.touches[1])
      const newAngle = getTouchAngle(e.touches[0], e.touches[1])
      const scaleRatio = newDistance / touchStateRef.current.initialDistance
      const newScale = Math.max(0.3, Math.min(2, touchStateRef.current.initialScale * scaleRatio))
      setCardScale(newScale)

      if (touchStateRef.current.initialAngle !== null) {
        const angleDiff = newAngle - touchStateRef.current.initialAngle
        setCardRotation(touchStateRef.current.initialRotation + angleDiff)
      }
    }
  }

  const handleTouchEnd = () => {
    isDragging.current = false
    touchStateRef.current = {
      initialDistance: null,
      initialAngle: null,
      initialScale: cardScale,
      initialRotation: cardRotation,
    }
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.05 : 0.05
    setCardScale((s) => Math.max(0.3, Math.min(2, s + delta)))
  }

  const resetTransform = () => {
    setCardPosition({ x: 0, y: 0 })
    setCardScale(0.7)
    setCardRotation(0)
  }

  const frontImage = postcard.frontImage || ''

  if (!portalRoot) return null

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] bg-black overflow-hidden"
        style={{ touchAction: 'none' }}
      >
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
          autoPlay
        />

        {step === 'active' && (
          <div
            className="absolute inset-0 z-10"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{
                  x: cardPosition.x,
                  y: cardPosition.y,
                  scale: cardScale,
                  rotateX: deviceTilt.y,
                  rotateY: isFlipped ? 180 + deviceTilt.x : deviceTilt.x,
                  rotateZ: cardRotation,
                }}
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  y: { type: 'spring', stiffness: 300, damping: 30 },
                  scale: { type: 'spring', stiffness: 300, damping: 30 },
                  rotateX: { type: 'spring', stiffness: 120, damping: 20 },
                  rotateY: { type: 'spring', stiffness: 80, damping: 26 },
                  rotateZ: { type: 'spring', stiffness: 200, damping: 25 },
                }}
                className="relative cursor-grab active:cursor-grabbing"
                style={{
                  perspective: 1200,
                  transformStyle: 'preserve-3d',
                  width: 'min(85vw, 500px)',
                  aspectRatio: '3/2',
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation()
                  setIsFlipped((f) => !f)
                  setShowFlipHint(false)
                }}
              >
                {/* Front face */}
                <div
                  className={cn(
                    'absolute inset-0 rounded-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] border-2 border-white/30 bg-white',
                    isFlipped ? 'pointer-events-none' : '',
                  )}
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'translateZ(2px)',
                  }}
                >
                  {frontImage && (
                    <img
                      src={getOptimizedImageUrl(frontImage, { width: 1200 })}
                      alt="Carte postale"
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                    />
                  )}

                  {postcard.stickers?.map((sticker) => (
                    <div
                      key={sticker.id}
                      className="absolute pointer-events-none"
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
                      />
                    </div>
                  ))}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

                  {postcard.frontCaption?.trim() && (
                    <div className="absolute bottom-4 left-4 right-4 z-10">
                      <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/50 shadow-lg w-fit max-w-full">
                        {postcard.frontEmoji && (
                          <span className="text-2xl leading-none shrink-0">{postcard.frontEmoji}</span>
                        )}
                        <p className="text-sm font-bold text-stone-900 leading-tight break-words">
                          {postcard.frontCaption}
                        </p>
                      </div>
                    </div>
                  )}

                  {postcard.location && (
                    <div className="absolute top-3 left-3 z-10">
                      <div className="bg-white/80 backdrop-blur-sm text-teal-900 px-2 py-1 rounded-md text-[10px] font-semibold shadow-lg flex items-center gap-1">
                        <svg className="w-3 h-3 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="max-w-[120px] truncate">{postcard.location}</span>
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20 pointer-events-none" />

                  {/* Flip hint on front face */}
                  <AnimatePresence>
                    {showFlipHint && !isFlipped && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute top-3 right-3 z-20 pointer-events-none"
                      >
                        <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/20 shadow-lg">
                          <RotateCw size={12} className="text-white" />
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                            Double-tap pour retourner
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Back face */}
                <div
                  className={cn(
                    'absolute inset-0 rounded-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] border-2 border-white/30 bg-[#fafaf9] p-4 sm:p-6 flex flex-col',
                    !isFlipped ? 'pointer-events-none' : '',
                  )}
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg) translateZ(2px)',
                  }}
                >
                  <div className="absolute top-0 left-[60%] bottom-0 w-px bg-stone-200/80" />

                  <div className="flex-1 flex">
                    <div className="flex-[1.5] pr-4 flex flex-col justify-center min-w-0">
                      <p className="font-handwriting text-stone-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words line-clamp-[8]">
                        {postcard.message}
                      </p>
                      {postcard.senderName && (
                        <p className="font-handwriting text-teal-700 text-base sm:text-lg mt-2 -rotate-2">
                          - {postcard.senderName}
                        </p>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col items-end gap-2 pl-2">
                      <div className="w-12 h-14 sm:w-16 sm:h-20 bg-[#fdf5e6] border border-orange-200/50 rounded-sm shadow-sm flex items-center justify-center">
                        <span className="text-[8px] sm:text-[10px] font-bold text-orange-900/60 uppercase">
                          {postcard.stampLabel || 'Poste'}
                        </span>
                      </div>
                      {postcard.recipientName && (
                        <div className="text-right mt-auto">
                          <p className="text-[8px] font-bold uppercase tracking-widest text-stone-400">
                            Destinataire
                          </p>
                          <p className="font-handwriting text-stone-700 text-xs sm:text-sm">
                            {postcard.recipientName}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="absolute bottom-2 left-4 flex items-center gap-1 opacity-60">
                    <span className="text-[7px] font-semibold text-stone-500 tracking-widest uppercase">
                      cartepostale.cool
                    </span>
                  </div>

                  <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10 pointer-events-none" />

                  {/* Flip hint on back face */}
                  <AnimatePresence>
                    {showFlipHint && isFlipped && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute top-3 right-3 z-20 pointer-events-none"
                      >
                        <div className="flex items-center gap-1.5 bg-stone-800/60 backdrop-blur-md rounded-full px-3 py-1.5 border border-stone-600/30 shadow-lg">
                          <RotateCw size={12} className="text-white" />
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                            Double-tap pour retourner
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Permission / Loading state */}
        {step === 'permission' && (
          <div className="absolute inset-0 z-20 bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-sm w-full text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-teal-500/20 flex items-center justify-center">
                <Camera size={40} className="text-teal-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Réalité Augmentée
              </h2>
              <p className="text-stone-400 mb-8 leading-relaxed">
                Visualisez votre carte postale dans votre environnement grâce à la caméra de votre appareil.
              </p>
              {cameraError ? (
                <div className="space-y-4">
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                    <p className="text-red-300 text-sm">{cameraError}</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={startCamera}
                    className="w-full py-4 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-teal-500/30 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <Camera size={20} />
                    Activer la caméra
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 text-stone-400 rounded-xl font-bold transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Instructions overlay */}
        <AnimatePresence>
          {showInstructions && step === 'active' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
              onClick={() => setShowInstructions(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-xs w-full border border-white/20 text-center"
              >
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                      <Move size={22} className="text-white" />
                    </div>
                    <span className="text-white/80 text-xs font-medium">Déplacer</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                      <ZoomIn size={22} className="text-white" />
                    </div>
                    <span className="text-white/80 text-xs font-medium">Pincer / Zoomer</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                      <RotateCw size={22} className="text-white" />
                    </div>
                    <span className="text-white/80 text-xs font-medium">Pivoter</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                      <Smartphone size={22} className="text-white" />
                    </div>
                    <span className="text-white/80 text-xs font-medium">Incliner</span>
                  </div>
                </div>
                <p className="text-white/50 text-xs">Touchez pour commencer</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        {step === 'active' && (
          <div className="absolute bottom-0 left-0 right-0 z-40 p-4 pb-8">
            <div className="flex items-center justify-center gap-3 max-w-md mx-auto">
              <button
                onClick={() => setCardScale((s) => Math.max(0.3, s - 0.1))}
                className="flex flex-col items-center gap-1 active:scale-95 transition-transform"
                title="Réduire"
              >
                <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/60 transition-colors">
                  <ZoomOut size={18} />
                </div>
                <span className="text-[9px] font-bold text-white/70 uppercase tracking-wider">Réduire</span>
              </button>

              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className="flex flex-col items-center gap-1 active:scale-95 transition-transform"
                title="Retourner la carte"
              >
                <div className="w-16 h-16 rounded-full bg-teal-500/80 backdrop-blur-md border-2 border-teal-400/50 text-white flex items-center justify-center hover:bg-teal-500 transition-all shadow-lg shadow-teal-500/30">
                  <RotateCw size={28} />
                </div>
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Retourner</span>
              </button>

              <button
                onClick={() => setCardScale((s) => Math.min(2, s + 0.1))}
                className="flex flex-col items-center gap-1 active:scale-95 transition-transform"
                title="Agrandir"
              >
                <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/60 transition-colors">
                  <ZoomIn size={18} />
                </div>
                <span className="text-[9px] font-bold text-white/70 uppercase tracking-wider">Zoom</span>
              </button>

              <button
                onClick={resetTransform}
                className="flex flex-col items-center gap-1 active:scale-95 transition-transform"
                title="Recentrer"
              >
                <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/60 transition-colors">
                  <Maximize2 size={18} />
                </div>
                <span className="text-[9px] font-bold text-white/70 uppercase tracking-wider">Centrer</span>
              </button>
            </div>
          </div>
        )}

        {/* Close button */}
        <button
          onClick={() => {
            stopCamera()
            onClose()
          }}
          className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/60 transition-colors active:scale-95"
          title="Fermer"
        >
          <X size={20} />
        </button>

        {/* AR badge */}
        {step === 'active' && (
          <div className="absolute top-4 left-4 z-50">
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/20">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-white text-xs font-bold uppercase tracking-wider">AR</span>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>,
    portalRoot,
  )
}

export default ARPostcardViewer
