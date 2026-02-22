'use client'

import React, { useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Loader2, X, Music, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface MusicTrack {
  id: number
  title: string
  url: string
  duration: number
  artist: string
}

interface MusicLibraryModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (track: MusicTrack) => void
}

export function MusicLibraryModal({ isOpen, onClose, onSelect }: MusicLibraryModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<MusicTrack[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [playingId, setPlayingId] = useState<number | null>(null)
  const audioRef = React.useRef<HTMLAudioElement | null>(null)

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    setLoading(true)
    setMessage(null)
    setQuery(searchQuery)

    try {
      const res = await fetch('/api/pixabay-music?q=' + encodeURIComponent(searchQuery))
      const data = await res.json()
      setResults(data.tracks || [])
      if (data.message && !data.tracks?.length) {
        setMessage(data.message)
      }
    } catch (err) {
      setMessage('Erreur lors de la recherche.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query)
    }
  }

  const handlePlay = (track: MusicTrack) => {
    if (playingId === track.id) {
      audioRef.current?.pause()
      setPlayingId(null)
      return
    }
    if (audioRef.current) {
      audioRef.current.pause()
    }
    const audio = new Audio(track.url)
    audioRef.current = audio
    audio.onended = () => setPlayingId(null)
    audio.onerror = () => setPlayingId(null)
    audio.play().catch(() => setPlayingId(null))
    setPlayingId(track.id)
  }

  const formatDuration = (sec: number) => {
    if (!sec) return '--:--'
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // Cleanup audio on unmount
  React.useEffect(() => {
    return () => {
      audioRef.current?.pause()
    }
  }, [])

  const suggestions = ['ambient', 'vacances', 'relax', 'joyeux', 'romantique', 'acoustique']

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-w-[95vw] max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white border-none shadow-2xl">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-serif font-bold text-stone-800 flex items-center gap-2">
            <Music size={28} className="text-teal-500" />
            Bibliothèque de musique
          </DialogTitle>
          <DialogDescription className="text-stone-500">
            Musique gratuite et libre de droits (Freesound). Choisissez une ambiance pour votre
            carte.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 flex flex-col gap-6 overflow-hidden flex-1">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
            <Input
              placeholder="Rechercher (ex: ambient, vacances, relax...)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-12 h-12 rounded-xl border-stone-200 bg-stone-50/50"
            />
            <Button
              onClick={() => handleSearch(query)}
              disabled={loading || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white h-9 px-4"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Rechercher'}
            </Button>
          </div>

          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-widest self-center mr-2">
                Suggestions :
              </span>
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSearch(s)}
                  className={cn(
                    'px-4 py-1.5 rounded-full text-sm font-semibold transition-all',
                    query === s
                      ? 'bg-teal-500 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200',
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {message && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
              {message}
            </div>
          )}

          <div className="flex-1 overflow-y-auto max-h-[300px] space-y-2 pr-2">
            {results.map((track) => (
              <div
                key={track.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors group"
              >
                <button
                  onClick={() => handlePlay(track)}
                  className="w-10 h-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center hover:bg-teal-200 transition-colors shrink-0"
                >
                  {playingId === track.id ? (
                    <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-sm" />
                    </div>
                  ) : (
                    <Play size={18} fill="currentColor" className="ml-0.5" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-stone-800 truncate">{track.title}</p>
                  <p className="text-xs text-stone-500">{track.artist}</p>
                </div>
                <span className="text-xs text-stone-400 tabular-nums">
                  {formatDuration(track.duration)}
                </span>
                <Button
                  onClick={() => {
                    onSelect(track)
                    onClose()
                  }}
                  size="sm"
                  className="bg-teal-600 hover:bg-teal-700 text-white shrink-0"
                >
                  Choisir
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
