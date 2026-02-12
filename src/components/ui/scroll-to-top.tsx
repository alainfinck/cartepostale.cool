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
                'fixed z-50 bottom-6 right-6 h-12 w-12 rounded-full shadow-xl shadow-orange-500/40',
                'bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-400 transition-transform duration-200',
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 pointer-events-none translate-y-6'
            )}
        >
            <ArrowUp className="h-5 w-5" />
        </button>
    )
}
