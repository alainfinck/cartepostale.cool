import React from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  ScaleControl,
  ZoomControl,
  LayersControl,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { cn } from '@/lib/utils'
import PhotoMarker, { PhotoLocation } from '@/components/ui/PhotoMarker'
import LeafletFix from '@/components/ui/LeafletFix'

interface MiniMapProps {
  coords: { lat: number; lng: number }
  zoom: number
  className?: string
  onClick?: (e: React.MouseEvent) => void
  photoLocations?: PhotoLocation[]
  interactive?: boolean
}

function InteractionHandler({ isInteractive }: { isInteractive: boolean }) {
  const map = useMap()

  React.useEffect(() => {
    if (!map) return

    if (isInteractive) {
      map.dragging.enable()
      map.scrollWheelZoom.enable()
      map.doubleClickZoom.enable()
      map.touchZoom.enable()
    } else {
      map.dragging.disable()
      map.scrollWheelZoom.disable()
      map.doubleClickZoom.disable()
      map.touchZoom.disable()
    }
  }, [map, isInteractive])

  return null
}

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  const [container, setContainer] = React.useState<HTMLElement | null>(null)
  const [hasAnimated, setHasAnimated] = React.useState(false)

  React.useEffect(() => {
    const el = map.getContainer()
    setContainer(el)
  }, [map])

  // Initial animation: world to destination smoothly
  React.useEffect(() => {
    if (!hasAnimated && map) {
      // Force initial world view immediately just in case
      map.setView([20, 0], 1, { animate: false })

      const animationTimer = setTimeout(() => {
        if (!map) return

        const container = map.getContainer()
        if (!container || container.offsetWidth === 0) {
          // Map is hidden or not in DOM with size yet, skip animation for now
          // and mark as animated so it just shows the destination next time
          setHasAnimated(true)
          return
        }

        // Safety check to prevent Leaflet crashes if coords are invalid
        const isValidCenter = center && !isNaN(center[0]) && !isNaN(center[1])
        const isValidZoom = typeof zoom === 'number' && !isNaN(zoom)

        if (isValidCenter && isValidZoom) {
          try {
            // Force a size recalculation before animating
            map.invalidateSize()

            map.flyTo(center, zoom, {
              animate: true,
              duration: 5,
              easeLinearity: 0.25,
              noMoveStart: true,
            })
          } catch (err) {
            console.error('MiniMap: flyTo failed', err)
            setHasAnimated(true)
          }
        } else {
          console.warn('MiniMap: Invalid center or zoom for initial animation', { center, zoom })
          setHasAnimated(true) // Don't try again
          return
        }

        // Once the movement is finished, we mark it as animated
        // to let the other useEffect take over for manual changes
        map.once('moveend', () => {
          setHasAnimated(true)
        })
      }, 800)

      return () => {
        clearTimeout(animationTimer)
      }
    }
  }, [map, center, zoom, hasAnimated])

  const prevZoomRef = React.useRef(zoom)
  const prevCenterRef = React.useRef(center)

  // Sync manual zoom changes back to parent state if needed
  React.useEffect(() => {
    const onZoomEnd = () => {
      prevZoomRef.current = map.getZoom()
    }
    const onMoveEnd = () => {
      const c = map.getCenter()
      prevCenterRef.current = [c.lat, c.lng]
    }
    map.on('zoomend', onZoomEnd)
    map.on('moveend', onMoveEnd)
    return () => {
      map.off('zoomend', onZoomEnd)
      map.off('moveend', onMoveEnd)
    }
  }, [map])

  // Handle standard zoom/center changes (e.g. from buttons) AFTER initial animation
  React.useEffect(() => {
    const zoomChanged = zoom !== prevZoomRef.current
    const centerChanged =
      center[0] !== prevCenterRef.current[0] || center[1] !== prevCenterRef.current[1]

    if (hasAnimated && (zoomChanged || centerChanged)) {
      const isValidCenter = center && !isNaN(center[0]) && !isNaN(center[1])
      const isValidZoom = typeof zoom === 'number' && !isNaN(zoom)

      if (isValidCenter && isValidZoom) {
        map.setView(center, zoom, {
          animate: true,
          duration: 0.8,
          easeLinearity: 0.25,
        })
        prevZoomRef.current = zoom
        prevCenterRef.current = center
      }
    }
  }, [center, zoom, map, hasAnimated])

  React.useEffect(() => {
    if (!container) return

    const resizeObserver = new ResizeObserver(() => {
      // Small timeout to allow the browser to finish layout before Leaflet recalculates
      const timer = setTimeout(() => {
        map.invalidateSize()
      }, 200)
      return () => clearTimeout(timer)
    })

    resizeObserver.observe(container)

    // Initial fix for hidden/animated containers
    const initialTimer = setTimeout(() => {
      map.invalidateSize()
    }, 500)

    return () => {
      resizeObserver.disconnect()
      clearTimeout(initialTimer)
    }
  }, [container, map])

  return null
}

