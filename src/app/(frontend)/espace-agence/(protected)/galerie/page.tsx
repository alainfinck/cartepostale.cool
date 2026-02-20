import React from 'react'
import { Metadata } from 'next'
import { getAgencyGallery, getGalleryCategories, getGalleryTags } from '@/actions/galerie-actions'
import GalerieClient from './GalerieClient'

export const metadata: Metadata = {
  title: 'Galerie Agence',
  description: "Gérez la galerie d'images pour vos clients",
}

export const dynamic = 'force-dynamic'

export default async function EspaceAgenceGaleriePage() {
  const [items, categories, tags] = await Promise.all([
    getAgencyGallery(),
    getGalleryCategories(),
    getGalleryTags(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Galerie d&apos;images</h1>
        <p className="text-muted-foreground mt-1">
          Gérez les images qui seront proposées à vos clients lors de la création de leurs cartes
          postales.
        </p>
      </div>

      <GalerieClient initialItems={items} categories={categories} tags={tags} />
    </div>
  )
}
