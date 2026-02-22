'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Eye } from 'lucide-react'
import { CoolMode } from '@/components/ui/cool-mode'
import { NumberTicker } from '@/components/ui/number-ticker'
import { toggleReaction } from '@/actions/social-actions'

const EMOJIS = ['❤️', '🔥', '😂', '😮', '👏', '🌟', '💋', '☕', '🍺', '🎁']

interface ReactionBarProps {
    postcardId: number
    sessionId: string
    counts: Record<string, number>
    userReactions: Record<string, boolean>
    views: number
    onReactionUpdate: (emoji: string, added: boolean, newCount: number) => void
}

export default function ReactionBar({
    postcardId,
    sessionId,
    counts,
    userReactions,
    views,
    onReactionUpdate,
}: ReactionBarProps) {
    const [loading, setLoading] = useState<string | null>(null)
    const lastToggleAtRef = useRef<Record<string, number>>({})
    const TOGGLE_COOLDOWN_MS = 700

    const handleToggle = async (emoji: string) => {
        if (!sessionId || loading) return

        const now = Date.now()
        const lastToggleAt = lastToggleAtRef.current[emoji] ?? 0
        if (now - lastToggleAt < TOGGLE_COOLDOWN_MS) return
        lastToggleAtRef.current[emoji] = now

        setLoading(emoji)

        // Optimistic update
        const wasActive = userReactions[emoji]
        const currentCount = counts[emoji] || 0
        onReactionUpdate(emoji, !wasActive, wasActive ? currentCount - 1 : currentCount + 1)

        try {
            const result = await toggleReaction(postcardId, emoji, sessionId)
            // Sync with server result
            onReactionUpdate(emoji, result.added, result.newCount)
        } catch {
            // Revert on error
            onReactionUpdate(emoji, wasActive, currentCount)
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="flex flex-nowrap items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 sm:pb-4 custom-scrollbar justify-start sm:justify-center mx-auto max-w-full px-1 sm:px-2">
            {EMOJIS.map((emoji) => {
                const isActive = userReactions[emoji]
                const count = counts[emoji] || 0

                return (
                    <CoolMode key={emoji} options={{ particle: emoji, particleCount: 4, size: 28, effect: "balloon", speed: 0.2, gravity: 0.08 }}>
                        <motion.button
                            whileTap={{ scale: 1.15 }}
                            whileHover={{ scale: 1.08 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 15, duration: 0.6 }}
                            onClick={() => handleToggle(emoji)}
                            disabled={loading === emoji}
                            className={`
                                flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 rounded-full border text-xs sm:text-sm
                                transition-all duration-500 ease-out cursor-pointer shadow-sm
                                ${isActive
                                    ? 'bg-teal-50 border-teal-400 text-teal-700 shadow-teal-100/50'
                                    : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50'
                                }
                                ${loading === emoji ? 'opacity-50' : ''}
                            `}
                        >
                            <motion.span
                                className="text-base sm:text-3xl filter drop-shadow-sm"
                                animate={isActive ? { scale: [1, 1.3, 1], rotate: [0, -10, 10, 0] } : { scale: 1, rotate: 0 }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                            >
                                {emoji}
                            </motion.span>
                            {count > 0 && (
                                <NumberTicker
                                    value={count}
                                    className="text-xs sm:text-sm font-bold text-inherit"
                                />
                            )}
                        </motion.button>
                    </CoolMode>
                )
            })}

        </div>
    )
}
