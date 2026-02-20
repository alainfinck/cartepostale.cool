'use client'

import React, { useState } from 'react'
import { Plus, Search, Filter, Trash2, Eye, Map as MapIcon, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { deleteAgencyGalleryItem } from '@/actions/galerie-actions'
import type { Gallery, GalleryCategory, GalleryTag } from '@/payload-types'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Props {
  initialItems: Gallery[]
  categories: GalleryCategory[]
  tags: GalleryTag[]
}

export default function GalerieClient({ initialItems, categories, tags }: Props) {
  const router = useRouter()
  const [items, setItems] = useState(initialItems)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all')

  const filteredItems = items.filter((item) => {
    let matches = true
    if (search) {
      matches =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        (item.caption && item.caption.toLowerCase().includes(search.toLowerCase())) ||
        false
    }
    if (selectedCategory !== 'all') {
      const catId =
        typeof item.category === 'object' && item.category ? item.category.id : item.category
      if (catId !== selectedCategory) matches = false
    }
    return matches
  })

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) return

    // Optimistic update
    const prevItems = [...items]
    setItems(items.filter((i) => i.id !== id))

    const res = await deleteAgencyGalleryItem(id)
    if (res.success) {
      toast.success('Image supprimée')
      router.refresh()
    } else {
      setItems(prevItems)
      toast.error(res.error || 'Erreur lors de la suppression')
    }
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 w-full gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une image..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background border-border"
            />
          </div>

          <select
            className="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background cursor-pointer"
            value={selectedCategory}
            onChange={(e) =>
              setSelectedCategory(e.target.value === 'all' ? 'all' : Number(e.target.value))
            }
          >
            <option value="all">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <Button
          onClick={() => alert("Fonctionnalité d'upload via modal à implémenter")}
          className="shrink-0 gap-2 bg-teal-600 hover:bg-teal-700"
        >
          <Plus className="h-4 w-4" />
          Ajouter une image
        </Button>
      </div>

      {/* Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 border border-dashed border-border rounded-xl">
          <ImageIcon className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-foreground font-medium mb-1">Aucune image trouvée</p>
          <p className="text-sm text-muted-foreground">
            Ajoutez des images pour alimenter votre galerie d&apos;agence.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredItems.map((item) => {
            const mediaUrl = typeof item.image === 'object' && item.image ? item.image.url : null
            const categoryName =
              typeof item.category === 'object' && item.category
                ? item.category.name
                : 'Sans catégorie'

            return (
              <div
                key={item.id}
                className="group relative rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="aspect-square bg-muted relative">
                  {mediaUrl ? (
                    <Image src={mediaUrl} alt={item.title} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      Image introuvable
                    </div>
                  )}

                  {/* Actions overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 rounded-full"
                      onClick={() => alert('Mode édition à implémenter')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8 rounded-full"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-3">
                  <h3 className="font-semibold text-sm truncate" title={item.title}>
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] uppercase font-bold text-teal-600 tracking-wider bg-teal-50 px-2 py-0.5 rounded-sm truncate max-w-[60%]">
                      {categoryName}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                      <span className="flex items-center gap-1" title={`${item.views || 0} vues`}>
                        <Eye className="h-3 w-3" /> {item.views || 0}
                      </span>
                      <span
                        className="flex items-center gap-1"
                        title={`${item.usages || 0} utilisations sur des cartes`}
                      >
                        <MapIcon className="h-3 w-3" /> {item.usages || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
