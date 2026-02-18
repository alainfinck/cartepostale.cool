import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, Plus, ArrowRight, Sparkles, ExternalLink, Calendar, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getCurrentUser } from '@/lib/auth'
import { getMyPostcards } from '@/actions/espace-client-actions'
import { getOptimizedImageUrl } from '@/lib/image-processing'
import type { Postcard, Media } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Mon espace',
  description: 'Tableau de bord de votre espace client CartePostale.cool',
}

export const dynamic = 'force-dynamic'

function isMedia(m: unknown): m is Media {
  return !!m && typeof m === 'object' && 'url' in m && typeof (m as Media).url === 'string'
}

function getFrontImageUrl(postcard: Postcard): string {
  if (postcard.frontImageURL) return postcard.frontImageURL
  if (isMedia(postcard.frontImage) && postcard.frontImage?.url) return postcard.frontImage.url
  return '/images/demo/photo-1507525428034-b723cf961d3e.jpg'
}

const statusLabels: Record<string, string> = {
  published: 'Publiée',
  draft: 'Brouillon',
  archived: 'Archivée',
}

export default async function EspaceClientDashboardPage() {
  const user = await getCurrentUser()
  if (!user) return null

  const { docs: lastPostcards } = await getMyPostcards({ limit: 6, sort: '-createdAt' })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-stone-800">
          Bonjour{user.name ? ` ${user.name}` : ''} 👋
        </h1>
        <p className="text-stone-600 mt-1">
          Bienvenue dans votre espace client. Gérez vos cartes postales et votre compte.
        </p>
      </div>

      {lastPostcards.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-stone-800">Mes dernières cartes</h2>
            <Link
              href="/espace-client/cartes"
              className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              Voir toutes les cartes <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lastPostcards.map((card) => {
              const imageUrl = getOptimizedImageUrl(getFrontImageUrl(card), { width: 400 })
              const status = card.status || 'draft'
              return (
                <Link
                  key={card.id}
                  href={`/carte/${card.publicId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded-xl border border-stone-200 bg-white overflow-hidden shadow-sm hover:shadow-md hover:border-teal-200 transition-all"
                >
                  <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={card.recipientName || card.senderName || 'Carte postale'}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/90 text-stone-600 border border-stone-200">
                      {statusLabels[status] ?? status}
                    </span>
                  </div>
                  <div className="p-3 space-y-1">
                    <p className="text-sm font-semibold text-stone-800 truncate">
                      {card.recipientName || 'Sans destinataire'}
                    </p>
                    <p className="text-xs text-stone-500 flex items-center gap-1">
                      <Calendar size={12} className="shrink-0" />
                      {new Date(card.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    {card.location && (
                      <p className="text-xs text-stone-500 flex items-center gap-1 truncate">
                        <MapPin size={12} className="shrink-0" />
                        {card.location}
                      </p>
                    )}
                    <span className="inline-flex items-center gap-1 text-xs text-teal-600 font-medium mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Voir la carte <ExternalLink size={12} />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/espace-client/cartes"
          className="group flex items-start gap-4 p-6 rounded-2xl bg-white border border-stone-200 shadow-sm hover:shadow-md hover:border-teal-200 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center shrink-0 group-hover:bg-teal-200 transition-colors">
            <Mail className="w-6 h-6 text-teal-600" />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-stone-800 group-hover:text-teal-700">Mes cartes</h2>
            <p className="text-sm text-stone-500 mt-0.5">
              Voir, modifier et gérer toutes vos cartes postales.
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 mt-2">
              Accéder <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </Link>

        <Link
          href="/editor"
          className="group flex items-start gap-4 p-6 rounded-2xl bg-white border border-stone-200 shadow-sm hover:shadow-md hover:border-orange-200 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center shrink-0 group-hover:bg-orange-200 transition-colors">
            <Plus className="w-6 h-6 text-orange-600" />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-stone-800 group-hover:text-orange-700">Créer une carte</h2>
            <p className="text-sm text-stone-500 mt-0.5">
              Nouvelle carte postale avec vos photos et votre message.
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-orange-600 mt-2">
              Créer <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </Link>

        <Link
          href="/espace-client/compte"
          className="group flex items-start gap-4 p-6 rounded-2xl bg-white border border-stone-200 shadow-sm hover:shadow-md hover:border-teal-200 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center shrink-0 group-hover:bg-teal-200 transition-colors">
            <Sparkles className="w-6 h-6 text-teal-600" />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-stone-800 group-hover:text-teal-700">Mon compte</h2>
            <p className="text-sm text-stone-500 mt-0.5">
              Informations personnelles et préférences.
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 mt-2">
              Voir le profil <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </Link>
      </div>

      <div className="p-6 rounded-2xl bg-stone-50 border border-stone-100">
        <h3 className="font-bold text-stone-800 mb-2">Raccourci</h3>
        <p className="text-stone-600 text-sm mb-4">
          Vous pouvez à tout moment créer une nouvelle carte depuis le menu ou le bouton ci-dessous.
        </p>
        <Link href="/editor">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl gap-2">
            <Plus size={20} /> Créer une carte
          </Button>
        </Link>
      </div>
    </div>
  )
}
