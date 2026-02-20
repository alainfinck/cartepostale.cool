import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMap } from 'react-leaflet'
import { Camera, Eye, EyeOff, Loader2, Globe, X, Map as MapIcon } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import { cn } from '@/lib/utils'
import PhotoMarker, { PhotoLocation } from './PhotoMarker'
import LeafletFix from './LeafletFix'

interface MapModalProps {
  isOpen: boolean
  onClose: () => void
  location: string
  coords?: { lat: number; lng: number }
  image: string
  message?: string
  isLarge?: boolean
  photoLocations?: PhotoLocation[]
  onPhotoClick?: (mediaItem: any) => void
}

function MapEffects({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  return null
}

const MapModal: React.FC<MapModalProps> = ({
  isOpen,
  onClose,
  location,
  coords,
  image,
  message,
  isLarge = false,
  photoLocations = [],
  onPhotoClick,
}) => {
  const [position, setPosition] = useState<[number, number] | null>(
    coords ? [coords.lat, coords.lng] : null,
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPhotos, setShowPhotos] = useState(true)

  useEffect(() => {
    async function geocode() {
      if (coords) {
        setPosition([coords.lat, coords.lng])
        return
      }

      if (!location) return

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`,
        )
        const data = await response.json()

        if (data && data.length > 0) {
          setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)])
        } else {
          setError('Localisation non trouvée')
        }
      } catch (err) {
        console.error('Geocoding error:', err)
        setError('Erreur de chargement de la carte')
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen) {
      geocode()
    }
  }, [location, coords, isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[150] bg-stone-900/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={cn(
          'bg-white rounded-3xl overflow-hidden shadow-2xl relative flex flex-col transition-all duration-300 border-4 border-white/50',
          isLarge
            ? 'w-[95vw] max-h-[75dvh] h-auto md:w-[85vw] md:max-h-[80dvh] max-w-6xl'
            : 'w-[340px] max-h-[80dvh] h-auto sm:w-[600px] sm:h-[450px]',
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

        {isLarge && photoLocations.length > 0 && (
          <button
            onClick={() => setShowPhotos(!showPhotos)}
            className={cn(
              'absolute top-4 left-16 bg-white/90 hover:bg-white text-stone-600 p-2.5 rounded-full transition-all z-[1000] shadow-xl border-2 border-stone-100 flex items-center gap-2 font-semibold text-xs uppercase tracking-wide',
              showPhotos ? 'text-teal-600' : 'text-stone-400',
            )}
            title={showPhotos ? 'Masquer les photos' : 'Afficher les photos'}
          >
            {showPhotos ? <Eye size={20} /> : <EyeOff size={20} />}
            <span className="hidden sm:inline">
              {showPhotos ? 'Photos visibles' : 'Photos masquées'} ({photoLocations.length})
            </span>
          </button>
        )}

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
            <p className="text-xl font-bold text-stone-800">
              {error || 'Localisation non trouvée'}
            </p>
            <p className="text-sm text-stone-400">
              Nous n&apos;avons pas pu trouver &quot;{location}&quot; sur la carte.
            </p>
          </div>
        ) : (
          <MapContainer
            center={position}
            zoom={13}
            style={{ width: '100%', height: '100%' }}
            className="z-0"
          >
            <LeafletFix />
            <MapEffects center={position} zoom={13} />

            <LayersControl position="topleft">
              <LayersControl.BaseLayer checked name="Plan (OSM)">
                <TileLayer
                  attribution={
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  }
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </LayersControl.BaseLayer>

              <LayersControl.BaseLayer name="Satellite">
                <TileLayer
                  attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community"
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
              </LayersControl.BaseLayer>

              <LayersControl.BaseLayer name="Hybride (Satellite + Routes)">
                <TileLayer
                  attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community"
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
                    <img src={image} alt={location} className="w-full h-full object-cover" />
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

            {showPhotos &&
              photoLocations.map((loc) => (
                <PhotoMarker
                  key={loc.id}
                  location={loc}
                  onClick={(index) => {
                    if (onPhotoClick) {
                      onPhotoClick(loc.mediaItems[index])
                    }
                  }}
                />
              ))}
          </MapContainer>
        )}
      </div>
    </div>
  )
}

export default MapModal
