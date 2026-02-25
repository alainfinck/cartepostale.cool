import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Eye, EyeOff, Loader2, Globe, X, Map as MapIcon } from 'lucide-react'
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
  const [container, setContainer] = useState<HTMLElement | null>(null)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    const el = map.getContainer()
    setContainer(el)
  }, [map])

  // Initial animation: world to destination by steps (paliers)
  useEffect(() => {
    if (!hasAnimated && map) {
      // First, center the view on the target but keep the world zoom level
      map.setView(center, 2, { animate: false })

      let currentStepZoom = 2
      const targetZoom = zoom
      let timer: NodeJS.Timeout

      const step = () => {
        if (currentStepZoom < targetZoom) {
          currentStepZoom += 1
          map.setZoom(currentStepZoom, { animate: true })
          timer = setTimeout(step, 600)
        } else {
          setHasAnimated(true)
        }
      }

      // Slightly longer delay for modal transition to finish
      timer = setTimeout(step, 1000)

      return () => clearTimeout(timer)
    }
  }, [map, center, zoom, hasAnimated])

  // Handle standard zoom/center changes AFTER initial animation
  useEffect(() => {
    if (hasAnimated) {
      map.setView(center, zoom)
    }
  }, [center, zoom, map, hasAnimated])

  useEffect(() => {
    if (!container) return

    const resizeObserver = new ResizeObserver(() => {
      const timer = setTimeout(() => {
        map.invalidateSize()
      }, 200)
      return () => clearTimeout(timer)
    })

    resizeObserver.observe(container)

    // Leaflet fix for grey map in hidden/animated containers
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 500)

    return () => {
      resizeObserver.disconnect()
      clearTimeout(timer)
    }
  }, [container, map])

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
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setPortalRoot(document.body)
  }, [])

  // Lock body scroll when modal open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isOpen])

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

  if (!isOpen || !portalRoot) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={cn(
          'bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-stone-200 animate-in fade-in zoom-in-95 duration-200',
          isLarge
            ? 'w-[95vw] h-[75dvh] md:w-[85vw] md:h-[80dvh] max-w-6xl'
            : 'w-[92vw] h-[65dvh] sm:w-[600px] sm:h-[450px]',
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

        {photoLocations.length > 0 && (
          <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
            <button
              onClick={() => setShowPhotos(!showPhotos)}
              className={cn(
                'bg-white/95 hover:bg-white p-3 rounded-2xl transition-all shadow-xl border-2 flex items-center gap-3 font-bold text-sm min-w-[140px]',
                showPhotos
                  ? 'text-teal-600 border-teal-200 shadow-teal-100/50'
                  : 'text-stone-500 border-stone-100 shadow-stone-100/50',
              )}
            >
              <div
                className={cn(
                  'w-10 h-5 rounded-full relative transition-colors duration-200',
                  showPhotos ? 'bg-teal-500' : 'bg-stone-200',
                )}
              >
                <div
                  className={cn(
                    'absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-200',
                    showPhotos ? 'left-6' : 'left-1',
                  )}
                />
              </div>
              <span className="whitespace-nowrap">Galerie Photos</span>
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-stone-500 gap-3">
            <Loader2 className="animate-spin text-teal-500" size={48} />
            <p className="font-medium">Localisation de votre souvenir...</p>
          </div>
        ) : error || !position ? (
          <div className="flex-1 flex flex-col items-center justify-center text-stone-500 gap-3 bg-stone-50">
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
          <div className="flex-1 min-h-0 w-full">
            <MapContainer
              center={[20, 0]}
              zoom={2}
              scrollWheelZoom={true}
              wheelPxPerZoomLevel={60}
              zoomSnap={0.1}
              zoomDelta={0.5}
              style={{ width: '100%', height: '100%' }}
              className="z-0"
            >
              <LeafletFix />
              <MapEffects center={position} zoom={7} />

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

              <Marker
                position={position}
                icon={
                  new L.Icon({
                    iconUrl:
                      'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                    shadowUrl:
                      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41],
                  })
                }
              >
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
          </div>
        )}
      </div>
    </div>,
    portalRoot,
  )
}

export default MapModal
