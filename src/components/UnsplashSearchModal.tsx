'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Loader2, ExternalLink, Image as ImageIcon } from 'lucide-react'
import { searchUnsplashPhotos, getLocationSuggestions, UnsplashPhoto } from '@/lib/unsplash'
import { cn } from '@/lib/utils'

type ImageSource = 'unsplash' | 'pixabay'

interface GalleryPhoto {
  id: string
  thumbUrl: string
  regularUrl: string
  user: string
  source: ImageSource
  alt?: string
}

interface UnsplashSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (imageUrl: string) => void
  location?: string
  /** When set, modal opens with this query pre-filled and search run (e.g. from editor search box). */
  initialQuery?: string | null
}

export function UnsplashSearchModal({
  isOpen,
  onClose,
  onSelect,
  location,
  initialQuery: initialQueryProp,
}: UnsplashSearchModalProps) {
  const [query, setQuery] = useState('')
  const [source, setSource] = useState<ImageSource>('unsplash')
  const [results, setResults] = useState<GalleryPhoto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])

  const handleSearch = useCallback(async (searchQuery: string, src: ImageSource) => {
    if (!searchQuery.trim()) return

    setLoading(true)
    setError(null)
    setQuery(searchQuery)

    try {
      if (src === 'unsplash') {
        const response = await searchUnsplashPhotos(searchQuery)
        const photos: GalleryPhoto[] = response.results.map((p: UnsplashPhoto) => ({
          id: `unsplash-${p.id}`,
          thumbUrl: p.urls.small,
          regularUrl: p.urls.regular,
          user: p.user.name,
          source: 'unsplash',
          alt: p.alt_description || p.description,
        }))
        setResults(photos)
      } else {
        const res = await fetch(`/api/pixabay-images?q=${encodeURIComponent(searchQuery)}`)
        const data = await res.json()
        const photos: GalleryPhoto[] = (data.hits || []).map((hit: any) => ({
          id: `pixabay-${hit.id}`,
          thumbUrl: hit.previewURL || hit.webformatURL,
          regularUrl: hit.webformatURL || hit.largeImageURL || hit.previewURL,
          user: hit.user || 'Pixabay',
          source: 'pixabay',
          alt: hit.tags,
        }))
        setResults(photos)
        if (data.message && !data.hits?.length) {
          setError(data.message)
        }
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la recherche.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      if (initialQueryProp !== undefined && initialQueryProp !== null) {
        setQuery(initialQueryProp)
        if (initialQueryProp.trim()) {
          handleSearch(initialQueryProp, source)
        } else {
          setResults([])
        }
      } else {
        const initialSuggestions = getLocationSuggestions(location)
        setSuggestions(initialSuggestions)
        if (initialSuggestions.length > 0) {
          handleSearch(initialSuggestions[0], source)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run on open/location/initialQuery
  }, [isOpen, location, initialQueryProp])

  const onSourceChange = (newSource: ImageSource) => {
    setSource(newSource)
    setError(null)
    if (query.trim()) {
      handleSearch(query, newSource)
    } else if (suggestions.length > 0) {
      handleSearch(suggestions[0], newSource)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query, source)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[960px] max-w-[95vw] max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white border-none shadow-2xl">
        <DialogHeader className="px-4 pt-4 pb-0 flex-shrink-0">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <DialogTitle className="text-xl font-serif font-bold text-stone-800">
                Galerie d&apos;images
              </DialogTitle>
              {/* Source Tabs - à gauche sous le titre */}
              <div className="flex gap-1 p-0.5 bg-stone-100 rounded-lg">
                <button
                  onClick={() => onSourceChange('unsplash')}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-xs font-semibold transition-all',
                    source === 'unsplash'
                      ? 'bg-white text-stone-800 shadow-sm'
                      : 'text-stone-500 hover:text-stone-700',
                  )}
                >
                  Unsplash
                </button>
                <button
                  onClick={() => onSourceChange('pixabay')}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-xs font-semibold transition-all',
                    source === 'pixabay'
                      ? 'bg-white text-stone-800 shadow-sm'
                      : 'text-stone-500 hover:text-stone-700',
                  )}
                >
                  Pixabay
                </button>
              </div>
            </div>
            <DialogDescription className="text-stone-500 text-sm">
              Millions d&apos;images gratuites et libres de droits.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="px-4 pt-3 pb-4 flex flex-col gap-3 overflow-hidden flex-1 min-h-0">
          {/* Search + Suggestions on one compact block */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            <div className="relative group flex-shrink-0">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-teal-500 transition-colors"
                size={18}
              />
              <Input
                placeholder="Rechercher (ex: Plage, Montagne, Paris...)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10 h-10 text-sm rounded-xl border-stone-200 bg-stone-50/50 focus:border-teal-400 focus:ring-teal-400 transition-all"
              />
              <Button
                onClick={() => handleSearch(query, source)}
                disabled={loading || !query.trim()}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white h-8 px-4 text-sm font-bold transition-all"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Rechercher'}
              </Button>
            </div>
            {suggestions.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider self-center">
                  Suggestions :
                </span>
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSearch(s, source)}
                    className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-semibold transition-all',
                      query === s
                        ? 'bg-teal-500 text-white shadow-sm'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200',
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Results Grid - more columns, smaller gap, max space */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-2 border-teal-100 border-t-teal-500 animate-spin" />
                  <ImageIcon
                    size={18}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-teal-500"
                  />
                </div>
                <p className="text-stone-500 text-sm font-medium animate-pulse">Recherche...</p>
              </div>
            ) : error ? (
              <div className="p-6 text-center bg-red-50 rounded-xl border border-red-100">
                <p className="text-red-600 text-sm font-medium">{error}</p>
                <Button
                  variant="outline"
                  onClick={() => handleSearch(query, source)}
                  className="mt-3 border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700 text-sm"
                >
                  Réessayer
                </Button>
              </div>
            ) : results.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {results.map((photo) => (
                  <div
                    key={photo.id}
                    className="group relative aspect-[4/3] rounded-lg overflow-hidden bg-stone-100 cursor-pointer border border-stone-200 hover:border-teal-400 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                    onClick={() => onSelect(photo.regularUrl)}
                  >
                    <img
                      src={photo.thumbUrl}
                      alt={photo.alt || 'Photo'}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                      <p className="text-white text-[10px] font-medium truncate">
                        Par <span className="font-bold underline">{photo.user}</span>
                      </p>
                      <p className="text-white/70 text-[8px] uppercase tracking-wider">
                        {photo.source === 'unsplash' ? 'Unsplash' : 'Pixabay'}
                      </p>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded-lg shadow-sm">
                        <ExternalLink size={12} className="text-stone-600" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : query && !loading ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search size={20} className="text-stone-400" />
                </div>
                <p className="text-stone-800 font-bold text-sm">Aucun résultat trouvé</p>
                <p className="text-stone-500 text-xs mt-1">
                  Essayez d&apos;autres mots-clés ou suggestions.
                </p>
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ImageIcon size={20} className="text-teal-500" />
                </div>
                <p className="text-stone-800 font-bold text-sm">Prêt à explorer</p>
                <p className="text-stone-500 text-xs mt-1">
                  Saisissez un mot-clé ou une suggestion.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
