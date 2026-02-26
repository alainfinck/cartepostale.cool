'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, type ReactNode, isValidElement, cloneElement } from 'react'
import { Heart } from 'lucide-react'

interface EnvelopeExperienceProps {
  enabled?: boolean
  hero?: ReactNode
  frontImage?: string
  children: ReactNode
}

const contentVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

export default function EnvelopeExperience({
  enabled = false,
  hero,
  frontImage,
  children,
}: EnvelopeExperienceProps) {
  const [isRevealed, setIsRevealed] = useState(!enabled)
  const [isOpening, setIsOpening] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const overlayActive = enabled && !isRevealed
  const showHeroInContent = hero && (!enabled || isRevealed)

  const handleOpen = () => {
    if (!isRevealed && !isOpening) {
      setIsOpening(true)
      // Durée de l'animation d'ouverture de l'enveloppe
      setTimeout(() => {
        setIsRevealed(true)
        setIsOpening(false)
        // Scroll en haut au prochain frame pour que le hero soit visible tout de suite (après le rendu)
        requestAnimationFrame(() => {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
        })
      }, 800)
    }
  }

  useEffect(() => {
    if (overlayActive) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [overlayActive])

  return (
    <div className="relative min-h-screen bg-[#fdfbf7] flex flex-col">
      <AnimatePresence>
        {overlayActive ? (
          <motion.div
            key="envelope-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }}
            className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-br from-[#fffdf7] via-[#f7f2ea] to-[#f1e8d6] backdrop-blur-3xl"
          >
            <div
              className={`min-h-full w-full flex flex-col items-center justify-start pt-[12vh] pb-12 px-5 transition-opacity duration-500 ${isOpening ? 'opacity-0' : 'opacity-100'}`}
            >
              <motion.button
                type="button"
                onClick={handleOpen}
                initial="rest"
                animate={isOpening ? 'opening' : isHovered ? 'hover' : 'floating'}
                onMouseEnter={() => !isOpening && setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="flex flex-col items-center gap-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/80 group"
              >
                <motion.div
                  className="relative w-[min(600px,95vw)] aspect-[5/3] overflow-visible"
                  transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                  variants={{
                    rest: {
                      y: 8,
                      scale: 0.92,
                    },
                    floating: {
                      y: [0, -10, 0],
                      rotate: [0, 1, -1, 0],
                      scale: 1,
                      transition: {
                        y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                        rotate: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
                        scale: { duration: 1.5 },
                      },
                    },
                    hover: {
                      scale: 1.05,
                      y: -15,
                      rotate: 0,
                      transition: { type: 'spring', stiffness: 300, damping: 25 },
                    },
                    opening: {
                      y: 0,
                      scale: 1.1,
                      transition: { duration: 0.6, ease: 'easeInOut' },
                    },
                  }}
                >
                  {/* Photo de la carte postale qui dépasse de l'enveloppe */}
                  {frontImage && (
                    <motion.div
                      className="absolute top-[2%] right-[8%] w-[55%] aspect-[3/2] rounded-md shadow-md border border-white/50 z-0"
                      transition={{ type: 'spring', stiffness: 80, damping: 20 }}
                      variants={{
                        rest: {
                          y: 0,
                          x: 0,
                          rotate: 5,
                        },
                        floating: {
                          y: [0, -2, 0],
                          x: [0, 1, 0],
                          rotate: [5, 7, 5],
                          transition: {
                            y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                            x: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                            rotate: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                          },
                        },
                        hover: {
                          y: -35,
                          x: 60,
                          rotate: 15,
                          transition: { type: 'spring', stiffness: 200, damping: 20 },
                        },
                        opening: {
                          y: -120,
                          x: 0,
                          rotate: 0,
                          opacity: 0,
                          transition: { duration: 0.6 },
                        },
                      }}
                      style={{
                        backgroundImage: `url(${frontImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                  )}

                  {/* L'image de l'enveloppe au-dessus de la photo */}
                  <div
                    className="absolute inset-0 z-10 pointer-events-none"
                    style={{
                      backgroundImage: 'url(/media/enveloppe1.png)',
                      backgroundSize: 'contain',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                    }}
                  />

                  {/* Heart Seal (slow beat) + Ouvrir text fixed below */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none flex flex-col items-center gap-4">
                    <motion.div
                      className="relative"
                      style={{ willChange: 'transform, opacity' }}
                      variants={{
                        rest: { scale: 0.8, opacity: 0, rotate: -5 },
                        floating: {
                          scale: [1, 1.12, 1],
                          opacity: 1,
                          rotate: 0,
                          transition: {
                            scale: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
                            opacity: { delay: 0.5, duration: 0.5 },
                          },
                        },
                        hover: {
                          scale: 1.15,
                          opacity: 1,
                          rotate: 0,
                          transition: { duration: 0.3 },
                        },
                        opening: {
                          scale: 15,
                          opacity: 0,
                          transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] },
                        },
                      }}
                    >
                      {!isOpening && (
                        <motion.div
                          className="absolute inset-0 bg-red-500/30 blur-2xl rounded-full"
                          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      )}
                      <div className="bg-white/95 backdrop-blur-md p-3 rounded-full shadow-2xl border border-red-100/50 relative z-10">
                        <Heart size={36} fill="#ef4444" className="text-red-500 drop-shadow-sm" />
                      </div>
                    </motion.div>
                    <span className="text-xl font-bold uppercase text-stone-800 tracking-[0.4em] text-center whitespace-nowrap">
                      Ouvrir
                    </span>
                  </div>
                </motion.div>
              </motion.button>

              {hero && (
                <motion.div
                  key="overlay-hero"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="px-4"
                >
                  {isValidElement(hero) ? cloneElement(hero as any, { isOpened: false }) : hero}
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.section
        aria-hidden={overlayActive}
        initial={{ opacity: overlayActive ? 0 : 1 }}
        animate={overlayActive ? contentVariants.hidden : contentVariants.visible}
        transition={{ duration: 0.5 }}
        className="relative z-0"
      >
        {showHeroInContent && (
          <motion.div
            key={`page-hero-${isRevealed ? 'revealed' : 'initial'}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {isValidElement(hero) ? cloneElement(hero as any, { isOpened: true }) : hero}
          </motion.div>
        )}

        <motion.div
          className={overlayActive ? 'hidden' : 'flex flex-col w-full flex-1'}
          aria-hidden={overlayActive}
        >
          {children}
        </motion.div>
      </motion.section>
    </div>
  )
}
