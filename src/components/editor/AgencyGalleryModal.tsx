'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { X, Search, Loader2, Image as ImageIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { AgencyGalleryItemPublic, AgencyGalleryCategoryPublic } from '@/app/api/public/agency/[code]/gallery/route'

const DEBOUNCE_MS = 350

export interface AgencyGalleryModalProps {
  isOpen: boolean
  onClose: () => void
  agencyCode: string
  agencyName?: string
  onSelect: (imageUrl: string, title: string) => void
}

export default function AgencyGalleryModal({
  isOpen,
  onClose,
  agencyCode,
  agencyName,
  onSelect,
}: AgencyGalleryModalProps) {
  const [items, setItems] = useState<AgencyGalleryItemPublic[]>([])
  const [categories, setCategories] = useState<AgencyGalleryCategoryPublic[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchGallery = useCallback(
    async (category: number | 'all', search: string) => {
      if (!agencyCode) return
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (category !== 'all') params.set('category', String(category))
        if (search.trim()) params.set('search', search.trim())
        const url = `/api/public/agency/${encodeURIComponent(agencyCode)}/gallery${params.toString() ? `?${params.toString()}` : ''}`
        const res = await fetch(url)
        if (!res.ok) throw new Error('Erreur chargement galerie')
        const data = await res.json()
        setItems(data.items ?? [])
        if (data.categories) setCategories(data.categories)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erreur')
        setItems([])
      } finally {
        setLoading(false)
      }
    },
    [agencyCode],
  )

  useEffect(() => {
    if (!isOpen || !agencyCode) return
    setSearchQuery('')
    setSearchInput('')
    setSelectedCategoryId('all')
  }, [isOpen, agencyCode])

  useEffect(() => {
    if (!isOpen) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearchQuery(searchInput)
      debounceRef.current = null
    }, DEBOUNCE_MS)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchInput, isOpen])

  useEffect(() => {
    if (!isOpen || !agencyCode) return
    fetchGallery(selectedCategoryId, searchQuery)
  }, [selectedCategoryId, searchQuery, isOpen, agencyCode, fetchGallery])

  const getFullImageUrl = (imageUrl: string) => {
    if (!imageUrl) return ''
    if (imageUrl.startsWith('http')) return imageUrl
    if (typeof window !== 'undefined') return `${window.location.origin}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
    return imageUrl
  }

  const handleSelect = (item: AgencyGalleryItemPublic) => {
    const url = getFullImageUrl(item.imageUrl)
    if (url) onSelect(url, item.title)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-stone-900/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="agency-gallery-title"
    >
      {/* Header */}
      <header className="shrink-0 flex items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4 border-b border-white/10 bg-stone-900/80">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400">
            <ImageIcon size={22} />
          </div>
          <div className="min-w-0">
            <h2 id="agency-gallery-title" className="text-lg font-bold text-white truncate">
              Images de l&apos;agence
              {agencyName ? ` — ${agencyName}` : ''}
            </h2>
            <p className="text-xs text-stone-400 truncate">
              {items.length} image{items.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="shrink-0 rounded-full text-stone-400 hover:text-white hover:bg-white/10 h-10 w-10"
          aria-label="Fermer"
        >
          <X size={22} />
        </Button>
      </header>

      {/* Filters bar */}
      <div className="shrink-0 flex flex-col sm:flex-row gap-3 px-4 py-3 sm:px-6 border-b border-white/10 bg-stone-900/50">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
          <Input
            type="text"
            placeholder="Rechercher (titre, légende…)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 h-10 rounded-xl bg-white/5 border-white/20 text-white placeholder:text-stone-500 focus-visible:ring-teal-500"
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider shrink-0">
            Catégories
          </span>
          <button
            type="button"
            onClick={() => setSelectedCategoryId('all')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-sm font-medium transition-all',
              selectedCategoryId === 'all'
                ? 'bg-teal-500 text-white'
                : 'bg-white/10 text-stone-300 hover:bg-white/15 hover:text-white',
            )}
          >
            Toutes
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategoryId(cat.id)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
                selectedCategoryId === cat.id
                  ? 'bg-teal-500 text-white'
                  : 'bg-white/10 text-stone-300 hover:bg-white/15 hover:text-white',
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[280px] gap-4">
            <Loader2 size={40} className="text-teal-400 animate-spin" />
            <p className="text-sm font-medium text-stone-400">Chargement des images…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[280px] gap-3 text-center">
            <p className="text-stone-400 font-medium">{error}</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => fetchGallery(selectedCategoryId, searchQuery)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Réessayer
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[280px] gap-3 text-center">
            <ImageIcon size={48} className="text-stone-600" />
            <p className="text-stone-400 font-medium">
              Aucune image ne correspond à votre recherche.
            </p>
            <p className="text-sm text-stone-500">
              Changez de catégorie ou de termes de recherche.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {items.map((item) => {
              const fullUrl = getFullImageUrl(item.imageUrl)
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="group relative flex flex-col rounded-2xl overflow-hidden border-2 border-transparent hover:border-teal-400/80 bg-stone-800/50 hover:bg-stone-800/80 transition-all text-left shadow-lg hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900"
                >
                  <div className="aspect-[4/3] relative bg-stone-800 overflow-hidden">
                    <img
                      src={fullUrl}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-2 sm:p-2.5 bg-stone-900/80">
                    <p className="text-xs font-medium text-white truncate" title={item.title}>
                      {item.title}
                    </p>
                    {item.categoryName && (
                      <p className="text-[10px] text-stone-500 truncate mt-0.5">
                        {item.categoryName}
                      </p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
