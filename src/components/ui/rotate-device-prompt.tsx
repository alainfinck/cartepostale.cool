"use client"

import { useEffect, useState } from "react"
import { Smartphone, X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

export function RotateDevicePrompt() {
    const [isVisible, setIsVisible] = useState(false)
    const [dismissed, setDismissed] = useState(false)

    useEffect(() => {
        const checkOrientation = () => {
            // Check if mobile (width < 768px) and portrait (height > width)
            const isMobile = window.innerWidth < 768
            const isPortrait = window.innerHeight > window.innerWidth
            
            if (isMobile && isPortrait && !dismissed) {
                setIsVisible(true)
            } else {
                setIsVisible(false)
            }
        }

        checkOrientation()
        window.addEventListener("resize", checkOrientation)
        
        return () => window.removeEventListener("resize", checkOrientation)
    }, [dismissed])

    if (!isVisible) return null

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-4 left-4 right-4 z-50 bg-stone-900/90 backdrop-blur text-white p-4 rounded-xl shadow-lg border border-white/10 flex items-center gap-4"
                >
                    <div className="bg-white/10 p-3 rounded-full animate-pulse">
                        <Smartphone className="w-6 h-6 rotate-90" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-sm">Meilleure expérience</p>
                        <p className="text-xs text-stone-300">Tournez votre téléphone pour voir la carte en grand format.</p>
                    </div>
                    <button 
                        onClick={() => {
                            setDismissed(true)
                            setIsVisible(false)
                        }}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
