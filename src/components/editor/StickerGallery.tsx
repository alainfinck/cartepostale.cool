'use client'

import React, { useState, useEffect } from 'react'
import { Sticker as StickerIcon, X, Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getAllStickers } from '@/actions/manager-stickers-actions'
import { Sticker } from '@/types'
import { getOptimizedImageUrl } from '@/lib/image-processing'
import { cn } from '@/lib/utils'

interface StickerGalleryProps {
    onSelect: (sticker: Sticker) => void
    onClose: () => void
}

export default function StickerGallery({ onSelect, onClose }: StickerGalleryProps) {
    const [stickers, setStickers] = useState<Sticker[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState<string>('all')

    useEffect(() => {
        async function fetchStickers() {
            setLoading(true)
            const data = await getAllStickers()
            // Map Payload Sticker to Frontend Sticker type
            const mapped: Sticker[] = data.map((s: any) => ({
                id: s.id.toString(),
                name: s.name,
                image: (typeof s.image === 'object' ? s.image?.url : '') || '',
                category: s.category
            }))
            setStickers(mapped)
            setLoading(false)
        }
        fetchStickers()
    }, [])

    const categories = ['all', 'deco', 'travel', 'love', 'fun', 'vintage']

    const filteredStickers = stickers.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase())
        const matchesCategory = category === 'all' || s.category === category
        return matchesSearch && matchesCategory
    })

    return (
        <div className="flex flex-col h-full bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-stone-200">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-teal-100 text-teal-600 rounded-lg">
                        <StickerIcon size={18} />
                    </div>
                    <div>
                        <h3 className="font-bold text-stone-800">Stickers</h3>
                        <p className="text-[10px] text-stone-500 uppercase tracking-wider">Personnalisez votre carte</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-stone-200/50">
                    <X size={20} />
                </Button>
            </div>

            <div className="p-4 space-y-4 border-b border-stone-50">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                    <Input
                        placeholder="Rechercher un sticker..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-stone-100/50 border-none focus-visible:ring-teal-500/20 rounded-xl"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border",
                                category === cat
                                    ? "bg-teal-600 text-white border-teal-600"
                                    : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
                            )}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <Loader2 className="animate-spin text-teal-600" size={24} />
                        <p className="text-xs text-stone-400">Chargement de la collection...</p>
                    </div>
                ) : filteredStickers.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-sm text-stone-400">Aucun sticker trouvé</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {filteredStickers.map(sticker => (
                            <button
                                key={sticker.id}
                                onClick={() => onSelect(sticker)}
                                className="group aspect-square p-2 rounded-2xl bg-stone-50 hover:bg-teal-50 hover:shadow-md hover:shadow-teal-500/10 transition-all border border-transparent hover:border-teal-100 flex items-center justify-center relative overflow-hidden"
                            >
                                <img
                                    src={getOptimizedImageUrl(sticker.image, { width: 150 })}
                                    className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
                                    alt={sticker.name}
                                />
                                <div className="absolute inset-x-0 bottom-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity bg-teal-600/10 border-t border-teal-600/10">
                                    <p className="text-[8px] text-teal-700 font-bold truncate text-center">{sticker.name}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-100">
                <p className="text-[10px] text-stone-400 text-center italic">
                    Cliquez sur un sticker pour l&apos;ajouter à votre carte
                </p>
            </div>
        </div>
    )
}
