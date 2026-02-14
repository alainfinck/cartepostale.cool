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
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleCalculateDistance = () => {
        if (!targetCoords) return
        setIsLoading(true)
        setError(null)

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const d = calculateDistance(
                        position.coords.latitude,
                        position.coords.longitude,
                        targetCoords.lat,
                        targetCoords.lng
                    )
                    setDistance(d)
                    setIsLoading(false)
                },
                (err) => {
                    console.error('Error getting location', err)
                    setError("Impossible d'accéder à votre position 📍")
                    setIsLoading(false)
                },
                { timeout: 10000 }
            )
        } else {
            setError("La géolocalisation n'est pas supportée par votre navigateur")
            setIsLoading(false)
        }
    }

    if (!targetCoords) return null

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2, duration: 0.8 }}
            className="flex flex-col items-center mt-4 mb-6"
        >
            {distance === null ? (
                <div className="flex flex-col items-center gap-3">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCalculateDistance}
                        disabled={isLoading}
                        className="group relative bg-white/80 hover:bg-white backdrop-blur-md border border-teal-100 hover:border-teal-200 text-teal-700 px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 font-semibold overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-50/50 to-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <MapPin size={20} className={`${isLoading ? 'animate-bounce' : 'group-hover:animate-pulse text-teal-600'}`} />
                        <span className="relative z-10">
                            {isLoading ? 'Calcul en cours...' : 'À quelle distance suis-je ?'}
                        </span>
                        {!isLoading && (
                            <motion.span 
                                initial={{ x: -10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
                                className="relative z-10"
                            >
                                🗺️
                            </motion.span>
                        )}
                    </motion.button>
                    {error && (
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-stone-400 text-xs font-medium"
                        >
                            {error}
                        </motion.p>
                    )}
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="bg-white/95 backdrop-blur-md border border-stone-100 text-stone-700 px-8 py-4 rounded-[2rem] shadow-xl flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left transform hover:scale-[1.02] transition-transform duration-500"
                >
                    <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center shrink-0 shadow-inner">
                        <MapPin size={24} className="text-teal-600 animate-bounce" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-teal-600/60 uppercase tracking-widest mb-0.5">Expédition réussie !</p>
                        <p className="text-lg md:text-xl font-medium">
                            Vous êtes à <span className="text-teal-600 font-black tabular-nums">{distance.toLocaleString()} km</span> de <span className="font-bold text-stone-800">{senderName}</span> ! 🌍
                        </p>
                    </div>
                </motion.div>
            )}
        </motion.div>
    )
}
