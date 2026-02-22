'use client'

import { useEffect } from 'react'
import { useFacebookPixel } from '@/hooks/useFacebookPixel'

interface PostcardTrackingProps {
  postcardId: string
  senderName: string
}

export function PostcardTracking({ postcardId, senderName }: PostcardTrackingProps) {
  const { trackViewContent } = useFacebookPixel()

  useEffect(() => {
    trackViewContent({
      content_ids: [postcardId],
      content_name: `Carte de ${senderName}`,
      content_type: 'product',
      content_category: 'Postcard View',
    })
  }, [postcardId, senderName, trackViewContent])

  return null
}
