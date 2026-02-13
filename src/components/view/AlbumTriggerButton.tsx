'use client'

import { useCallback } from 'react'
import { Button } from '@/components/ui/button'

export default function AlbumTriggerButton() {
  const scrollToAlbum = useCallback(() => {
    const target = document.getElementById('photo-album')
    if (!target) return
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <Button
      variant="ghost"
      className="px-6 py-3 rounded-full border border-teal-200 bg-white/70 text-teal-600 font-semibold shadow-lg hover:bg-white hover:border-teal-300 transition"
      onClick={scrollToAlbum}
    >
      Voir l'album photos
    </Button>
  )
}
