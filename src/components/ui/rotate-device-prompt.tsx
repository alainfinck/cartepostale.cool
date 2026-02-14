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
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="fixed top-0 left-0 right-0 z-[60] h-9 bg-teal-600/90 backdrop-blur-sm text-white flex items-center justify-center gap-2 border-b border-white/10"
                >
                    <Smartphone className="w-3.5 h-3.5 rotate-90 shrink-0 opacity-90" />
                    <p className="text-[10px] font-semibold uppercase tracking-wider">Paysage pour voir plus grand ✨</p>
                    <button
                        type="button"
                        onClick={() => {
                            setDismissed(true)
                            setIsVisible(false)
                        }}
                        className="absolute right-2 p-1 hover:bg-white/10 rounded transition-colors"
                        aria-label="Fermer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
