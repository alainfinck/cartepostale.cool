'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Reply, MapPin } from 'lucide-react'
import { useSessionId } from '@/hooks/useSessionId'
import { getReactions, getUserReactions, getComments } from '@/actions/social-actions'
import { recordPostcardView, recordPostcardViewClose } from '@/actions/analytics-actions'
import ReactionBar from './ReactionBar'
import ShareButton from './ShareButton'
import GuestbookSection from './GuestbookSection'
import DistanceDisplay from '../view/DistanceDisplay'

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
  allowComments?: boolean
  /** Id du noeud DOM où afficher la barre de réactions (ex. sous la carte). Si défini, les réactions sont rendues dans ce noeud, le reste en dessous. */
  reactionsPortalTargetId?: string
}

export default function SocialBar({
  postcardId,
  publicId,
  senderName,
  initialViews,
  initialShares,
  coords,
  allowComments = true,
  reactionsPortalTargetId,
}: SocialBarProps) {
  const searchParams = useSearchParams()
  const sessionId = useSessionId()
  const trackingToken = searchParams.get('t') ?? undefined
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [userReactions, setUserReactions] = useState<Record<string, boolean>>({})
  const [comments, setComments] = useState<Comment[]>([])
  const [views] = useState(initialViews + 1) // Optimistic +1
  const [loaded, setLoaded] = useState(false)
  const [portalTargetReady, setPortalTargetReady] = useState(false)
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
        trackingToken,
      })
      if (result.success && result.eventId != null) {
        eventIdRef.current = result.eventId
      }
    }

    load()
  }, [postcardId, sessionId, trackingToken])

  // Pour le portal: la cible peut n'être pas encore en DOM au premier rendu (hydration)
  useEffect(() => {
    if (!reactionsPortalTargetId || typeof document === 'undefined') return
    if (document.getElementById(reactionsPortalTargetId)) setPortalTargetReady(true)
  }, [reactionsPortalTargetId])

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

  const reactionBarNode = (
    <section
      aria-labelledby="reactions-heading"
      className="w-full max-w-4xl mx-auto px-4 pb-2 sm:pb-4 space-y-4"
    >
      <DistanceDisplay targetCoords={coords} senderName={senderName} />
      <div className="rounded-xl border border-stone-200 bg-white/80 backdrop-blur-sm shadow-sm px-4 py-3 sm:px-5 sm:py-4">
        <h2
          id="reactions-heading"
          className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-stone-400 mb-2 sm:mb-3"
        >
          Réactions
        </h2>
        <ReactionBar
          postcardId={postcardId}
          sessionId={sessionId}
          counts={counts}
          userReactions={userReactions}
          views={views}
          onReactionUpdate={handleReactionUpdate}
        />
      </div>
    </section>
  )

  const portalTarget =
    typeof document !== 'undefined' && reactionsPortalTargetId
      ? document.getElementById(reactionsPortalTargetId)
      : null
  const reactionsPortal =
    reactionsPortalTargetId && portalTargetReady && portalTarget
      ? createPortal(reactionBarNode, portalTarget)
      : null

  return (
    <>
      {reactionsPortal}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="w-full max-w-4xl mx-auto px-4 space-y-6 mb-12"
      >
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Reactions: inline si pas de portal, sinon déjà rendues sous la carte */}
          {!reactionsPortalTargetId && reactionBarNode}

          {/* Share + Reply */}
          <div className="flex items-center gap-2 justify-end">
            <Link
              href={`/editor?replyTo=${encodeURIComponent(senderName)}`}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-stone-200 text-stone-600 text-xs sm:text-sm font-medium hover:bg-stone-50 transition-colors"
            >
              <Reply size={16} />
              Répondre avec une carte
            </Link>
            <ShareButton postcardId={postcardId} publicId={publicId} senderName={senderName} />
          </div>
        </div>

        {/* Guestbook */}
        {allowComments && (
          <GuestbookSection
            postcardId={postcardId}
            sessionId={sessionId}
            comments={comments}
            onCommentAdded={handleCommentAdded}
          />
        )}
      </motion.div>
    </>
  )
}
