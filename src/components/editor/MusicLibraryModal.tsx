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
      <DialogContent className="sm:max-w-[900px] max-w-[95vw] max-h-[85vh] flex flex-col p-0 overflow-hidden bg-white border-none shadow-2xl">
        <DialogHeader className="p-5 pb-0 shrink-0">
          <DialogTitle className="text-xl font-serif font-bold text-stone-800 flex items-center gap-2">
            <Music size={24} className="text-teal-500" />
            Bibliothèque de musique
          </DialogTitle>
          <DialogDescription className="text-stone-500 text-sm">
            Musique gratuite et libre de droits (Freesound). Choisissez une ambiance pour votre
            carte.
          </DialogDescription>
        </DialogHeader>

        <div className="p-5 flex flex-col gap-4 overflow-hidden flex-1 min-h-0">
          <div className="relative group shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <Input
              placeholder="Rechercher (ex: ambient, vacances, relax...)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-11 h-10 rounded-xl border-stone-200 bg-stone-50/50"
            />
            <Button
              onClick={() => handleSearch(query)}
              disabled={loading || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white h-8 px-3 text-sm"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Rechercher'}
            </Button>
          </div>

          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 shrink-0">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider self-center mr-1.5">
                Suggestions :
              </span>
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSearch(s)}
                  className={cn(
                    'px-2 py-0.5 rounded-full text-[11px] font-medium transition-all',
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
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs shrink-0">
              {message}
            </div>
          )}

          <div className="flex-1 overflow-y-auto min-h-0 space-y-1 pr-2">
            {results.map((track) => (
              <div
                key={track.id}
                className="flex items-center gap-2 py-2 px-2.5 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors group"
              >
                <button
                  onClick={() => handlePlay(track)}
                  className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center hover:bg-teal-200 transition-colors shrink-0"
                >
                  {playingId === track.id ? (
                    <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-sm" />
                    </div>
                  ) : (
                    <Play size={14} fill="currentColor" className="ml-0.5" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-stone-800 truncate">{track.title}</p>
                  <p className="text-[11px] text-stone-500 truncate">{track.artist}</p>
                </div>
                <span className="text-[11px] text-stone-400 tabular-nums shrink-0">
                  {formatDuration(track.duration)}
                </span>
                <Button
                  onClick={() => {
                    onSelect(track)
                    onClose()
                  }}
                  size="sm"
                  className="h-7 px-2.5 text-xs bg-teal-600 hover:bg-teal-700 text-white shrink-0"
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
