'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Reply, MapPin, Heart, Sparkles } from 'lucide-react'
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
  isDemo?: boolean
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
  isDemo = false,
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
    if (!sessionId || isDemo) {
      if (isDemo) setLoaded(true)
      return
    }

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
      className="w-full max-w-4xl mx-auto px-4 pb-8 pt-6 space-y-4"
    >
      <div className="rounded-3xl border border-teal-100/50 bg-white/90 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-3 py-6 sm:px-10 sm:py-10 relative overflow-hidden mt-4">
        <div className="absolute top-0 right-0 w-40 h-40 bg-teal-50/60 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-50/60 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-teal-50 text-teal-600 rounded-full mb-4 shadow-sm border border-teal-100 relative group">
            <Heart size={24} className="group-hover:scale-110 transition-transform duration-300" />
            <Sparkles
              size={14}
              className="absolute -top-1 -right-1 text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
          </div>
          <h2
            id="reactions-heading"
            className="text-xl sm:text-2xl font-serif font-bold text-stone-800 mb-2"
          >
            Réagissez à la carte
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto mb-2 px-2">
            Faites savoir à {senderName} que vous avez apprécié sa carte en choisissant une réaction
            !
          </p>
        </div>

        <div className="relative z-10 w-full overflow-hidden">
          <ReactionBar
            postcardId={postcardId}
            sessionId={sessionId}
            counts={counts}
            userReactions={userReactions}
            views={views}
            onReactionUpdate={handleReactionUpdate}
          />
        </div>
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
        className="w-full max-w-4xl mx-auto px-4 space-y-8 mb-4"
      >
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Reactions: inline si pas de portal, sinon déjà rendues sous la carte */}
          {!reactionsPortalTargetId && reactionBarNode}

          {/* Interactions Section */}
          <section
            aria-labelledby="interaction-heading"
            className="rounded-3xl border border-stone-100/80 bg-white/60 backdrop-blur-md shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-4 sm:p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6 pb-4 border-b border-stone-100">
              <div>
                <h3
                  id="interaction-heading"
                  className="text-lg font-serif font-bold text-stone-800"
                >
                  Livre d'or et partage
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  Laissez un mot à {senderName}
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <Link
                  href={`/editor?replyTo=${encodeURIComponent(senderName)}`}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border border-stone-200 text-stone-600 text-xs sm:text-sm font-medium hover:bg-stone-50 transition-colors"
                >
                  <Reply size={16} />
                  Répondre
                </Link>
                <ShareButton postcardId={postcardId} publicId={publicId} senderName={senderName} />
              </div>
            </div>

            {/* Guestbook */}
            {allowComments && (
              <div className="">
                <GuestbookSection
                  postcardId={postcardId}
                  sessionId={sessionId}
                  comments={comments}
                  onCommentAdded={handleCommentAdded}
                />
              </div>
            )}
          </section>
        </div>
      </motion.div>
    </>
  )
}
