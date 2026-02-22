'use client'

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Puzzle, RotateCw, Trophy } from 'lucide-react'

interface PuzzleCardProps {
  imageUrl: string
  gridSize?: number
  senderName?: string
  onSolved?: () => void
  children: React.ReactNode
}

interface Tile {
  id: number
  currentIndex: number
  correctIndex: number
}

function shuffleTiles(count: number): Tile[] {
  const tiles: Tile[] = Array.from({ length: count }, (_, i) => ({
    id: i,
    currentIndex: i,
    correctIndex: i,
  }))

  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmpCurrent = tiles[i].currentIndex
    tiles[i].currentIndex = tiles[j].currentIndex
    tiles[j].currentIndex = tmpCurrent
  }

  const isSolved = tiles.every((t) => t.currentIndex === t.correctIndex)
  if (isSolved && count > 1) {
    const tmpCurrent = tiles[0].currentIndex
    tiles[0].currentIndex = tiles[1].currentIndex
    tiles[1].currentIndex = tmpCurrent
  }

  return tiles
}

export default function PuzzleCard({
  imageUrl,
  gridSize = 3,
  senderName,
  onSolved,
  children,
}: PuzzleCardProps) {
  const [isSolved, setIsSolved] = useState(false)
  const [tiles, setTiles] = useState<Tile[]>(() => shuffleTiles(gridSize * gridSize))
  const [selectedTile, setSelectedTile] = useState<number | null>(null)
  const [moveCount, setMoveCount] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState(0)

  const dragTileRef = useRef<number | null>(null)

  useEffect(() => {
    setTiles(shuffleTiles(gridSize * gridSize))
    setMoveCount(0)
    setSelectedTile(null)
  }, [gridSize])

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setContainerSize(Math.min(rect.width, 520))
      }
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  const tileSize = useMemo(() => {
    if (!containerSize) return 0
    return Math.floor(containerSize / gridSize)
  }, [containerSize, gridSize])

  const checkSolved = useCallback(
    (currentTiles: Tile[]) => {
      const solved = currentTiles.every((t) => t.currentIndex === t.correctIndex)
      if (solved) {
        setIsSolved(true)
        setShowCelebration(true)
        onSolved?.()
        setTimeout(() => setShowCelebration(false), 3000)
      }
    },
    [onSolved],
  )

  const swapTiles = useCallback(
    (indexA: number, indexB: number) => {
      if (indexA === indexB) return
      setTiles((prev) => {
        const next = [...prev]
        const tileA = next.find((t) => t.currentIndex === indexA)
        const tileB = next.find((t) => t.currentIndex === indexB)
        if (tileA && tileB) {
          tileA.currentIndex = indexB
          tileB.currentIndex = indexA
        }
        setMoveCount((c) => c + 1)
        checkSolved(next)
        return next
      })
    },
    [checkSolved],
  )

  const handleTileClick = useCallback(
    (currentIndex: number) => {
      if (isSolved) return

      if (selectedTile === null) {
        setSelectedTile(currentIndex)
      } else if (selectedTile === currentIndex) {
        setSelectedTile(null)
      } else {
        swapTiles(selectedTile, currentIndex)
        setSelectedTile(null)
      }
    },
    [selectedTile, isSolved, swapTiles],
  )

  const handleDragStart = useCallback(
    (currentIndex: number) => {
      if (isSolved) return
      dragTileRef.current = currentIndex
    },
    [isSolved],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDrop = useCallback(
    (targetIndex: number) => {
      if (isSolved || dragTileRef.current === null) return
      swapTiles(dragTileRef.current, targetIndex)
      dragTileRef.current = null
      setSelectedTile(null)
    },
    [isSolved, swapTiles],
  )

  const handleTouchStart = useCallback(
    (currentIndex: number, e: React.TouchEvent) => {
      if (isSolved) return
      handleTileClick(currentIndex)
    },
    [isSolved, handleTileClick],
  )

  const resetPuzzle = useCallback(() => {
    setTiles(shuffleTiles(gridSize * gridSize))
    setMoveCount(0)
    setSelectedTile(null)
    setIsSolved(false)
    setShowCelebration(false)
  }, [gridSize])

  const correctCount = tiles.filter((t) => t.currentIndex === t.correctIndex).length
  const totalTiles = gridSize * gridSize
  const progressPct = (correctCount / totalTiles) * 100

  if (isSolved && !showCelebration) {
    return <>{children}</>
  }

  return (
    <div className="relative w-full" ref={containerRef}>
      <AnimatePresence mode="wait">
        {!isSolved ? (
          <motion.div
            key="puzzle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.4 } }}
            className="flex flex-col items-center w-full"
          >
            <div className="mb-5 text-center">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 rounded-full px-5 py-2.5 shadow-sm mb-3">
                <Puzzle size={18} className="text-violet-500" />
                <span className="text-sm font-bold text-violet-700">
                  Reconstituez l&apos;image pour d&eacute;couvrir le message
                  {senderName ? ` de ${senderName}` : ''} !
                </span>
              </div>

              <div className="flex items-center justify-center gap-4 text-xs text-stone-500 font-medium">
                <span>{moveCount} coup{moveCount !== 1 ? 's' : ''}</span>
                <span className="text-stone-300">|</span>
                <span>
                  {correctCount}/{totalTiles} bien plac&eacute;{correctCount !== 1 ? 's' : ''}
                </span>
                <button
                  type="button"
                  onClick={resetPuzzle}
                  className="inline-flex items-center gap-1 text-violet-600 hover:text-violet-700 font-bold transition-colors"
                >
                  <RotateCw size={12} />
                  M&eacute;langer
                </button>
              </div>

              <div className="w-48 h-1.5 mx-auto mt-2 bg-stone-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-violet-400 to-indigo-500 rounded-full"
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>
            </div>

            <div className="relative bg-white rounded-2xl shadow-xl border border-stone-200 p-2 sm:p-3">
              {!imageLoaded && (
                <div
                  className="flex items-center justify-center bg-stone-100 rounded-xl animate-pulse"
                  style={{ width: tileSize * gridSize || 300, height: tileSize * gridSize || 300 }}
                >
                  <Puzzle size={40} className="text-stone-300" />
                </div>
              )}

              <img
                src={imageUrl}
                alt=""
                className="hidden"
                crossOrigin="anonymous"
                onLoad={() => setImageLoaded(true)}
              />

              {imageLoaded && tileSize > 0 && (
                <div
                  className="relative rounded-xl overflow-hidden"
                  style={{
                    width: tileSize * gridSize,
                    height: tileSize * gridSize,
                  }}
                >
                  {tiles.map((tile) => {
                    const fromRow = Math.floor(tile.correctIndex / gridSize)
                    const fromCol = tile.correctIndex % gridSize
                    const toRow = Math.floor(tile.currentIndex / gridSize)
                    const toCol = tile.currentIndex % gridSize
                    const isCorrect = tile.currentIndex === tile.correctIndex
                    const isSelected = selectedTile === tile.currentIndex

                    return (
                      <motion.div
                        key={tile.id}
                        layout
                        initial={false}
                        animate={{
                          x: toCol * tileSize,
                          y: toRow * tileSize,
                          scale: isSelected ? 1.06 : 1,
                          zIndex: isSelected ? 20 : 1,
                        }}
                        transition={{
                          type: 'spring',
                          stiffness: 350,
                          damping: 28,
                        }}
                        className="absolute cursor-pointer select-none"
                        style={{
                          width: tileSize,
                          height: tileSize,
                        }}
                        draggable
                        onDragStart={() => handleDragStart(tile.currentIndex)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(tile.currentIndex)}
                        onClick={() => handleTileClick(tile.currentIndex)}
                        onTouchEnd={(e) => handleTouchStart(tile.currentIndex, e)}
                      >
                        <div
                          className="w-full h-full relative overflow-hidden"
                          style={{
                            outline: isSelected
                              ? '3px solid #8b5cf6'
                              : isCorrect
                                ? '1px solid rgba(16, 185, 129, 0.4)'
                                : '1px solid rgba(0, 0, 0, 0.1)',
                            outlineOffset: '-1px',
                            borderRadius: 2,
                          }}
                        >
                          <div
                            className="absolute inset-0"
                            style={{
                              backgroundImage: `url(${imageUrl})`,
                              backgroundSize: `${tileSize * gridSize}px ${tileSize * gridSize}px`,
                              backgroundPosition: `-${fromCol * tileSize}px -${fromRow * tileSize}px`,
                            }}
                          />

                          {isCorrect && (
                            <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none" />
                          )}

                          {isSelected && (
                            <motion.div
                              className="absolute inset-0 bg-violet-500/15 pointer-events-none"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: [0.1, 0.2, 0.1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            />
                          )}
                        </div>
                      </motion.div>
                    )
                  })}

                  <svg
                    className="absolute inset-0 pointer-events-none z-10"
                    width={tileSize * gridSize}
                    height={tileSize * gridSize}
                  >
                    {Array.from({ length: gridSize - 1 }, (_, i) => (
                      <React.Fragment key={`grid-${i}`}>
                        <line
                          x1={(i + 1) * tileSize}
                          y1={0}
                          x2={(i + 1) * tileSize}
                          y2={tileSize * gridSize}
                          stroke="rgba(0,0,0,0.12)"
                          strokeWidth="1"
                        />
                        <line
                          x1={0}
                          y1={(i + 1) * tileSize}
                          x2={tileSize * gridSize}
                          y2={(i + 1) * tileSize}
                          stroke="rgba(0,0,0,0.12)"
                          strokeWidth="1"
                        />
                      </React.Fragment>
                    ))}
                  </svg>
                </div>
              )}
            </div>

            <p className="mt-4 text-xs text-stone-400 font-medium text-center">
              Cliquez deux pi&egrave;ces pour les &eacute;changer, ou glissez-d&eacute;posez
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="celebration"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex flex-col items-center w-full"
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-6 text-center"
            >
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-full px-6 py-3 shadow-lg mb-3">
                <Trophy size={20} className="text-emerald-500" />
                <span className="text-base font-bold text-emerald-700">
                  Bravo ! Puzzle r&eacute;solu en {moveCount} coup{moveCount !== 1 ? 's' : ''} !
                </span>
              </div>
              <p className="text-sm text-stone-500 font-medium">
                D&eacute;couvrez maintenant le message...
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="w-full"
            >
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
