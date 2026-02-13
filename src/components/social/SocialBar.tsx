'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Reply, MapPin } from 'lucide-react'
import { useSessionId } from '@/hooks/useSessionId'
import { getReactions, getUserReactions, getComments } from '@/actions/social-actions'
import { recordPostcardView, recordPostcardViewClose } from '@/actions/analytics-actions'
import ReactionBar from './ReactionBar'
import ShareButton from './ShareButton'
import GuestbookSection from './GuestbookSection'

interface Comment {
    id: number
    authorName: string
    content: string
    createdAt: string
}

interface SocialBarProps {
    postcardId: number
    publicId: string
    senderName: string
    initialViews: number
    initialShares: number
    coords?: { lat: number; lng: number }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return Math.round(d);
}

export default function SocialBar({
    postcardId,
    publicId,
    senderName,
    initialViews,
    initialShares,
    coords,
}: SocialBarProps) {
    const sessionId = useSessionId()
    const [counts, setCounts] = useState<Record<string, number>>({})
    const [userReactions, setUserReactions] = useState<Record<string, boolean>>({})
    const [comments, setComments] = useState<Comment[]>([])
    const [views] = useState(initialViews + 1) // Optimistic +1
    const [loaded, setLoaded] = useState(false)
    const [distance, setDistance] = useState<number | null>(null)
    const eventIdRef = useRef<number | null>(null)
    const openedAtRef = useRef<number>(0)
    const closeSentRef = useRef(false)

    const sendViewClose = () => {
        if (closeSentRef.current || eventIdRef.current == null) return
        closeSentRef.current = true
        const closedAt = new Date().toISOString()
        const durationSeconds = Math.max(0, Math.round((Date.now() - openedAtRef.current) / 1000))
        recordPostcardViewClose({ eventId: eventIdRef.current, closedAt, durationSeconds })
    }

    // Load initial data + record view (open)
    useEffect(() => {
        if (!sessionId) return

        const load = async () => {
            const [reactionsData, userReactionsData, commentsData] = await Promise.all([
                getReactions(postcardId),
                getUserReactions(postcardId, sessionId),
                getComments(postcardId),
            ])

            setCounts(reactionsData.counts)
            setUserReactions(userReactionsData)
            setComments(commentsData)
            setLoaded(true)

            openedAtRef.current = Date.now()
            const result = await recordPostcardView({
                postcardId,
                sessionId,
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
                openedAt: new Date(openedAtRef.current).toISOString(),
                referrer: typeof document !== 'undefined' ? document.referrer || undefined : undefined,
            })
            if (result.success && result.eventId != null) {
                eventIdRef.current = result.eventId
            }
        }

        load()
    }, [postcardId, sessionId])

    // Calculate distance if coords are available
    useEffect(() => {
        if (coords && 'geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const dist = calculateDistance(
                        position.coords.latitude,
                        position.coords.longitude,
                        coords.lat,
                        coords.lng
                    )
                    setDistance(dist)
                },
                (error) => {
                    console.log('Error getting location', error)
                }
            )
        }
    }, [coords])

    // On leave: visibility hidden, pagehide, beforeunload, and unmount
    useEffect(() => {
        const onVisibilityChange = () => {
            if (document.visibilityState === 'hidden') sendViewClose()
        }
        const onPageHide = () => sendViewClose()

        document.addEventListener('visibilitychange', onVisibilityChange)
        window.addEventListener('pagehide', onPageHide)

        return () => {
            document.removeEventListener('visibilitychange', onVisibilityChange)
            window.removeEventListener('pagehide', onPageHide)
            sendViewClose()
        }
    }, [])

    const handleReactionUpdate = (emoji: string, added: boolean, newCount: number) => {
        setCounts((prev) => ({ ...prev, [emoji]: newCount }))
        setUserReactions((prev) => {
            const next = { ...prev }
            if (added) {
                next[emoji] = true
            } else {
                delete next[emoji]
            }
            return next
        })
    }

    const handleCommentAdded = (comment: Comment) => {
        setComments((prev) => [comment, ...prev])
    }

    if (!loaded) {
        return (
            <div className="w-full max-w-md mx-auto px-4 py-6">
                <div className="h-10 bg-stone-100 rounded-full animate-pulse" />
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full max-w-4xl mx-auto px-4 space-y-8 mb-12"
        >
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Reactions + Views */}
                <ReactionBar
                    postcardId={postcardId}
                    sessionId={sessionId}
                    counts={counts}
                    userReactions={userReactions}
                    views={views}
                    onReactionUpdate={handleReactionUpdate}
                />

                {/* Distance display */}
                {distance !== null && (
                    <div className="flex items-center justify-center gap-2 text-stone-500 text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
                        <MapPin size={16} className="text-teal-600" />
                        <span>Vous êtes à <strong>{distance.toLocaleString('fr-FR')} km</strong> de cette carte</span>
                    </div>
                )}

                {/* Share + Reply */}
                <div className="flex items-center gap-2 justify-end">
                    <Link
                        href={`/editor?replyTo=${encodeURIComponent(senderName)}`}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-stone-200 text-stone-600 text-xs sm:text-sm font-medium hover:bg-stone-50 transition-colors"
                    >
                        <Reply size={16} />
                        Répondre avec une carte
                    </Link>
                    <ShareButton
                        postcardId={postcardId}
                        publicId={publicId}
                        senderName={senderName}
                    />
                </div>
            </div>

            {/* Guestbook */}
            <GuestbookSection
                postcardId={postcardId}
                sessionId={sessionId}
                comments={comments}
                onCommentAdded={handleCommentAdded}
            />
        </motion.div>
    )
}
