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
                'h-10 w-10 sm:h-11 sm:w-11',
                'rounded-full bg-white/50 hover:bg-white/70 text-stone-500 hover:text-teal-600 border border-stone-200/70 ring-1 ring-stone-200/70 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.1)] backdrop-blur-xl',
                'flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-400',
                visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 pointer-events-none translate-y-4 scale-90'
            )}
        >
            <ArrowUp className="h-7 w-7 sm:h-8 sm:w-8" />
        </button>
    )
}
