'use client'

import React from 'react'
import { Postcard } from '@/types'
import PostcardScrollFlow from '@/components/postcard/PostcardScrollFlow'

interface PostcardEmbedViewProps {
  postcard: Postcard
  views?: number
  postcardId?: number
}

/**
 * Vue d’intégration : utilise désormais le nouveau flux PostcardScrollFlow
 * pour une expérience cohérente avec la vue principale.
 */
export default function PostcardEmbedView({
  postcard,
  views = 0,
  postcardId,
}: PostcardEmbedViewProps) {
  return (
    <div className="min-h-screen w-full bg-[#f5f2ed]">
      <PostcardScrollFlow postcard={postcard} postcardId={postcardId} />
    </div>
  )
}
