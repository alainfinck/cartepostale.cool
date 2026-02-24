'use client'

import React, { useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import LeafletFix from '@/components/ui/LeafletFix'
import { getOptimizedImageUrl } from '@/lib/image-processing'
import type { Postcard } from '@/types'

const DefaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

function MapBoundsController({ postcards }: { postcards: Postcard[] }) {
  const map = useMap()
  const coords = useMemo(
    () => postcards.filter((p) => p.coords?.lat != null && p.coords?.lng != null),
    [postcards],
  )

  React.useEffect(() => {
    if (coords.length === 0) return
    const bounds = L.latLngBounds(
      coords.map((p) => [p.coords!.lat!, p.coords!.lng!] as [number, number]),
    )
    map.fitBounds(bounds, {
      padding: [40, 40],
      maxZoom: 10,
      animate: true,
      duration: 3.5, // Slow zoom for world context
    })
  }, [coords, map])

  return null
}

export function GalleryMap({ postcards }: { postcards: Postcard[] }) {
  const withCoords = useMemo(
    () => postcards.filter((p) => p.coords?.lat != null && p.coords?.lng != null),
    [postcards],
  )

  const center = useMemo((): [number, number] => {
    if (withCoords.length === 0) return [20, 0]
    const sum = withCoords.reduce(
      (acc, p) => ({
        lat: acc.lat + (p.coords?.lat ?? 0),
        lng: acc.lng + (p.coords?.lng ?? 0),
      }),
      { lat: 0, lng: 0 },
    )
    return [sum.lat / withCoords.length, sum.lng / withCoords.length]
  }, [withCoords])

  if (withCoords.length === 0) {
    return (
      <div className="h-[400px] rounded-2xl bg-stone-100 flex items-center justify-center text-stone-500">
        Aucun emplacement à afficher.
      </div>
    )
  }

  return (
    <div className="h-[400px] rounded-2xl overflow-hidden border border-stone-200 shadow-md">
      <MapContainer center={center} zoom={2} className="h-full w-full" scrollWheelZoom>
        <LeafletFix />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBoundsController postcards={withCoords} />
        {withCoords.map((card) => (
          <Marker key={card.id} position={[card.coords!.lat!, card.coords!.lng!]}>
            <Popup>
              <div className="min-w-[180px]">
                <div className="font-semibold text-stone-800">{card.location}</div>
                <div className="text-xs text-stone-500 mt-0.5">par {card.senderName}</div>
                {card.frontImage && (
                  <img
                    src={getOptimizedImageUrl(card.frontImage, { width: 200 })}
                    alt=""
                    className="mt-2 w-full rounded-lg object-cover aspect-[3/2]"
                  />
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
