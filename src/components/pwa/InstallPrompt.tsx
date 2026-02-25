'use client'

import React, { useEffect, useState } from 'react'
import { X, Download, Share2, PlusSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatePresence, motion } from 'framer-motion'
import { UAParser } from 'ua-parser-js'

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true)
    }

    // Detect iOS
    const parser = new UAParser()
    const os = parser.getOS()
    const isIOSDevice = os.name === 'iOS'
    setIsIOS(isIOSDevice)

    // Android/Desktop: Listen for install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      // Only show if not standalone and not in an iframe
      const isEmbed = window.self !== window.top
      if (!window.matchMedia('(display-mode: standalone)').matches && !isEmbed) {
        // Delay slightly to not annoy user immediately
        setTimeout(() => setShowPrompt(true), 5000)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // iOS: Show prompt if not standalone (and after a delay)
    const isEmbed = typeof window !== 'undefined' && window.self !== window.top
    if (isIOSDevice && !window.matchMedia('(display-mode: standalone)').matches && !isEmbed) {
      // Check if we've already shown it recently
      const lastDismissed = localStorage.getItem('pwa_prompt_dismissed')
      if (!lastDismissed || Date.now() - parseInt(lastDismissed) > 24 * 60 * 60 * 1000) {
        setTimeout(() => setShowPrompt(true), 5000)
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowPrompt(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString())
  }

  if (isStandalone || !showPrompt) return null

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-6 right-6 z-[100] md:left-auto md:right-6 md:w-96"
        >
          <div className="bg-white/95 backdrop-blur-md border border-teal-100 dark:bg-stone-900/95 dark:border-stone-800 p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <div className="bg-teal-100 p-2.5 rounded-xl text-teal-600 flex items-center justify-center shrink-0">
                  <Download size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                    Installer l&apos;application
                  </h3>
                  <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                    Accédez à vos cartes plus rapidement, même hors ligne.
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-stone-400 hover:text-stone-600 p-1"
                aria-label="Fermer"
              >
                <X size={18} />
              </button>
            </div>

            {isIOS ? (
              <div className="bg-stone-50 dark:bg-stone-800 rounded-lg p-3 text-sm text-stone-600 dark:text-stone-300">
                <p className="flex items-center gap-2 mb-2">
                  1. Appuyez sur <Share2 size={16} className="text-blue-500" />
                </p>
                <p className="flex items-center gap-2">
                  2. Sélectionnez{' '}
                  <span className="font-semibold">Sur l&apos;écran d&apos;accueil</span>{' '}
                  <PlusSquare size={16} />
                </p>
              </div>
            ) : (
              <Button
                onClick={handleInstallClick}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white"
              >
                Installer
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
