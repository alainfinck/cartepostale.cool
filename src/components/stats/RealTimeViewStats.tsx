'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, TrendingUp, Sparkles } from 'lucide-react'
import { NumberTicker } from '@/components/ui/number-ticker'
import confetti from 'canvas-confetti'

interface RealTimeViewStatsProps {
  postcardId: number
  initialViews?: number
  pollingInterval?: number // in milliseconds, default 5000 (5s)
  className?: string
}

export default function RealTimeViewStats({
  postcardId,
  initialViews = 0,
  pollingInterval = 5000,
  className = '',
}: RealTimeViewStatsProps) {
  const [views, setViews] = useState(initialViews)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showSparkle, setShowSparkle] = useState(false)
  const previousViews = useRef(initialViews)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch updated view count
  const fetchViews = useCallback(async () => {
    try {
      const response = await fetch(`/api/postcards/${postcardId}/views`)
      if (!response.ok) {
        console.error('Failed to fetch view stats')
        return
      }
      const data = await response.json()
      const newViews = data.views || 0

      // Check if views increased
      if (newViews > previousViews.current) {
        setIsUpdating(true)
        setShowSparkle(true)

        // Trigger subtle confetti
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.6 },
          colors: ['#14b8a6', '#f59e0b', '#3b82f6'],
          scalar: 0.8,
        })

        // Reset animations after delay
        setTimeout(() => {
          setIsUpdating(false)
          setShowSparkle(false)
        }, 1500)
      }

      previousViews.current = newViews
      setViews(newViews)
    } catch (error) {
      console.error('Error fetching view stats:', error)
    }
  }, [postcardId])

  // Setup polling
  useEffect(() => {
    // Fetch immediately on mount
    fetchViews()

    // Setup interval
    intervalRef.current = setInterval(() => {
      fetchViews()
    }, pollingInterval)

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchViews, pollingInterval])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-br from-white to-teal-50/50 border border-teal-100 shadow-lg shadow-teal-500/10 ${className}`}
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent rounded-2xl" />

      {/* Sparkle animation overlay */}
      <AnimatePresence>
        {showSparkle && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.5, opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-teal-400 w-8 h-8" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Eye icon with pulse animation */}
      <motion.div
        animate={{
          scale: isUpdating ? [1, 1.2, 1] : 1,
        }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <Eye size={24} className="text-teal-600 relative z-10" />
        {isUpdating && (
          <motion.div
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="absolute inset-0 bg-teal-400 rounded-full blur-md"
          />
        )}
      </motion.div>

      {/* View count with animation */}
      <div className="flex flex-col">
        <motion.div
          animate={{
            scale: isUpdating ? [1, 1.1, 1] : 1,
          }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-black text-stone-800 tracking-tight leading-none"
        >
          <NumberTicker value={views} />
        </motion.div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
          {views === 1 ? 'vue' : 'vues'}
        </span>
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-1.5 ml-2">
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-2 h-2 bg-teal-500 rounded-full"
        />
        <span className="text-[9px] font-bold uppercase tracking-widest text-teal-600">
          En direct
        </span>
      </div>

      {/* Trending indicator when views increase */}
      <AnimatePresence>
        {isUpdating && (
          <motion.div
            initial={{ opacity: 0, scale: 0, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full p-1.5 shadow-lg"
          >
            <TrendingUp size={14} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
