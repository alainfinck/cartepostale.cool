import React from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
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

  // Initial animation: world to destination by steps (paliers)
  React.useEffect(() => {
    if (!hasAnimated && map) {
      // First, center the view on the target but keep the world zoom level (no animation for this jump)
      map.setView(center, 1, { animate: false })

      let currentStepZoom = 1
      const targetZoom = zoom
      let timer: NodeJS.Timeout

      const step = () => {
        if (currentStepZoom < targetZoom) {
          currentStepZoom += 1
          // Increment zoom level
          map.setZoom(currentStepZoom, { animate: true })
          // Wait 600ms before next step to create a distinct "step" effect
          timer = setTimeout(step, 600)
        } else {
          setHasAnimated(true)
        }
      }

      // Start the sequence after a slight delay
      timer = setTimeout(step, 800)

      return () => clearTimeout(timer)
    }
  }, [map, center, zoom, hasAnimated])

  // Handle standard zoom/center changes (e.g. from buttons) AFTER initial animation
  React.useEffect(() => {
    if (hasAnimated) {
      map.setView(center, zoom)
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
  // Prevent click propagation to parent if needed, but we typically want the click to trigger the full map
  const position: [number, number] = [coords.lat, coords.lng]

  return (
    <div className={cn('relative w-full h-full z-0', className)} onClick={onClick}>
      {/* ... comments ... */}
      <MapContainer
        center={[20, 0]}
        zoom={1}
        zoomControl={false}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        touchZoom={false}
        attributionControl={false}
        style={{ width: '100%', height: '100%' }}
      >
        <LeafletFix />
        <ChangeView center={position} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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

      {/* Overlay to prevent interactions if we want it to be strictly a static-like view that opens modal on click
          Leaflet captures clicks, so we might need a transparent overlay to capture the 'onClick' for the parent modal 
      */}
      <div className="absolute inset-0 z-[1000] cursor-pointer" onClick={onClick} />
    </div>
  )
}

export default MiniMap