import { Lock, Navigation } from 'lucide-react'

const MiniMap: React.FC<MiniMapProps> = ({
  coords,
  zoom,
  className,
  onClick,
  photoLocations = [],
  interactive = false,
}) => {
  const [isInteractive, setIsInteractive] = React.useState(false)
  const [showPhotos, setShowPhotos] = React.useState(true)

  // Auto-lock when scrolling the page
  React.useEffect(() => {
    if (!isInteractive) return

    const handleWindowScroll = () => {
      setIsInteractive(false)
    }

    // Use passive listener for performance
    window.addEventListener('scroll', handleWindowScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleWindowScroll)
  }, [isInteractive])

  // Prevent position array from being recreated on every render
  const position = React.useMemo<[number, number]>(
    () => [coords.lat, coords.lng],
    [coords.lat, coords.lng],
  )

  return (
    <div className={cn('relative w-full h-full z-0', className)} onClick={onClick}>
      {/* ... comments ... */}
      <MapContainer
        center={[20, 0]}
        zoom={1}
        zoomControl={false}
        scrollWheelZoom={true}
        wheelPxPerZoomLevel={60}
        zoomSnap={0} // Completely fluid zoom
        zoomAnimation={true}
        fadeAnimation={true}
        markerZoomAnimation={true}
        dragging={true}
        doubleClickZoom={true}
        touchZoom={true}
        attributionControl={false}
        style={{ width: '100%', height: '100%' }}
      >
        <LeafletFix />
        <ChangeView center={position} zoom={zoom} />
        <InteractionHandler isInteractive={isInteractive} />
        {!isInteractive ? (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        ) : (
          <>
            <ZoomControl position="bottomright" />
            <LayersControl position="topleft">
              <LayersControl.BaseLayer checked name="Plan">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </LayersControl.BaseLayer>

              <LayersControl.BaseLayer name="Satellite">
                <TileLayer
                  attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community"
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
              </LayersControl.BaseLayer>

              <LayersControl.BaseLayer name="Hybride">
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
          </>
        )}
        <ScaleControl position="bottomleft" />
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
        />
        {showPhotos && photoLocations.map((loc) => <PhotoMarker key={loc.id} location={loc} />)}
      </MapContainer>

      {/* Photo Toggle Button */}
      {photoLocations.length > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowPhotos(!showPhotos)
          }}
          className={cn(
            'absolute top-4 left-16 z-[1002] px-4 py-2.5 rounded-2xl shadow-2xl border-2 transition-all active:scale-95 flex items-center gap-3 font-bold text-xs',
            showPhotos
              ? 'bg-teal-600 text-white border-teal-400'
              : 'bg-white/95 text-stone-600 border-stone-100',
          )}
        >
          <div
            className={cn(
              'w-8 h-4 rounded-full relative transition-colors duration-200',
              showPhotos ? 'bg-white/30' : 'bg-stone-200',
            )}
          >
            <div
              className={cn(
                'absolute top-0.5 w-3 h-3 rounded-full transition-all duration-200 shadow-sm',
                showPhotos ? 'left-4.5 bg-white' : 'left-0.5 bg-white',
              )}
            />
          </div>
          <span className="uppercase tracking-widest">Photos</span>
        </button>
      )}

      {/* Activation Overlays */}
      {interactive && !isInteractive && (
        <>
          {/* Full area transparent overlay to catch clicks anywhere on the map */}
          <div
            className="absolute inset-0 z-[999] cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              setIsInteractive(true)
            }}
          />

          {/* Discreet button in corner as visual hint */}
          <div className="absolute top-4 right-4 z-[1000] pointer-events-none">
            <div className="bg-white/95 px-4 py-2 rounded-xl shadow-xl border border-stone-200 flex items-center gap-2 transform hover:scale-105 transition-all duration-300">
              <div className="bg-teal-50 w-8 h-8 rounded-lg flex items-center justify-center text-teal-600">
                <Navigation size={16} className="animate-pulse" />
              </div>
              <div className="flex flex-col">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-800 leading-tight">
                  Explorer
                </p>
                <p className="text-[8px] font-bold text-stone-400 uppercase tracking-tighter">
                  Cliquer pour interagir
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Lock button to exit interactive mode */}
      {isInteractive && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsInteractive(false)
          }}
          className="absolute top-4 right-4 z-[1001] bg-white/90 hover:bg-white text-stone-800 px-4 py-2 rounded-xl shadow-xl border border-stone-200 flex items-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
        >
          <Lock size={14} className="text-teal-600" />
          Verrouiller
        </button>
      )}
    </div>
  )
}

export default MiniMap
