'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { Postcard } from '@/types'

const ScratchCard = dynamic(() => import('@/components/view/ScratchCard'), { ssr: false })

interface ScratchCardViewWrapperProps {
  postcard: Postcard
  children: React.ReactNode
}

export default function ScratchCardViewWrapper({
  postcard,
  children,
}: ScratchCardViewWrapperProps) {
  if (!postcard.scratchCardEnabled) {
    return <>{children}</>
  }

  return (
    <ScratchCard coverImage={postcard.scratchCardImage} senderName={postcard.senderName}>
      {children}
    </ScratchCard>
  )
}
