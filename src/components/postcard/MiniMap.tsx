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
  /** When true, parent renders the PHOTOS toggle above the map; MiniMap does not render it. */
  toggleOutside?: boolean
  /** Controlled visibility of photo markers (used when toggleOutside is true). */
  showPhotos?: boolean
  onShowPhotosChange?: (show: boolean) => void
  /** Afficher l'échelle de distance (désactivé sur la mini-carte au dos). */
  showScale?: boolean
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
  const [isInView, setIsInView] = React.useState(false)

  React.useEffect(() => {
    const el = map.getContainer()
    setContainer(el)
  }, [map])

  // Detect when map is in view to start animation
  React.useEffect(() => {
    if (!container || hasAnimated) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
        }
      },
      { threshold: 0.2 },
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [container, hasAnimated])

  // Initial animation: world to destination smoothly
  React.useEffect(() => {
    if (!hasAnimated && map && isInView) {
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
  }, [map, center, zoom, hasAnimated, isInView])

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
  toggleOutside = false,
  showPhotos: controlledShowPhotos,
  onShowPhotosChange,
  showScale: showScaleProp = true,
}) => {
  const [isInteractive, setIsInteractive] = React.useState(false)
  const [internalShowPhotos, setInternalShowPhotos] = React.useState(true)
  const showPhotos = controlledShowPhotos ?? internalShowPhotos
  const setShowPhotos = onShowPhotosChange != null ? onShowPhotosChange : setInternalShowPhotos

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
    <div className={cn('flex flex-col w-full h-full', className)} onClick={onClick}>
      <style jsx global>{`
        .minimap-controls .leaflet-control-zoom {
          border: none !important;
        }
        .minimap-controls .leaflet-bar {
          border: none !important;
          box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
          border-radius: 6px;
          overflow: hidden;
        }
        .minimap-controls .leaflet-control-zoom a {
          width: 28px !important;
          height: 28px !important;
          line-height: 28px !important;
          font-size: 18px !important;
          text-indent: 0;
        }
        .minimap-controls .leaflet-touch .leaflet-control-zoom a {
          width: 28px !important;
          height: 28px !important;
          line-height: 28px !important;
        }
      `}</style>

      {/* Ligne 2 cols : Explorer / Verrouiller (toggle) | Toggle Photos (si toggleOutside) */}
      {interactive || (toggleOutside && photoLocations.length > 0) ? (
        <div className={cn('shrink-0 grid gap-2 mb-2', toggleOutside && photoLocations.length > 0 ? 'grid-cols-2' : 'grid-cols-1')}>
          <div className={cn('min-w-0', toggleOutside && photoLocations.length > 0 ? '' : 'col-span-1')}>
            {interactive && (
              <>
                {!isInteractive ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsInteractive(true)
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-white/95 hover:bg-white border border-stone-200 shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <div className="bg-teal-50 w-7 h-7 rounded-lg flex items-center justify-center text-teal-600 shrink-0">
                      <Navigation size={14} className="animate-pulse" />
                    </div>
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-[9px] font-black uppercase tracking-widest text-stone-800 leading-tight truncate w-full text-left">
                        Explorer la carte
                      </span>
                      <span className="text-[7px] font-bold text-stone-400 uppercase tracking-tighter truncate w-full text-left">
                        Zoomer et naviguer
                      </span>
                    </div>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsInteractive(false)
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-white/90 hover:bg-white border border-stone-200 shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] font-bold text-[9px] sm:text-[10px] uppercase tracking-widest text-stone-800"
                  >
                    <Lock size={14} className="text-teal-600 shrink-0" />
                    <span>Verrouiller</span>
                  </button>
                )}
              </>
            )}
          </div>
          <div className="min-w-0 flex items-stretch">
            {toggleOutside && photoLocations.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowPhotos(!showPhotos)
                }}
                className={cn(
                  'w-full py-2 px-3 rounded-xl shadow-sm border-2 transition-all active:scale-95 flex items-center justify-center gap-2 font-bold text-[9px] uppercase tracking-widest',
                  showPhotos
                    ? 'bg-teal-600 text-white border-teal-400'
                    : 'bg-white/95 text-stone-600 border-stone-100',
                )}
              >
                <div
                  className={cn(
                    'w-5 h-2.5 rounded-full relative transition-colors duration-200 shrink-0',
                    showPhotos ? 'bg-white/30' : 'bg-stone-200',
                  )}
                >
                  <div
                    className={cn(
                      'absolute top-0.5 w-1.5 h-1.5 rounded-full transition-all duration-200 shadow-sm',
                      showPhotos ? 'left-3 bg-white' : 'left-0.5 bg-white',
                    )}
                  />
                </div>
                <span className="truncate">Photos</span>
              </button>
            )}
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          'relative w-full minimap-controls z-0',
          interactive && !isInteractive ? 'flex-1 min-h-0' : 'h-full',
        )}
      >
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
        {showScaleProp && <ScaleControl position="bottomleft" />}
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

        {/* Toggle Photos — sous Verrouiller (top-14 pour laisser la place au bouton verrouiller) */}
      {photoLocations.length > 0 && !toggleOutside && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowPhotos(!showPhotos)
          }}
          className={cn(
            'absolute top-14 right-2 sm:right-4 z-[1002] px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl shadow-lg border-2 transition-all active:scale-95 flex items-center gap-2 sm:gap-3 font-bold text-[10px] sm:text-xs',
            showPhotos
              ? 'bg-teal-600 text-white border-teal-400'
              : 'bg-white/95 text-stone-600 border-stone-100',
          )}
        >
          <div
            className={cn(
              'w-6 h-3 sm:w-8 sm:h-4 rounded-full relative transition-colors duration-200 shrink-0',
              showPhotos ? 'bg-white/30' : 'bg-stone-200',
            )}
          >
            <div
              className={cn(
                'absolute top-0.5 w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-200 shadow-sm',
                showPhotos ? 'left-3.5 sm:left-4.5 bg-white' : 'left-0.5 bg-white',
              )}
            />
          </div>
          <span className="uppercase tracking-widest">Photos</span>
        </button>
      )}

        {/* Overlay cliquable sur la carte pour activer le mode interactif */}
        {interactive && !isInteractive && (
          <div
            className="absolute inset-0 z-[999] cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              setIsInteractive(true)
            }}
            aria-label="Activer l’exploration de la carte"
          />
        )}

      </div>
    </div>
  )
}

export default MiniMap
