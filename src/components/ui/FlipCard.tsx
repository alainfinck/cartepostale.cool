'use client'

import React from 'react'
import { motion, useSpring, useMotionValue, useTransform, MotionValue } from 'framer-motion'
import { cn } from '@/lib/utils'

interface FlipCardProps {
  /** Content for the front face */
  front: React.ReactNode
  /** Content for the back face */
  back: React.ReactNode
  /** Whether the card is currently flipped to the back */
  isFlipped: boolean
  /** Direction of the flip */
  direction?: 'horizontal' | 'vertical'
  /** Additional classes for the outer container */
  className?: string
  /** Additional classes for the inner 3D container */
  innerClassName?: string
  /** Additional classes for the face containers */
  faceClassName?: string
  /** Custom spring configuration for the rotation */
  springConfig?: {
    stiffness?: number
    damping?: number
    mass?: number
  }
  /** Optional external motion value for rotation (e.g. for keyframe animations) */
  rotation?: MotionValue<number>
  /** Whether to use a spring for the rotation animation (default: true) */
  useSpring?: boolean
  /** Whether to enable the opacity fade during flip to prevent ghosting (Safari fix) */
  enableOpacityFade?: boolean
  /** Optional click handler for the card */
  onClick?: () => void
  /** Optional styles for the root container */
  style?: React.CSSProperties
}

/**
 * A reusable 3D Flip Card component using Framer Motion.
 * Handles Safari backface-visibility fixes and provides a smooth, spring-based flip.
 */
const FlipCard: React.FC<FlipCardProps> = ({
  front,
  back,
  isFlipped,
  direction = 'horizontal',
  className,
  innerClassName,
  faceClassName,
  springConfig = { stiffness: 20, damping: 20 },
  rotation: externalRotation,
  useSpring: useSpringProp = true,
  enableOpacityFade = true,
  onClick,
  style,
}) => {
  const rotateValue = isFlipped ? 180 : 0
  const internalRotation = useMotionValue(rotateValue)
  const rotation = externalRotation || internalRotation
  const internalSpringRotation = useSpring(rotation, springConfig)
  const springRotation = useSpringProp ? internalSpringRotation : rotation

  // Opacity transforms to prevent ghosting during the flip
  // These are derived from the spring value to sync perfectly with the movement
  const frontOpacity = useTransform(springRotation, [88, 92, 268, 272], [1, 0, 0, 1])
  const backOpacity = useTransform(springRotation, [88, 92, 268, 272], [0, 1, 1, 0])

  // Update motion value when isFlipped changes
  React.useEffect(() => {
    if (!externalRotation) {
      rotation.set(rotateValue)
    }
  }, [isFlipped, rotateValue, rotation, externalRotation])

  const isHorizontal = direction === 'horizontal'

  return (
    <div
      className={cn('perspective-1000 relative', className)}
      style={{ ...style, perspective: 1000 }}
      onClick={onClick}
    >
      <motion.div
        className={cn('relative w-full h-full transform-style-3d', innerClassName)}
        style={{
          rotateY: isHorizontal ? springRotation : 0,
          rotateX: isHorizontal ? 0 : springRotation,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Front Face */}
        <motion.div
          className={cn('absolute inset-0 w-full h-full backface-hidden', faceClassName)}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'translateZ(1px)',
            opacity: enableOpacityFade ? frontOpacity : 1,
          }}
        >
          {front}
        </motion.div>

        {/* Back Face */}
        <motion.div
          className={cn('absolute inset-0 w-full h-full backface-hidden', faceClassName)}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: isHorizontal
              ? 'rotateY(180deg) translateZ(1px)'
              : 'rotateX(180deg) translateZ(1px)',
            opacity: enableOpacityFade ? backOpacity : 1,
          }}
        >
          {back}
        </motion.div>
      </motion.div>
    </div>
  )
}

export default FlipCard
