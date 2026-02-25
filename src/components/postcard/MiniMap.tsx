import React from 'react'
import { MapContainer, TileLayer, Marker, useMap, ScaleControl } from 'react-leaflet'
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
        map.flyTo(center, zoom, {
          animate: true,
          duration: 5,
          easeLinearity: 0.25,
          noMoveStart: true,
        })

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

  // Handle standard zoom/center changes (e.g. from buttons) AFTER initial animation
  React.useEffect(() => {
    if (hasAnimated) {
      map.setView(center, zoom, {
        animate: true,
        duration: 0.5,
      })
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

const MiniMap: React.FC<MiniMapProps> = ({
  coords,
  zoom,
  className,
  onClick,
  photoLocations = [],
}) => {
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
        zoomSnap={0.1}
        zoomDelta={0.5}
        dragging={true}
        doubleClickZoom={true}
        touchZoom={true}
        attributionControl={false}
        style={{ width: '100%', height: '100%' }}
      >
        <LeafletFix />
        <ChangeView center={position} zoom={zoom} />
        <ScaleControl position="bottomleft" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
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

        {photoLocations.map((loc) => (
          <PhotoMarker
            key={loc.id}
            location={loc}
            // On MiniMap, clicking a photo marker should probably just open the full map
            // or we could let it propagate to the parent onClick
          />
        ))}
      </MapContainer>
    </div>
  )
}

export default MiniMap
