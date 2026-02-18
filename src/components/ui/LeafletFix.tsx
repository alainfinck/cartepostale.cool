'use client'

import { useEffect } from 'react'
import L from 'leaflet'

export default function LeafletFix() {
  useEffect(() => {
    // Check if we are in a browser environment
    if (typeof window !== 'undefined') {
      // Fix default icon issue in Leaflet
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl

      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      })
    }
  }, [])

  return null
}
