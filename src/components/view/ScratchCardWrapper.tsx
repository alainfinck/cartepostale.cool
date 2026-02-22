'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { Postcard } from '@/types'
import PostcardViewToggle from '@/components/view/PostcardViewToggle'

const ScratchCard = dynamic(() => import('@/components/view/ScratchCard'), { ssr: false })

interface ScratchCardWrapperProps {
  postcard: Postcard
  views: number
}

export default function ScratchCardWrapper({ postcard, views }: ScratchCardWrapperProps) {
  if (!postcard.scratchCardEnabled) {
    return <PostcardViewToggle postcard={postcard} views={views} />
  }

  return (
    <ScratchCard
      coverImage={postcard.scratchCardImage}
      senderName={postcard.senderName}
    >
      <PostcardViewToggle postcard={postcard} views={views} />
    </ScratchCard>
  )
}
