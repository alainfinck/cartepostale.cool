'use client'

import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { cn } from '@/lib/utils'

// Fix for default marker icon in Next.js
const DefaultIcon = L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
})

L.Marker.prototype.options.icon = DefaultIcon

interface MiniMapProps {
    coords: { lat: number; lng: number }
    zoom: number
    className?: string
    onClick?: (e: React.MouseEvent) => void
}

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap()
    useEffect(() => {
        map.setView(center, zoom)
    }, [center, zoom, map])
    return null
}

const MiniMap: React.FC<MiniMapProps> = ({ coords, zoom, className, onClick }) => {
    // Prevent click propagation to parent if needed, but we typically want the click to trigger the full map
    const position: [number, number] = [coords.lat, coords.lng]

    return (
        <div className={cn("relative w-full h-full z-0", className)} onClick={onClick}>
            {/* 
        We use a key to force re-render if we want, but mainly MapContainer manages its own state. 
        However, changing 'center' or 'zoom' props on MapContainer after mount doesn't update the map automatically,
        unless we use a sub-component like ChangeView.
      */}
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
                <ChangeView center={position} zoom={zoom} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position} />
            </MapContainer>

            {/* Overlay to prevent interactions if we want it to be strictly a static-like view that opens modal on click
          Leaflet captures clicks, so we might need a transparent overlay to capture the 'onClick' for the parent modal 
      */}
            <div
                className="absolute inset-0 z-[1000] cursor-pointer"
                onClick={onClick}
            />
        </div>
    )
}

export default MiniMap
