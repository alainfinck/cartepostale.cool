'use client'

import { useEffect } from 'react'
import { useFacebookPixel } from '@/hooks/useFacebookPixel'

export function PricingTracking() {
  const { trackViewContent } = useFacebookPixel()

  useEffect(() => {
    trackViewContent({
      content_name: 'Page Tarifs',
      content_category: 'Pricing',
    })
  }, [trackViewContent])

  return null
}
