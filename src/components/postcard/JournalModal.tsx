'use client'

import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Calendar, Camera, Play } from 'lucide-react'
import { Postcard, MediaItem } from '@/types'
import { getOptimizedImageUrl } from '@/lib/image-processing'

interface JournalModalProps {
  postcard: Postcard
  isOpen: boolean
  onClose: () => void
}

const JournalModal: React.FC<JournalModalProps> = ({ postcard, isOpen, onClose }) => {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null)

  React.useEffect(() => {
    setPortalRoot(document.body)
  }, [])

  if (!portalRoot || !isOpen) return null

  // Filter media items that have content (notes) or just all media items?
  // Let's show all media items, but emphasize those with notes.
  // Sort by date if available? For now, keep original order.
  const journalEntries = postcard.mediaItems || []

  // If no media items, perhaps show a placeholder or just don't render the button in parent?
  // But here we assume it's open so we render content.

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] bg-stone-900/98 backdrop-blur-md flex items-center justify-center p-4 md:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="w-full max-w-2xl max-h-[85dvh] bg-[#fdfbf7] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-stone-200 bg-white z-10 shrink-0">
              <div>
                <h2 className="text-2xl font-serif font-bold text-stone-800">Carnet de Voyage</h2>
                <p className="text-sm text-stone-500 flex items-center gap-2 mt-1">
                  <MapPin size={14} className="text-teal-600" />
                  {postcard.location}
                  <span className="text-stone-300">•</span>
                  <Calendar size={14} className="text-teal-600" />
                  {postcard.date}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-stone-100 text-stone-500 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content - Scrollable list */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-12 custom-scrollbar bg-[url('/images/paper-texture.png')] bg-repeat">
              {journalEntries.length === 0 ? (
                <div className="text-center py-20 text-stone-400 italic">
                  Aucun souvenir dans ce carnet pour le moment.
                </div>
              ) : (
                journalEntries.map((item, index) => (
                  <JournalEntry key={item.id} item={item} index={index + 1} />
                ))
              )}

              {/* End of Journal Signature */}
              <div className="text-center pt-8 pb-4 border-t border-stone-200 mt-12">
                <p className="font-handwriting text-2xl text-stone-600 rotate-[-2deg]">
                  - {postcard.senderName}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    portalRoot,
  )
}

const JournalEntry: React.FC<{ item: MediaItem; index: number }> = ({ item, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex flex-col gap-4 bg-white p-4 md:p-6 rounded-xl shadow-sm border border-stone-100"
    >
      {/* Date Header if available from EXIF */}
      {item.exif?.dateTime && (
        <div className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">
          {/* Simple parsing ? '2023:10:25 14:30:00' -> display */}
          {/* formatting date can be complex depending on string format */}
          Jour {index}
        </div>
      )}

      {/* Media */}
      <div className="w-full bg-stone-100 rounded-lg overflow-hidden border border-stone-200">
        {item.type === 'video' ? (
          <video
            src={item.url}
            controls
            playsInline
            muted
            className="w-full h-auto max-h-[500px] object-contain bg-black"
          />
        ) : (
          <img
            src={getOptimizedImageUrl(item.url, { width: 800 })}
            alt="Souvenir"
            className="w-full h-auto object-contain max-h-[600px]"
            loading="lazy"
          />
        )}
      </div>

      {/* Note / Caption */}
      {item.note && (
        <div className="mt-2 px-2">
          <p className="font-serif text-lg leading-relaxed text-stone-800 whitespace-pre-wrap">
            {item.note}
          </p>
        </div>
      )}

      {/* Metadata footer */}
      <div className="mt-2 flex items-center justify-between text-[10px] text-stone-400 uppercase tracking-wider border-t border-stone-50 pt-3">
        <div className="flex items-center gap-2">
          {item.type === 'video' ? <Play size={12} /> : <Camera size={12} />}
          <span>{item.type === 'video' ? 'Vidéo' : 'Photo'}</span>
        </div>

        {item.exif?.gps &&
          typeof item.exif.gps.latitude === 'number' &&
          typeof item.exif.gps.longitude === 'number' && (
            <div className="flex items-center gap-1">
              <MapPin size={12} />
              <span>
                {item.exif.gps.latitude.toFixed(4)}, {item.exif.gps.longitude.toFixed(4)}
              </span>
            </div>
          )}
      </div>
    </motion.div>
  )
}

export default JournalModal
