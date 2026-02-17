'use client'

import React from 'react'
import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { Camera, Image as ImageIcon } from 'lucide-react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MediaItem } from '@/types'
import { getOptimizedImageUrl } from '@/lib/image-processing'

export interface PhotoLocation {
  id: string
  lat: number
  lng: number
  mediaItems: MediaItem[]
}

interface PhotoMarkerProps {
  location: PhotoLocation
  onClick?: (mediaIndex: number) => void
}

const createCustomIcon = (count: number, thumbnailUrl?: string) => {
  const html = renderToStaticMarkup(
    <div className="relative group">
      <div className="absolute -inset-2 bg-white/30 rounded-full blur-sm group-hover:bg-teal-500/30 transition-colors" />
      <div className="relative w-12 h-12 bg-white rounded-full border-2 border-white shadow-lg overflow-hidden flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        {thumbnailUrl ? (
          <img
            src={getOptimizedImageUrl(thumbnailUrl, { width: 100, height: 100, fit: 'cover' })}
            alt="Location thumbnail"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="bg-teal-50 w-full h-full flex items-center justify-center">
            <Camera className="w-6 h-6 text-teal-600" />
          </div>
        )}

        {count > 1 && (
          <div className="absolute bottom-0 right-0 bg-teal-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-tl-md min-w-[18px] text-center border-l border-t border-white">
            {count}
          </div>
        )}
      </div>
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 transform origin-center shadow-lg -z-10" />
    </div>,
  )

  return L.divIcon({
    html,
    className: 'custom-photo-marker',
    iconSize: [48, 48],
    iconAnchor: [24, 54], // Pointing tip
    popupAnchor: [0, -50],
  })
}

const PhotoMarker: React.FC<PhotoMarkerProps> = ({ location, onClick }) => {
  const firstImage = location.mediaItems.find((item) => item.type === 'image' || !item.type)
  const icon = createCustomIcon(location.mediaItems.length, firstImage?.url)

  return (
    <Marker position={[location.lat, location.lng]} icon={icon}>
      <Popup className="photo-popup" minWidth={280} maxWidth={320}>
        <div className="p-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-stone-800 flex items-center gap-1.5">
              <Camera size={14} className="text-teal-600" />
              {location.mediaItems.length} souvenir{location.mediaItems.length > 1 ? 's' : ''} ici
            </h4>
          </div>

          <div className="grid grid-cols-3 gap-1.5 max-h-[200px] overflow-y-auto custom-scrollbar p-0.5">
            {location.mediaItems.map((item, idx) => (
              <button
                key={item.id || idx}
                className="aspect-square relative rounded-md overflow-hidden hover:opacity-80 transition-opacity border border-stone-100 shadow-sm group"
                onClick={(e) => {
                  e.stopPropagation()
                  onClick?.(idx)
                }}
                title={item.note || `Photo ${idx + 1}`}
              >
                {item.type === 'video' ? (
                  <div className="w-full h-full bg-stone-100 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-stone-900/50 flex items-center justify-center text-white text-[10px]">
                      ▶
                    </div>
                  </div>
                ) : (
                  <img
                    src={getOptimizedImageUrl(item.url, { width: 100, height: 100, fit: 'cover' })}
                    alt={`Thumbnail ${idx}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </Popup>
    </Marker>
  )
}

export default PhotoMarker
