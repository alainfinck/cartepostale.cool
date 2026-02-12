'use client'

import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { X, Loader2 } from 'lucide-react'
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

// Component to update map view when coordinates change
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  map.setView(center, zoom)
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
        // Note: In production, consider a more robust service or caching
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
          "bg-white rounded-xl overflow-hidden shadow-2xl relative flex flex-col transition-all duration-300",
          isLarge 
            ? "w-[90vw] h-[60vw] max-w-[450px] max-h-[300px] sm:w-[600px] sm:h-[400px] md:w-[800px] md:h-[533px] sm:max-w-none sm:max-h-none landscape:max-h-[85svh] landscape:w-[95vw] landscape:h-[85svh]" 
            : "w-[340px] h-[240px] sm:w-[600px] sm:h-[400px]"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/90 hover:bg-white text-stone-500 hover:text-red-500 p-2 rounded-full transition-all z-[1000] shadow-md border border-stone-100"
        >
          <X size={24} />
        </button>

        {isLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-stone-500 gap-3">
            <Loader2 className="animate-spin" size={40} />
            <p>Recherche de la localisation...</p>
          </div>
        ) : error || !position ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-stone-500 gap-3 bg-stone-50">
            <p className="text-lg font-medium text-red-400">{error || "Localisation non trouvée"}</p>
            <p className="text-sm text-stone-400">Essayez de préciser la ville ou le pays.</p>
          </div>
        ) : (
          <MapContainer 
            center={position} 
            zoom={13} 
            style={{ width: '100%', height: '100%' }}
            className="z-0"
          >
            <ChangeView center={position} zoom={13} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
              <Popup className="custom-popup" minWidth={200} maxWidth={300}>
                <div className="flex flex-col gap-2">
                  <div className="w-full aspect-video rounded-md overflow-hidden bg-stone-100 border border-stone-200">
                    <img 
                      src={image} 
                      alt={location} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="font-bold text-center text-stone-700 capitalize mt-1">
                    {location}
                  </div>
                  {message && (
                     <div className="text-xs text-stone-500 text-center line-clamp-2 italic">
                       &quot;{message}&quot;
                     </div>
                  )}
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
