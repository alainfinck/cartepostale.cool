'use client'

import React, { useState } from 'react'
import { Search, Image as ImageIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import type { UserMediaItem } from '@/actions/client-gallery-actions'

interface Props {
  items: UserMediaItem[]
}

export default function UserGalerieClient({ items }: Props) {
  const [search, setSearch] = useState('')

  const filteredItems = items.filter((item) => {
    if (!search) return true
    return item.alt.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <Input
            placeholder="Rechercher une image..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white border-stone-200"
          />
        </div>
      </div>

      {/* Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-stone-50 border border-dashed border-stone-200 rounded-2xl">
          <ImageIcon className="h-10 w-10 text-stone-400 mx-auto mb-4 opacity-50" />
          <p className="text-stone-900 font-medium mb-1">Aucune image trouvée</p>
          <p className="text-sm text-stone-500">
            {items.length === 0
              ? "Vous n'avez pas encore utilisé d'images dans vos cartes postales."
              : 'Aucune image ne correspond à votre recherche.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-xl border border-stone-200 bg-white overflow-hidden hover:shadow-md transition-all"
            >
              <div className="aspect-square bg-stone-100 relative">
                <Image src={item.url} alt={item.alt} fill className="object-cover" />
              </div>
              <div className="p-3">
                <h3 className="font-medium text-xs text-stone-700 truncate" title={item.alt}>
                  {item.alt}
                </h3>
                <p className="text-[10px] text-stone-400 mt-1">
                  Ajoutée le {new Date(item.addedAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
