'use client'

import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { X, Loader2, Map as MapIcon, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

// Fix for default marker icon in Next.js
// Leaflet's default icon path issues are common in SSR/bundling environments
const DefaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

L.Marker.prototype.options.icon = DefaultIcon

interface MapModalProps {
  isOpen: boolean
  onClose: () => void
  location: string
  coords?: { lat: number; lng: number }
  image: string
  message?: string
  isLarge?: boolean
}

// Component to update map view when coordinates change and fix sizing issues
function MapEffects({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()

  useEffect(() => {
    map.setView(center, zoom)
    // Small timeout to ensure container has finished animating/resizing
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 100)
    return () => clearTimeout(timer)
  }, [center, zoom, map])

  return null
}

const MapModal: React.FC<MapModalProps> = ({ isOpen, onClose, location, coords, image, message, isLarge = false }) => {
  const [position, setPosition] = useState<[number, number] | null>(
    coords ? [coords.lat, coords.lng] : null
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      if (coords) {
        setPosition([coords.lat, coords.lng])
        setError(null)
      } else if (location) {
        // Geocode the location string if no coords provided
        setIsLoading(true)
        setError(null)

        // Simple geocoding using Nominatim (OpenStreetMap)
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`)
          .then(res => res.json())
          .then(data => {
            if (data && data.length > 0) {
              setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)])
            } else {
              setError("Impossible de localiser cet endroit.")
            }
          })
          .catch(err => {
            console.error("Geocoding error:", err)
            setError("Erreur de connexion au service de carte.")
          })
          .finally(() => setIsLoading(false))
      }
    }
  }, [isOpen, coords, location])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[150] bg-stone-900/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={cn(
          "bg-white rounded-3xl overflow-hidden shadow-2xl relative flex flex-col transition-all duration-300 border-4 border-white/50",
          isLarge
            ? "w-[95vw] h-[75vh] md:w-[85vw] md:h-[80vh] max-w-6xl"
            : "w-[340px] h-[400px] sm:w-[600px] sm:h-[450px]"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/90 hover:bg-white text-stone-500 hover:text-red-500 p-3 rounded-full transition-all z-[1000] shadow-xl border-2 border-stone-100 group active:scale-95"
          title="Fermer"
        >
          <X size={28} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>

        {isLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-stone-500 gap-3">
            <Loader2 className="animate-spin text-teal-500" size={48} />
            <p className="font-medium">Localisation de votre souvenir...</p>
          </div>
        ) : error || !position ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-stone-500 gap-3 bg-stone-50">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-2">
              <Globe size={40} />
            </div>
            <p className="text-xl font-bold text-stone-800">{error || "Localisation non trouvée"}</p>
            <p className="text-sm text-stone-400">Nous n&apos;avons pas pu trouver &quot;{location}&quot; sur la carte.</p>
          </div>
        ) : (
          <MapContainer
            center={position}
            zoom={13}
            style={{ width: '100%', height: '100%' }}
            className="z-0"
          >
            <MapEffects center={position} zoom={13} />

            <LayersControl position="topleft">
              <LayersControl.BaseLayer checked name="Plan (OSM)">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </LayersControl.BaseLayer>

              <LayersControl.BaseLayer name="Satellite">
                <TileLayer
                  attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
              </LayersControl.BaseLayer>

              <LayersControl.BaseLayer name="Hybride (Satellite + Routes)">
                <TileLayer
                  attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
                <TileLayer
                  url="https://stamen-tiles-{s}.a.ssl.fastly.net/toner-hybrid/{z}/{x}/{y}{r}.png"
                  opacity={0.7}
                />
              </LayersControl.BaseLayer>
            </LayersControl>

            <Marker position={position}>
              <Popup className="custom-popup" minWidth={240} maxWidth={320}>
                <div className="flex flex-col gap-3 p-1">
                  <div className="w-full aspect-video rounded-xl overflow-hidden bg-stone-100 border-2 border-white shadow-md">
                    <img
                      src={image}
                      alt={location}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <div className="font-bold text-lg text-stone-800 capitalize leading-tight flex items-center gap-2">
                      <MapIcon size={16} className="text-teal-600" />
                      {location}
                    </div>
                    {message && (
                      <div className="text-xs text-stone-500 mt-2 line-clamp-3 italic bg-stone-50 p-2 rounded-lg border border-stone-100 font-handwriting text-base">
                        &quot;{message}&quot;
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        )}
      </div>
    </div>
  )
}

export default MapModal
