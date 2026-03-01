'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, ArrowRight, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getOptimizedImageUrl } from '@/lib/image-processing'
import type { GalleryItemPublic, GalleryCategoryPublic } from './types'

const PAGE_SIZE = 12

interface Props {
  galleryItems: GalleryItemPublic[]
  galleryCategories: GalleryCategoryPublic[]
  agencyName: string
  agencyLogoUrl: string | null
  primaryColor: string
  createUrl: string
}

export default function AgencyGallerySection({
  galleryItems,
  galleryCategories,
  agencyName,
  agencyLogoUrl,
  primaryColor,
  createUrl,
}: Props) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all'>('all')
  const [page, setPage] = useState(0)
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') setOrigin(window.location.origin)
  }, [])

  const filteredItems = useMemo(() => {
    if (selectedCategoryId === 'all') return galleryItems
    return galleryItems.filter((item) => item.categoryId === selectedCategoryId)
  }, [galleryItems, selectedCategoryId])

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE))
  const paginatedItems = useMemo(
    () =>
      filteredItems.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [filteredItems, page],
  )

  useEffect(() => {
    setPage(0)
  }, [selectedCategoryId])

  const getCoverUrl = (imageUrl: string) => {
    if (!imageUrl) return createUrl
    if (imageUrl.startsWith('http')) return imageUrl
    return origin ? `${origin}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}` : createUrl
  }

  const hasGallery = galleryItems.length > 0
  const hasCategories = galleryCategories.length > 0

  return (
    <section className="py-20 px-4" style={{ backgroundColor: `${primaryColor}08` }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-3">
            {hasGallery ? 'Galerie de l\'agence' : 'Quelques destinations'}
          </h2>
          <p className="text-stone-500 max-w-xl mx-auto">
            {hasGallery
              ? 'Choisissez une image pour créer votre carte postale en un clic.'
              : 'Choisissez parmi ces photos pour créer votre carte.'}
          </p>
        </div>

        {hasGallery && hasCategories && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              type="button"
              onClick={() => setSelectedCategoryId('all')}
              className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
              style={{
                backgroundColor: selectedCategoryId === 'all' ? primaryColor : 'rgba(0,0,0,0.06)',
                color: selectedCategoryId === 'all' ? 'white' : 'rgb(41 37 36)',
              }}
            >
              Toutes
            </button>
            {galleryCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryId(cat.id)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
                style={{
                  backgroundColor: selectedCategoryId === cat.id ? primaryColor : 'rgba(0,0,0,0.06)',
                  color: selectedCategoryId === cat.id ? 'white' : 'rgb(41 37 36)',
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {hasGallery ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 mb-10">
              <AnimatePresence mode="wait">
                {paginatedItems.map((item, i) => {
                  const coverUrl = getCoverUrl(item.imageUrl)
                  const editorLink = origin ? `${createUrl}${createUrl.includes('?') ? '&' : '?'}cover=${encodeURIComponent(coverUrl)}` : createUrl
                  const imgSrc = item.imageUrl.startsWith('http') || item.imageUrl.startsWith('/')
                    ? getOptimizedImageUrl(item.imageUrl, { width: 600 })
                    : origin
                      ? getOptimizedImageUrl(`${origin}${item.imageUrl.startsWith('/') ? '' : '/'}${item.imageUrl}`, { width: 600 })
                      : item.imageUrl

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25, delay: i * 0.03 }}
                      className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer aspect-[4/3] bg-stone-100"
                    >
                      <Link href={editorLink} className="block w-full h-full">
                        <img
                          src={imgSrc}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <p className="text-white font-medium text-sm drop-shadow truncate">
                            {item.title}
                          </p>
                          {item.caption && (
                            <p className="text-white/90 text-xs drop-shadow line-clamp-2 mt-0.5">
                              {item.caption}
                            </p>
                          )}
                        </div>
                        {agencyLogoUrl && (
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <img
                              src={getOptimizedImageUrl(agencyLogoUrl, { width: 80 })}
                              alt={agencyName}
                              className="h-5 w-auto object-contain filter brightness-0 invert drop-shadow"
                            />
                          </div>
                        )}
                      </Link>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            {filteredItems.length > PAGE_SIZE && (
              <div className="flex items-center justify-center gap-4 mb-10">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-10 w-10"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <span className="text-sm text-stone-600 font-medium">
                  {page + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-10 w-10"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            )}

            {filteredItems.length === 0 && (
              <div className="py-12 text-center text-stone-500">
                <ImageIcon className="mx-auto h-12 w-12 text-stone-300 mb-3" />
                <p className="font-medium">Aucune image dans cette catégorie.</p>
              </div>
            )}
          </>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
            {[
              '/images/demo/photo-1507525428034-b723cf961d3e.jpg',
              '/images/demo/photo-1476514525535-07fb3b4ae5f1.jpg',
              '/images/demo/photo-1506929562872-bb421503ef21.jpg',
              '/images/demo/photo-1501785888041-af3ef285b470.jpg',
              '/images/demo/photo-1488646953014-85cb44e25828.jpg',
              '/images/demo/photo-1516426122078-c23e76319801.jpg',
            ].map((url, i) => (
              <motion.div
                key={i}
                className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer aspect-[4/3]"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <Link href={createUrl}>
                  <img
                    src={getOptimizedImageUrl(url, { width: 600 })}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  {agencyLogoUrl && (
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <img
                        src={getOptimizedImageUrl(agencyLogoUrl, { width: 80 })}
                        alt={agencyName}
                        className="h-6 w-auto object-contain filter brightness-0 invert drop-shadow"
                      />
                    </div>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center">
          <Link href={createUrl}>
            <Button
              size="lg"
              className="text-white font-bold px-10 py-6 rounded-2xl border-0 shadow-xl text-base"
              style={{ backgroundColor: primaryColor }}
            >
              <Camera size={18} className="mr-2" />
              Créer ma carte maintenant
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
