'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'

interface DistanceDisplayProps {
    targetCoords?: {
        lat: number
        lng: number
    }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const d = R * c // Distance in km
    return Math.round(d)
}

function deg2rad(deg: number): number {
    return deg * (Math.PI / 180)
}

export default function DistanceDisplay({ targetCoords, senderName }: DistanceDisplayProps & { senderName: string }) {
    const [distance, setDistance] = useState<number | null>(null)
    const [permissionGranted, setPermissionGranted] = useState(false)

    useEffect(() => {
        if (!targetCoords) return

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setPermissionGranted(true)
                    const d = calculateDistance(
                        position.coords.latitude,
                        position.coords.longitude,
                        targetCoords.lat,
                        targetCoords.lng
                    )
                    setDistance(d)
                },
                (error) => {
                    console.log('Error getting location', error)
                }
            )
        }
    }, [targetCoords])

    if (!targetCoords || distance === null) return null

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5, duration: 1.2 }}
            className="flex justify-center mt-2 mb-2"
        >
            <div className="bg-white/90 backdrop-blur-md border border-stone-200 text-stone-700 px-6 py-3 rounded-2xl shadow-lg flex items-center gap-3 text-lg font-medium transform hover:scale-105 transition-transform duration-300">
                <MapPin size={24} className="text-teal-600" />
                <span>
                    Vous êtes à <span className="text-teal-600 font-bold text-lg sm:text-xl">{distance.toLocaleString()} km</span> de <span className="font-bold">{senderName}</span> ! <span className="text-sm sm:text-base leading-none shrink-0">🌍</span>
                </span>
            </div>
        </motion.div>
    )
}
