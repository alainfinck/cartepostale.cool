'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface MobileFrameProps {
  children: React.ReactNode
  className?: string
  /** Largeur du cadre (écran interne). Défaut: 320px pour un rendu mobile réaliste. */
  width?: number | string
  /** Hauteur du cadre. Défaut: auto (min-height pour ressembler à un téléphone). */
  height?: number | string
}

/**
 * Cadre visuel type smartphone pour simuler l'affichage mobile (notch, bords arrondis, bezel).
 */
export default function MobileFrame({
  children,
  className,
  width = 320,
  height = 'min(85vh, 640px)',
}: MobileFrameProps) {
  const widthVal = typeof width === 'number' ? `${width}px` : width
  const heightVal = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={cn('flex flex-col items-center justify-center', className)}
      style={{ width: widthVal }}
    >
      {/* Bezel + écran (cadre téléphone) */}
      <div
        className="relative w-full overflow-hidden rounded-[2.5rem] bg-stone-900 shadow-2xl ring-[6px] ring-stone-800"
        style={{
          width: '100%',
          minHeight: heightVal,
          maxHeight: '85vh',
        }}
      >
        {/* Notch / Dynamic Island */}
        <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2">
          <div className="h-6 w-24 rounded-b-2xl bg-stone-900" />
        </div>

        {/* Zone écran (contenu) */}
        <div
          className="relative w-full overflow-y-auto overflow-x-hidden bg-[#fdfbf7]"
          style={{
            minHeight: heightVal,
            maxHeight: '85vh',
            paddingTop: '1.5rem',
            paddingBottom: '1.5rem',
            paddingLeft: '0.75rem',
            paddingRight: '0.75rem',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
