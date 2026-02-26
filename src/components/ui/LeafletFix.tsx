'use client'

import { useEffect } from 'react'
import L from 'leaflet'

export default function LeafletFix() {
  useEffect(() => {
    // Check if we are in a browser environment
    if (typeof window !== 'undefined') {
      // L.Browser.any3d = false // COMMENTÉ : Désactiver les transforms 3D rendait le zoom saccadé.
      // On le réactive pour la fluidité (standard pour Leaflet normal).
      // Si les markers papillonnent en fin de flip, privilégier translateZ(0) sur le container.

      // Fix default icon issue in Leaflet
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl

      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        iconUrl:
          'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      })
    }
  }, [])

  return null
}
