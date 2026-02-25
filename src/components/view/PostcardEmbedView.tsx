'use client'

import React from 'react'
import { Postcard } from '@/types'
import PostcardView from '@/components/postcard/PostcardView'

interface PostcardEmbedViewProps {
  postcard: Postcard
  views?: number
}

/**
 * Vue d’intégration : uniquement le composant postcard avec effet recto/verso.
 * Utilisée quand la carte est embedée sur un site tiers (?embed=1).
 */
export default function PostcardEmbedView({ postcard, views = 0 }: PostcardEmbedViewProps) {
  const CARD_WIDTH = 'min(95vw, 560px)'
  const CARD_HEIGHT = 'min(71.25vw, 420px)'

  return (
    <div className="flex min-h-[100vh] w-full items-center justify-center bg-[#f5f2ed] p-4">
      <div className="flex flex-col items-center">
        <PostcardView
          postcard={postcard}
          flipped={false}
          isLarge={true}
          width={CARD_WIDTH}
          height={CARD_HEIGHT}
          views={views}
          hideFullscreenButton={false}
          hideFlipHints={false}
          className="shadow-[0_20px_50px_rgba(0,0,0,0.12)]"
        />
        <p className="mt-4 text-center text-xs text-stone-400">
          Cliquez ou glissez pour retourner la carte
        </p>
      </div>
    </div>
  )
}
