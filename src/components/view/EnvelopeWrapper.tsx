'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface EnvelopeWrapperProps {
  children: React.ReactNode
  className?: string
}

export default function EnvelopeWrapper({ children, className }: EnvelopeWrapperProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={cn('relative flex flex-col items-center', className)}>
      <div
        className="relative w-full max-w-[min(90vw,420px)] cursor-pointer select-none"
        style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
        onClick={() => !isOpen && setIsOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (!isOpen && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            setIsOpen(true)
          }
        }}
        aria-label={isOpen ? undefined : 'Cliquez pour ouvrir l’enveloppe'}
      >
        {/* Envelope back (rectangle) - visible when closed */}
        <AnimatePresence mode="wait">
          {!isOpen ? (
            <motion.div
              key="envelope"
              initial={{ opacity: 1 }}
              exit={{
                opacity: 0,
                transition: { duration: 0.25, delay: 0.5 },
              }}
              className="relative"
            >
              {/* Corps de l'enveloppe */}
              <motion.div
                className="relative rounded-sm overflow-hidden"
                style={{
                  paddingBottom: 'calc(100% * 0.72)',
                  background: 'linear-gradient(145deg, #f5f0e8 0%, #e8e0d4 50%, #ddd5c9 100%)',
                  boxShadow: `
                    inset 0 1px 0 rgba(255,255,255,0.6),
                    inset 0 -1px 0 rgba(0,0,0,0.04),
                    0 4px 12px rgba(0,0,0,0.08),
                    0 12px 32px rgba(0,0,0,0.12)
                  `,
                  border: '1px solid rgba(0,0,0,0.06)',
                }}
              />

              {/* Rabat triangulaire (flap) - s'ouvre vers l'arrière */}
              <motion.div
                className="absolute left-0 right-0 top-0 origin-bottom"
                style={{
                  width: '100%',
                  height: '50%',
                  background: 'linear-gradient(160deg, #e8e0d4 0%, #ddd5c9 40%, #d0c8bc 100%)',
                  clipPath: 'polygon(0 100%, 50% 0, 100% 100%)',
                  boxShadow: `
                    inset 0 2px 0 rgba(255,255,255,0.4),
                    0 -2px 8px rgba(0,0,0,0.06),
                    0 4px 16px rgba(0,0,0,0.08)
                  `,
                  borderBottom: '1px solid rgba(0,0,0,0.05)',
                }}
                initial={{ rotateX: 0 }}
                animate={{ rotateX: isOpen ? -180 : 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 120,
                  damping: 22,
                  mass: 0.8,
                }}
              />

              {/* Petit triangle central du rabat (décor) */}
              <motion.div
                className="absolute left-1/2 top-[18%] -translate-x-1/2 w-[28%] h-[20%] opacity-60"
                style={{
                  background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.03) 100%)',
                  clipPath: 'polygon(50% 100%, 0 0, 100% 0)',
                }}
                initial={{ rotateX: 0 }}
                animate={{ rotateX: isOpen ? -180 : 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 120,
                  damping: 22,
                  mass: 0.8,
                }}
              />

              {/* Indication clic */}
              <motion.p
                className="absolute bottom-4 left-0 right-0 text-center text-stone-500/90 text-sm font-medium tracking-wide"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                Cliquez pour ouvrir
              </motion.p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Carte postale révélée après ouverture */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="postcard-reveal"
              initial={{
                opacity: 0,
                y: 24,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 28,
                mass: 0.8,
                delay: 0.15,
              }}
              className="w-full"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
