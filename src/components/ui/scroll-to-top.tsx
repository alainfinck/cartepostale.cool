'use client'

import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

import { cn } from '@/lib/utils'

export const ScrollToTopButton = () => {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setVisible(window.scrollY > 200)
        }

        handleScroll()
        window.addEventListener('scroll', handleScroll, { passive: true })

        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <button
            type="button"
            onClick={scrollToTop}
            aria-label="Revenir en haut de la page"
            className={cn(
                'fixed z-[70] transition-all duration-300',
                'bottom-4 right-4 sm:bottom-6 sm:right-6',
                'h-10 w-10 sm:h-12 sm:w-12',
                'rounded-full bg-white/80 hover:bg-white text-stone-400 hover:text-stone-600 border border-stone-200 shadow-sm backdrop-blur-md',
                'flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-400',
                visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 pointer-events-none translate-y-4 scale-90'
            )}
        >
            <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
    )
}
