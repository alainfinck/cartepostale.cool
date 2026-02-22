'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { Postcard } from '@/types'

const ScratchCard = dynamic(() => import('@/components/view/ScratchCard'), { ssr: false })
const PuzzleCard = dynamic(() => import('@/components/view/PuzzleCard'), { ssr: false })

interface ScratchCardViewWrapperProps {
  postcard: Postcard
  children: React.ReactNode
}

export default function ScratchCardViewWrapper({
  postcard,
  children,
}: ScratchCardViewWrapperProps) {
  if (postcard.puzzleCardEnabled) {
    return (
      <PuzzleCard
        imageUrl={postcard.frontImage}
        gridSize={Number(postcard.puzzleCardDifficulty || '3')}
        senderName={postcard.senderName}
      >
        {children}
      </PuzzleCard>
    )
  }

  if (postcard.scratchCardEnabled) {
    return (
      <ScratchCard coverImage={postcard.scratchCardImage} senderName={postcard.senderName}>
        {children}
      </ScratchCard>
    )
  }

  return <>{children}</>
}
