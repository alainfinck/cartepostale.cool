'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye } from 'lucide-react'
import { CoolMode } from '@/components/ui/cool-mode'
import { NumberTicker } from '@/components/ui/number-ticker'
import { toggleReaction } from '@/actions/social-actions'

const EMOJIS = ['❤️', '🔥', '😂', '😮', '👏', '🌟']

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

    const handleToggle = async (emoji: string) => {
        if (!sessionId || loading) return
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
        <div className="flex flex-wrap items-center gap-2">
            {EMOJIS.map((emoji) => {
                const isActive = userReactions[emoji]
                const count = counts[emoji] || 0

                return (
                    <CoolMode key={emoji} options={{ particle: emoji, particleCount: 8, size: 20 }}>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleToggle(emoji)}
                            disabled={loading === emoji}
                            className={`
                                flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm
                                transition-colors duration-200 cursor-pointer
                                ${isActive
                                    ? 'bg-teal-50 border-teal-400 text-teal-700'
                                    : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                                }
                                ${loading === emoji ? 'opacity-50' : ''}
                            `}
                        >
                            <span className="text-base">{emoji}</span>
                            {count > 0 && (
                                <NumberTicker
                                    value={count}
                                    className="text-xs font-medium text-inherit"
                                />
                            )}
                        </motion.button>
                    </CoolMode>
                )
            })}

            {/* Views counter */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-50 border border-stone-200 text-stone-500 text-sm ml-auto">
                <Eye size={14} />
                <NumberTicker value={views} className="text-xs font-medium text-stone-500" />
            </div>
        </div>
    )
}
