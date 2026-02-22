'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { Postcard } from '@/types'
import PostcardViewToggle from '@/components/view/PostcardViewToggle'

const ScratchCard = dynamic(() => import('@/components/view/ScratchCard'), { ssr: false })
const PuzzleCard = dynamic(() => import('@/components/view/PuzzleCard'), { ssr: false })

interface InteractiveCardWrapperProps {
  postcard: Postcard
  views: number
}

export default function ScratchCardWrapper({ postcard, views }: InteractiveCardWrapperProps) {
  const inner = <PostcardViewToggle postcard={postcard} views={views} />

  if (postcard.puzzleCardEnabled) {
    return (
      <PuzzleCard
        imageUrl={postcard.frontImage}
        gridSize={Number(postcard.puzzleCardDifficulty || '3')}
        senderName={postcard.senderName}
      >
        {inner}
      </PuzzleCard>
    )
  }

  if (postcard.scratchCardEnabled) {
    return (
      <ScratchCard coverImage={postcard.scratchCardImage} senderName={postcard.senderName}>
        {inner}
      </ScratchCard>
    )
  }

  return inner
}
