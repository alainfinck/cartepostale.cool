import React from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
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
  map.setView(center, zoom)
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
        center={position}
        zoom={zoom}
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
        <Marker position={position} />

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
