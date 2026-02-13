'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { MediaItem } from '@/types'
import { Camera } from 'lucide-react'

interface PhotoAlbumProps {
    mediaItems: MediaItem[]
    senderName: string
}

export default function PhotoAlbum({ mediaItems, senderName }: PhotoAlbumProps) {
    if (!mediaItems || mediaItems.length === 0) return null

    return (
        <section className="w-full max-w-4xl mx-auto mt-8 mb-12 px-4">
            <div className="flex items-center gap-2 mb-6 justify-center md:justify-start">
                <Camera size={24} className="text-teal-600" />
                <h3 className="font-serif text-2xl font-bold text-stone-800">
                    Album de {senderName}
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mediaItems.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="relative aspect-square rounded-xl overflow-hidden shadow-md group cursor-pointer"
                    >
                        {item.type === 'video' ? (
                            <video
                                src={item.url}
                                controls
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <Image
                                src={item.url}
                                alt={`Photo ${index + 1} de ${senderName}`}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                        )}
                    </motion.div>
                ))}
            </div>
        </section>
    )
}
