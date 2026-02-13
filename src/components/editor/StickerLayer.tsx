'use client'

import React, { useState, useRef, useEffect } from 'react'
import { StickerPlacement } from '@/types'
import { Trash2, Move, RotateCcw, Maximize, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getOptimizedImageUrl } from '@/lib/image-processing'

interface StickerLayerProps {
    stickers: StickerPlacement[]
    onUpdate: (id: string, updates: Partial<StickerPlacement>) => void
    onRemove: (id: string) => void
    isActive: boolean
}

export default function StickerLayer({ stickers, onUpdate, onRemove, isActive }: StickerLayerProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [dragState, setDragState] = useState<{ id: string, startX: number, startY: number, startPos: { x: number, y: number }, type: 'move' | 'scale' | 'rotate' } | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const handlePointerDown = (e: React.PointerEvent, id: string, type: 'move' | 'scale' | 'rotate') => {
        e.stopPropagation()
        setSelectedId(id)
        const sticker = stickers.find(s => s.id === id)
        if (!sticker) return

        setDragState({
            id,
            startX: e.clientX,
            startY: e.clientY,
            startPos: { x: sticker.x, y: sticker.y },
            type
        })

        const target = e.currentTarget as HTMLElement
        target.setPointerCapture(e.pointerId)
    }

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!dragState || !containerRef.current) return
        const rect = containerRef.current.getBoundingClientRect()
        const sticker = stickers.find(s => s.id === dragState.id)
        if (!sticker) return

        if (dragState.type === 'move') {
            const dx = ((e.clientX - dragState.startX) / rect.width) * 100
            const dy = ((e.clientY - dragState.startY) / rect.height) * 100
            onUpdate(dragState.id, {
                x: Math.max(0, Math.min(100, dragState.startPos.x + dx)),
                y: Math.max(0, Math.min(100, dragState.startPos.y + dy))
            })
        } else if (dragState.type === 'scale') {
            // Simplified scale logic based on horizontal drag
            const dx = e.clientX - dragState.startX
            const newScale = Math.max(0.2, Math.min(3, sticker.scale + dx / 100))
            onUpdate(dragState.id, { scale: newScale })
            // Reset startX for relative delta if needed, or keep it absolute from start
        } else if (dragState.type === 'rotate') {
            // Calculate angle from center
            const centerX = rect.left + (sticker.x / 100) * rect.width
            const centerY = rect.top + (sticker.y / 100) * rect.height
            const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI)
            onUpdate(dragState.id, { rotation: angle })
        }
    }

    const handlePointerUp = (e: React.PointerEvent) => {
        setDragState(null)
    }

    if (!isActive) return null

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 z-20 overflow-hidden"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onClick={() => setSelectedId(null)}
        >
            {stickers.map((sticker) => (
                <div
                    key={sticker.id}
                    className={cn(
                        "absolute group pointer-events-auto",
                        selectedId === sticker.id ? "ring-2 ring-teal-500 ring-offset-2 rounded-lg" : ""
                    )}
                    style={{
                        left: `${sticker.x}%`,
                        top: `${sticker.y}%`,
                        transform: `translate(-50%, -50%) scale(${sticker.scale}) rotate(${sticker.rotation}deg)`,
                        width: '80px',
                        height: '80px',
                        touchAction: 'none'
                    }}
                    onPointerDown={(e) => handlePointerDown(e, sticker.id, 'move')}
                >
                    <img
                        src={getOptimizedImageUrl(sticker.imageUrl || '', { width: 200 })}
                        alt="Sticker"
                        className="w-full h-full object-contain pointer-events-none select-none"
                    />

                    {selectedId === sticker.id && (
                        <>
                            {/* Controls */}
                            <button
                                className="absolute -top-6 -right-6 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                                onClick={(e) => { e.stopPropagation(); onRemove(sticker.id); }}
                            >
                                <X size={14} />
                            </button>

                            <div
                                className="absolute -bottom-6 -right-6 bg-teal-500 text-white rounded-full p-1 shadow-lg cursor-nwse-resize"
                                onPointerDown={(e) => handlePointerDown(e, sticker.id, 'scale')}
                            >
                                <Maximize size={14} />
                            </div>

                            <div
                                className="absolute -bottom-6 -left-6 bg-amber-500 text-white rounded-full p-1 shadow-lg cursor-alias"
                                onPointerDown={(e) => handlePointerDown(e, sticker.id, 'rotate')}
                            >
                                <RotateCcw size={14} />
                            </div>
                        </>
                    )}
                </div>
            ))}
        </div>
    )
}
