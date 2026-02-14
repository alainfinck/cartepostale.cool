'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, ChevronDown, Send, Smile } from 'lucide-react'
import { addComment } from '@/actions/social-actions'

const QUICK_EMOJIS = ['😊', '❤️', '👍', '😍', '✨', '🎉', '🙏', '🌴', '✈️', '💌', '😘', '🌟']

interface Comment {
    id: number
    authorName: string
    content: string
    createdAt: string
}

interface GuestbookSectionProps {
    postcardId: number
    sessionId: string
    comments: Comment[]
    onCommentAdded: (comment: Comment) => void
}

export default function GuestbookSection({
    postcardId,
    sessionId,
    comments,
    onCommentAdded,
}: GuestbookSectionProps) {
    const [isOpen, setIsOpen] = useState(true)
    const [authorName, setAuthorName] = useState('')
    const [content, setContent] = useState('')
    const [isPrivate, setIsPrivate] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const contentRef = useRef<HTMLTextAreaElement>(null)
    const pendingCursorRef = useRef<number | null>(null)

    useEffect(() => {
        if (pendingCursorRef.current == null || !contentRef.current) return
        const pos = pendingCursorRef.current
        pendingCursorRef.current = null
        contentRef.current.focus()
        contentRef.current.setSelectionRange(pos, pos)
    }, [content])

    const insertEmoji = (emoji: string) => {
        const textarea = contentRef.current
        if (textarea) {
            const start = textarea.selectionStart
            const end = textarea.selectionEnd
            const before = content.slice(0, start)
            const after = content.slice(end)
            pendingCursorRef.current = start + emoji.length
            setContent(before + emoji + after)
        } else {
            setContent((prev) => prev + emoji)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!authorName.trim() || !content.trim() || !sessionId || submitting) return

        setSubmitting(true)
        try {
            const result = await addComment(postcardId, authorName.trim(), content.trim(), sessionId, isPrivate)
            if (result.success && result.comment) {
                if (!isPrivate) {
                    onCommentAdded(result.comment as Comment)
                } else {
                    // Start simplified success notification (could be improved with a toast)
                    alert("Message privé envoyé avec succès !")
                }
                setContent('')
                setIsPrivate(false)
            }
        } finally {
            setSubmitting(false)
        }
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    return (
        <div className="w-full">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white border border-stone-200 hover:border-stone-300 transition-colors cursor-pointer"
            >
                <div className="flex items-center gap-2 text-stone-700">
                    <BookOpen size={18} />
                    <span className="font-medium text-sm">
                        Livre {"d'or"} {comments.length > 0 && `(${comments.length})`}
                    </span>
                </div>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown size={18} className="text-stone-400" />
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-3 space-y-3">
                            {/* Comment form */}
                            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-stone-200 p-4 space-y-3">
                                <input
                                    type="text"
                                    placeholder="Votre prénom"
                                    value={authorName}
                                    onChange={(e) => setAuthorName(e.target.value)}
                                    maxLength={50}
                                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                                <div>
                                    <div className="flex items-center gap-1.5 mb-2">
                                        <Smile size={16} className="text-stone-400 shrink-0" />
                                        <span className="text-xs font-medium text-stone-500">Ajouter un emoji :</span>
                                        <div className="flex flex-wrap gap-1">
                                            {QUICK_EMOJIS.map((emoji) => (
                                                <button
                                                    key={emoji}
                                                    type="button"
                                                    onClick={() => insertEmoji(emoji)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-lg hover:bg-stone-100 transition-colors"
                                                    title={`Insérer ${emoji}`}
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <textarea
                                        ref={contentRef}
                                        placeholder="Votre message..."
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        maxLength={500}
                                        rows={3}
                                        className="w-full px-3 py-2 rounded-lg border border-stone-200 text-base resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer text-sm text-stone-600 select-none">
                                        <input
                                            type="checkbox"
                                            checked={isPrivate}
                                            onChange={(e) => setIsPrivate(e.target.checked)}
                                            className="rounded border-stone-300 text-teal-600 focus:ring-teal-500 w-4 h-4"
                                        />
                                        <span>Message privé (visible uniquement par le destinataire)</span>
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-stone-400 hidden sm:inline">{content.length}/500</span>
                                        <button
                                            type="submit"
                                            disabled={!authorName.trim() || !content.trim() || submitting}
                                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Send size={14} />
                                            {submitting ? 'Envoi...' : 'Envoyer'}
                                        </button>
                                    </div>
                                </div>
                            </form>

                            {/* Comments list */}
                            {comments.length > 0 && (
                                <div className="space-y-2">
                                    {comments.map((comment, index) => (
                                        <motion.div
                                            key={comment.id}
                                            initial={index === 0 ? { opacity: 0, y: -10 } : false}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-white rounded-xl border border-stone-200 p-4"
                                        >
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="font-medium text-sm text-stone-800">
                                                    {comment.authorName}
                                                </span>
                                                <span className="text-xs text-stone-400">
                                                    {formatDate(comment.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-stone-600 whitespace-pre-wrap">
                                                {comment.content}
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {comments.length === 0 && (
                                <p className="text-center text-sm text-stone-400 py-4">
                                    Soyez le premier à laisser un message !
                                </p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
