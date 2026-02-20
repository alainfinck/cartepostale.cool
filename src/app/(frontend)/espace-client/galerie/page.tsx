import React from 'react'
import { Metadata } from 'next'
import { getUserGalleryMedia } from '@/actions/client-gallery-actions'
import UserGalerieClient from './UserGalerieClient'

export const metadata: Metadata = {
  title: 'Ma Galerie - CartePostale.cool',
  description: 'Retrouvez toutes les photos utilisées sur vos précedentes cartes postales.',
}

export const dynamic = 'force-dynamic'

export default async function EspaceClientGaleriePage() {
  const mediaItems = await getUserGalleryMedia()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Ma galerie d&apos;images</h1>
        <p className="text-stone-500 mt-1">
          Retrouvez ici toutes les photos que vous avez utilisées lors de la création de vos
          différentes cartes postales.
        </p>
      </div>

      <UserGalerieClient items={mediaItems} />
    </div>
  )
}
