'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, type ReactNode } from 'react'
import { Heart } from 'lucide-react'

interface EnvelopeExperienceProps {
  enabled?: boolean
  hero?: ReactNode
  children: ReactNode
}

const contentVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

export default function EnvelopeExperience({ enabled = false, hero, children }: EnvelopeExperienceProps) {
  const [isRevealed, setIsRevealed] = useState(!enabled)
  const [isOpening, setIsOpening] = useState(false)
  const overlayActive = enabled && !isRevealed
  const showHeroInContent = hero && (!enabled || isRevealed)

  const handleOpen = () => {
    if (!isRevealed && !isOpening) {
      setIsOpening(true)
      // Duration of the zoom animation
      setTimeout(() => {
        setIsRevealed(true)
        setIsOpening(false)
        window.scrollTo({ top: 0, behavior: 'smooth' })
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
    <div className="relative min-h-screen bg-[#fdfbf7] overflow-hidden">
      <AnimatePresence>
        {overlayActive ? (
          <motion.div
            key="envelope-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }}
            className="fixed inset-0 z-50 flex items-start justify-center px-5 pt-[16vh] md:pt-[20vh] pb-32 bg-gradient-to-br from-[#fffdf7] via-[#f7f2ea] to-[#f1e8d6] backdrop-blur-3xl"
          >
            <div className={`w-full max-w-3xl text-center flex flex-col items-center gap-8 translate-y-[-18%] sm:translate-y-[-22%] transition-opacity duration-500 ${isOpening ? 'opacity-0' : 'opacity-100'}`}>
              {hero && (
                <motion.div
                  key="overlay-hero"
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="px-4 mt-4 md:mt-6"
                >
                  {hero}
                </motion.div>
              )}

              <motion.button
                type="button"
                onClick={handleOpen}
                initial="rest"
                animate="floating"
                whileHover="hover"
                className="flex flex-col items-center gap-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/80 group"
              >
                <motion.div
                  className="relative w-[min(480px,90vw)] aspect-[5/3] overflow-visible"
                  variants={{
                    rest: {
                      y: 8,
                      scale: 0.92,
                      transition: { duration: 1.5, ease: "easeOut" }
                    },
                    floating: {
                      y: [0, -15, 0],
                      rotate: [0, 1, -1, 0],
                      scale: 1,
                      transition: {
                        y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                        rotate: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                        scale: { duration: 1.5, ease: "easeOut" }
                      }
                    },
                    hover: {
                      scale: 1.08,
                      y: -25,
                      rotate: 0,
                      transition: { duration: 1.5, ease: "easeOut" }
                    }
                  }}
                  style={{
                    backgroundImage: 'url(/media/enveloppe1.png)',
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }}
                >

                  {/* Heart Seal (slow beat) + Ouvrir text fixed below */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none flex flex-col items-center gap-4">
                    <motion.div
                      className="relative"
                      style={{ willChange: 'transform, opacity' }}
                      initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
                      animate={isOpening ? {
                        scale: 15,
                        opacity: 0,
                        transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] }
                      } : {
                        scale: [1, 1.12, 1],
                        opacity: 1,
                        rotate: 0,
                        transition: {
                          scale: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
                          opacity: { delay: 0.5, duration: 0.5 }
                        }
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
            {hero}
          </motion.div>
        )}

        <motion.div
          className={`${overlayActive ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'} transition-[opacity] duration-500`}
          aria-hidden={overlayActive}
        >
          {children}
        </motion.div>
      </motion.section>
    </div >
  )
}
