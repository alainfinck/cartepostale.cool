'use client'

import React, { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Postcard } from '@/types'
import PostcardView from '@/components/postcard/PostcardView'
import MobilePostcardView from '@/components/view/MobilePostcardView'
import { Eye, MapPin, Search, Smartphone, CreditCard } from 'lucide-react'
import { NumberTicker } from '@/components/ui/number-ticker'
import type { PhotoLocation } from '@/components/ui/PhotoMarker'

const MiniMap = dynamic(() => import('@/components/postcard/MiniMap'), { ssr: false })
const MapModal = dynamic(() => import('@/components/ui/MapModal'), { ssr: false })

interface PostcardViewToggleProps {
  postcard: Postcard
  views: number
}

export default function PostcardViewToggle({ postcard, views }: PostcardViewToggleProps) {
  const [isMobileView, setIsMobileView] = useState(false)
  const [isMapOpen, setIsMapOpen] = useState(false)
  const [mapZoom, setMapZoom] = useState(10)

  const photoLocations: PhotoLocation[] = useMemo(() => {
    if (!postcard.mediaItems) return []
    const groups: Record<string, PhotoLocation> = {}
    postcard.mediaItems.forEach((item) => {
      if (item.exif?.gps) {
        const key = `${item.exif.gps.latitude.toFixed(4)},${item.exif.gps.longitude.toFixed(4)}`
        if (!groups[key]) {
          groups[key] = {
            id: key,
            lat: item.exif.gps.latitude,
            lng: item.exif.gps.longitude,
            mediaItems: [],
          }
        }
        groups[key].mediaItems.push(item)
      }
    })
    return Object.values(groups)
  }, [postcard.mediaItems])

  const hasMap = Boolean(postcard.coords || postcard.location)
  const CARD_WIDTH = 'min(95vw, 960px)'
  const CARD_HEIGHT = 'min(90vh, 760px)'

  return (
    <div className="w-full flex flex-col items-center">
      {/* Toggle button */}
      <div className="mb-4 flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-full border border-stone-200 shadow-sm p-1">
        <button
          onClick={() => setIsMobileView(false)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
            !isMobileView
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          <CreditCard size={13} />
          <span>Carte</span>
        </button>
        <button
          onClick={() => setIsMobileView(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
            isMobileView
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          <Smartphone size={13} />
          <span>Lecture</span>
        </button>
      </div>

      {/* Card view + compteur de vues (languette vues en bas à droite sur le côté de la carte) */}
      <div className="w-full flex flex-col items-center">
        <div className="relative flex justify-center" style={{ width: CARD_WIDTH, maxWidth: '100%' }}>
          {isMobileView ? (
            <MobilePostcardView postcard={postcard} />
          ) : (
            <>
              <PostcardView
                postcard={postcard}
                flipped={false}
                isLarge={true}
                className="shadow-[0_20px_50px_rgba(0,0,0,0.15)] md:shadow-[0_30px_70px_rgba(0,0,0,0.2)] hover:shadow-[0_28px_60px_rgba(0,0,0,0.2)] md:hover:shadow-[0_40px_90px_rgba(0,0,0,0.25)]"
                width={CARD_WIDTH}
                height={CARD_HEIGHT}
              />
              {/* Languette vues : en bas à droite sur le côté de la carte */}
              <div className="absolute right-0 bottom-4 sm:bottom-6 -mr-px flex items-center gap-2 pl-3 pr-2.5 py-2 rounded-l-2xl rounded-r-sm rounded-b-full sm:rounded-b-2xl bg-white/90 backdrop-blur-md border border-stone-200 border-r-0 shadow-lg text-stone-500 text-xs font-black uppercase tracking-[0.2em] transform transition-all hover:scale-[1.02] active:scale-95 z-10">
                <Eye size={14} className="text-teal-500 shrink-0" />
                <NumberTicker value={views} className="font-black text-stone-700" />
                <span>vues</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Map sous la carte (affichée en mode Carte et en mode Lecture) */}
      {hasMap && (
        <div className="w-full max-w-[95vw] sm:max-w-[552px] md:max-w-[660px] lg:max-w-[780px] xl:max-w-[840px] mx-auto mt-8 px-0 sm:px-0">
          <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-stone-700">
                <MapPin size={18} className="text-teal-600 shrink-0" />
                <span className="font-semibold text-sm">
                  {postcard.location || 'Lieu de la carte'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMapOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200/70 text-sm font-semibold transition-colors"
                title="Agrandir la carte"
              >
                <Search size={16} />
                <span>Agrandir</span>
              </button>
            </div>
            <div className="relative w-full aspect-[16/10] min-h-[200px] bg-stone-100">
              {postcard.coords ? (
                <>
                  <MiniMap
                    coords={postcard.coords}
                    zoom={mapZoom}
                    onClick={() => setIsMapOpen(true)}
                    photoLocations={photoLocations}
                  />
                  <div
                    className="absolute top-2 right-2 z-[1100] flex flex-col gap-0.5 shadow-md rounded-md overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => setMapZoom((z) => Math.min(18, z + 1))}
                      className="w-8 h-8 flex items-center justify-center bg-white/95 hover:bg-white text-stone-600 hover:text-teal-600 border border-stone-200/80 transition-colors"
                      aria-label="Zoom avant"
                    >
                      <span className="text-lg font-bold leading-none">+</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapZoom((z) => Math.max(5, z - 1))}
                      className="w-8 h-8 flex items-center justify-center bg-white/95 hover:bg-white text-stone-600 hover:text-teal-600 border border-stone-200/80 transition-colors"
                      aria-label="Zoom arrière"
                    >
                      <span className="text-lg font-bold leading-none">−</span>
                    </button>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsMapOpen(true)}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-stone-500 hover:bg-stone-50 transition-colors"
                  title="Voir la carte"
                >
                  <MapPin size={40} className="text-teal-500" />
                  <span className="text-sm font-semibold text-teal-700">Voir sur la carte</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {isMapOpen && (
        <MapModal
          isOpen={isMapOpen}
          onClose={() => setIsMapOpen(false)}
          location={postcard.location || ''}
          coords={postcard.coords}
          image={postcard.frontImage}
          message={postcard.message}
          isLarge={true}
          photoLocations={photoLocations}
        />
      )}
    </div>
  )
}
