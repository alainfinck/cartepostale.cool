'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DemoCardProps {
  /** Slug pour /carte/[slug] */
  slug: string
  /** URL de l'image de la face avant de la carte démo */
  imageUrl: string
  /** Titre court (ex: "Carte anniversaire") */
  title?: string
  /** Sous-titre optionnel (ex: "De Maxime pour Manon") */
  subtitle?: string
  className?: string
}

export function DemoCard({ slug, imageUrl, title, subtitle, className }: DemoCardProps) {
  const href = `/carte/${slug}`

  return (
    <Link
      href={href}
      className={cn(
        'group block bg-white rounded-[24px] overflow-hidden border border-stone-100 shadow-xl shadow-stone-200/50',
        'hover:shadow-2xl hover:shadow-stone-300/40 hover:-translate-y-1 hover:border-stone-200 transition-all duration-300',
        className,
      )}
      aria-label={title ? `Voir la démo : ${title}` : 'Voir la carte démo'}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-stone-100">
        <Image
          src={imageUrl}
          alt={title ?? 'Carte postale démo'}
          fill
          sizes="(max-width: 768px) 100vw, 380px"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="flex items-center gap-2 text-sm font-medium">
            <Eye size={18} />
            Voir la démo
          </span>
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
      {(title || subtitle) && (
        <div className="p-4 border-t border-stone-100">
          {title && <p className="font-semibold text-stone-800">{title}</p>}
          {subtitle && <p className="text-sm text-stone-500 mt-0.5">{subtitle}</p>}
        </div>
      )}
    </Link>
  )
}
