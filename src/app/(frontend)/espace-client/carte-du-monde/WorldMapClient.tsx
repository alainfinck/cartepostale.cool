'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Globe, MapPin, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { PostcardsResult } from '@/actions/espace-client-actions'
import type { Postcard } from '@/payload-types'

type StatusFilter = 'all' | 'published' | 'draft' | 'archived'

const DefaultIcon = L.icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

function getFrontImageUrl(postcard: Postcard): string {
  if (postcard.frontImageURL) return postcard.frontImageURL
  if (
    postcard.frontImage &&
    typeof postcard.frontImage === 'object' &&
    'url' in postcard.frontImage &&
    postcard.frontImage.url
  ) {
    return postcard.frontImage.url
  }
  return 'https://img.cartepostale.cool/demo/photo-1507525428034-b723cf961d3e.jpg'
}

function MapFocusController({ focusedCoords }: { focusedCoords?: { lat: number; lng: number } }) {
  const map = useMap()

  React.useEffect(() => {
    if (!focusedCoords) return
    map.flyTo([focusedCoords.lat, focusedCoords.lng], Math.max(map.getZoom(), 8), {
      duration: 2.5, // Slower, more cinematic zoom
    })
  }, [focusedCoords, map])

  return null
}

export default function WorldMapClient({ initialData }: { initialData: PostcardsResult }) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [focusedPostcardId, setFocusedPostcardId] = useState<number | null>(null)

  const postcardsWithCoords = useMemo(
    () =>
      initialData.docs.filter(
        (postcard) => postcard.coords?.lat != null && postcard.coords?.lng != null,
      ),
    [initialData.docs],
  )

  const filteredPostcards = useMemo(() => {
    if (statusFilter === 'all') return postcardsWithCoords
    return postcardsWithCoords.filter((postcard) => postcard.status === statusFilter)
  }, [postcardsWithCoords, statusFilter])

  const focusedPostcard = useMemo(
    () => filteredPostcards.find((postcard) => postcard.id === focusedPostcardId),
    [filteredPostcards, focusedPostcardId],
  )

  const focusedCoords = useMemo<{ lat: number; lng: number } | undefined>(() => {
    const coords = focusedPostcard?.coords
    if (coords?.lat == null || coords?.lng == null) return undefined
    return { lat: coords.lat, lng: coords.lng }
  }, [focusedPostcard])

  const mapCenter = useMemo<[number, number]>(() => {
    if (filteredPostcards.length === 0) return [20, 0]
    const sum = filteredPostcards.reduce(
      (acc, postcard) => {
        return {
          lat: acc.lat + (postcard.coords?.lat ?? 0),
          lng: acc.lng + (postcard.coords?.lng ?? 0),
        }
      },
      { lat: 0, lng: 0 },
    )
    return [sum.lat / filteredPostcards.length, sum.lng / filteredPostcards.length]
  }, [filteredPostcards])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
          <Globe size={22} className="text-teal-600" />
          Carte du monde
        </h1>
        <p className="text-muted-foreground">
          Visualisez toutes vos cartes postales geolocalisees sur la carte.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-border/50 bg-card/50 p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Cartes geolocalisees
          </p>
          <p className="text-2xl font-bold text-foreground mt-1">{postcardsWithCoords.length}</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/50 p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Total cartes</p>
          <p className="text-2xl font-bold text-foreground mt-1">{initialData.totalDocs}</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/50 p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Sans coordonnees</p>
          <p className="text-2xl font-bold text-foreground mt-1">
            {Math.max(0, initialData.totalDocs - postcardsWithCoords.length)}
          </p>
        </div>
      </div>

      <div className="flex gap-1 rounded-lg border border-border/30 p-1 bg-muted/30 w-fit">
        {(['all', 'published', 'draft', 'archived'] as StatusFilter[]).map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setStatusFilter(status)}
            className={cn(
              'px-3 text-xs h-8',
              statusFilter === status && 'bg-background shadow-sm hover:bg-background',
            )}
          >
            {status === 'all'
              ? 'Tous'
              : status === 'published'
                ? 'Publiees'
                : status === 'draft'
                  ? 'Brouillons'
                  : 'Archivees'}
          </Button>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden border border-border/40 bg-card/40">
        <div className="h-[58vh] min-h-[420px]">
          <MapContainer center={mapCenter} zoom={2} style={{ width: '100%', height: '100%' }}>
            <MapFocusController focusedCoords={focusedCoords} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredPostcards.map((postcard) => (
              <Marker
                key={postcard.id}
                position={[postcard.coords!.lat!, postcard.coords!.lng!]}
                eventHandlers={{
                  click: () => setFocusedPostcardId(postcard.id),
                }}
              >
                <Popup minWidth={220}>
                  <div className="space-y-2">
                    <img
                      src={getFrontImageUrl(postcard)}
                      alt={postcard.location || 'Carte postale'}
                      className="w-full h-28 object-cover rounded-md border border-stone-100"
                    />
                    <div className="text-sm font-semibold text-stone-800">
                      {postcard.senderName || 'Carte'}
                    </div>
                    <div className="text-xs text-stone-500 flex items-center gap-1">
                      <MapPin size={12} />
                      {postcard.location || 'Lieu non precise'}
                    </div>
                    <Link
                      href={`/carte/${postcard.publicId}`}
                      target="_blank"
                      className="inline-flex"
                    >
                      <Button size="sm" className="h-8 text-xs">
                        Voir la carte
                      </Button>
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card/50 p-4">
        <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Mail size={16} />
          Cartes affichees ({filteredPostcards.length})
        </p>
        {filteredPostcards.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune carte geolocalisee pour ce filtre.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredPostcards.map((postcard) => (
              <button
                key={postcard.id}
                type="button"
                onClick={() => setFocusedPostcardId(postcard.id)}
                className={cn(
                  'flex items-center gap-3 rounded-lg border p-2 text-left transition-colors',
                  focusedPostcardId === postcard.id
                    ? 'border-teal-300 bg-teal-50/70'
                    : 'border-border/40 bg-background hover:bg-muted/40',
                )}
              >
                <img
                  src={getFrontImageUrl(postcard)}
                  alt={postcard.location || 'Carte'}
                  className="w-14 h-10 object-cover rounded-md border border-stone-100 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {postcard.recipientName || 'Destinataire'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {postcard.location || 'Lieu non precise'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
