'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Reply } from 'lucide-react'
import { useSessionId } from '@/hooks/useSessionId'
import { getReactions, getUserReactions, getComments, incrementViews } from '@/actions/social-actions'
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
}

export default function SocialBar({
    postcardId,
    publicId,
    senderName,
    initialViews,
    initialShares,
}: SocialBarProps) {
    const sessionId = useSessionId()
    const [counts, setCounts] = useState<Record<string, number>>({})
    const [userReactions, setUserReactions] = useState<Record<string, boolean>>({})
    const [comments, setComments] = useState<Comment[]>([])
    const [views] = useState(initialViews + 1) // Optimistic +1
    const [loaded, setLoaded] = useState(false)

    // Load initial data + increment views
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

            // Increment views (fire-and-forget)
            incrementViews(postcardId)
        }

        load()
    }, [postcardId, sessionId])

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
            className="w-full max-w-md mx-auto px-4 space-y-4 mb-8"
        >
            {/* Reactions + Views */}
            <ReactionBar
                postcardId={postcardId}
                sessionId={sessionId}
                counts={counts}
                userReactions={userReactions}
                views={views}
                onReactionUpdate={handleReactionUpdate}
            />

            {/* Share + Reply */}
            <div className="flex items-center gap-2 justify-end">
                <Link
                    href={`/editor?replyTo=${encodeURIComponent(senderName)}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50 transition-colors"
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
