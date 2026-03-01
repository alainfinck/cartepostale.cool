'use client'

import React from 'react'
import { Postcard } from '@/types'
import PostcardFlipCard from '@/components/postcard/PostcardFlipCard'

interface PostcardEmbedViewProps {
  postcard: Postcard
  views?: number
  postcardId?: number
}

/**
 * Vue d'intégration : carte postale recto/verso uniquement (pour iframe sur site tiers).
 */
export default function PostcardEmbedView({ postcard }: PostcardEmbedViewProps) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#f5f2ed] p-6 md:p-10">
      <div className="w-full max-w-2xl">
        <PostcardFlipCard postcard={postcard} className="shadow-[0_20px_50px_rgba(0,0,0,0.12)]" />
        <p className="mt-5 text-center text-xs text-stone-400">
          Cliquez ou glissez pour retourner la carte
        </p>
      </div>
    </div>
  )
}
