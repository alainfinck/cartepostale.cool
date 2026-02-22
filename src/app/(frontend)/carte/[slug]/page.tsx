import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import { getPostcardByPublicId } from '@/actions/postcard-actions'
import ScratchCardWrapper from '@/components/view/ScratchCardWrapper'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Postcard as PayloadPostcard, Media } from '@/payload-types'
import { Postcard as FrontendPostcard, MediaItem } from '@/types'
import { RotateDevicePrompt } from '@/components/ui/rotate-device-prompt'
import SocialBar from '@/components/social/SocialBar'
import ViewPageTitle from '@/components/view/ViewPageTitle'
import PhotoFeed from '@/components/view/PhotoFeed'
import EnvelopeExperience from '@/components/view/EnvelopeExperience'
import { getCurrentUser } from '@/lib/auth'
import { PostcardTracking } from '@/components/analytics/PostcardTracking'

type SearchParams = {
  [key: string]: string | string[] | undefined
}

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams?: Promise<SearchParams>
}

// Helper to check if media is an object
function isMedia(media: any): media is Media {
  return media && typeof media === 'object' && ('url' in media || 'filename' in media)
}

// Build media URL (Payload stores in public/media, Next.js serves at /media/)
function mediaUrl(media: Media | null | undefined): string {
  if (!media || typeof media !== 'object') return ''
  if (media.url) return media.url
  if (media.filename) {
    const base = process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, '')
    if (base) return `${base}/${media.filename}`
    return `/media/${media.filename}`
  }
  return ''
}

// Normalize legacy API URLs to static /media/ URLs (fixes 400 on public page)
function normalizeMediaUrl(url: string): string {
  if (!url) return ''

  // Si c'est déjà une URL absolue, ne rien faire
  if (url.startsWith('http')) return url

  const base = process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, '')

  const apiMatch = url.match(/^\/api\/media\/file\/(.+)$/)
  if (apiMatch) {
    if (base) return `${base}/${apiMatch[1]}`
    return `/media/${apiMatch[1]}`
  }

  const mediaMatch = url.match(/^\/media\/(.+)$/)
  if (mediaMatch) {
    if (base) return `${base}/${mediaMatch[1]}`
    return url
  }

  // Si c'est juste le nom du fichier
  if (!url.startsWith('/') && base) {
    return `${base}/${url}`
  }

  return url
}

// Geocode location string via Nominatim (when postcard has location but no coords)
async function geocodeLocation(location: string): Promise<{ lat: number; lng: number } | null> {
  if (!location?.trim()) return null
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location.trim())}&limit=1`,
      { headers: { 'User-Agent': 'CartePostaleCool/1.0 (https://cartepostale.cool)' } },
    )
    const data = await res.json()
    const first = data?.[0]
    if (first?.lat != null && first?.lon != null) {
      return { lat: Number(first.lat), lng: Number(first.lon) }
    }
  } catch {
    // ignore
  }
  return null
}

// Mapper function
function mapPostcard(payloadPostcard: PayloadPostcard): FrontendPostcard {
  let frontImageUrl = payloadPostcard.frontImageURL || ''

  if (!frontImageUrl && isMedia(payloadPostcard.frontImage)) {
    frontImageUrl = mediaUrl(payloadPostcard.frontImage as Media)
  }
  frontImageUrl = normalizeMediaUrl(frontImageUrl)

  // Fallback if no image found (shouldn't happen for valid cards)
  if (!frontImageUrl) {
    frontImageUrl = 'https://img.cartepostale.cool/demo/photo-1507525428034-b723cf961d3e.jpg'
  }

  const mediaItems: MediaItem[] = []
  for (const item of (payloadPostcard.mediaItems || []) as any[]) {
    if (isMedia(item.media)) {
      const url = normalizeMediaUrl(mediaUrl(item.media as Media))
      if (!url) continue
      mediaItems.push({
        id: item.id || Math.random().toString(36).substring(7),
        type: item.type === 'video' ? 'video' : 'image',
        url,
        note: item.note || undefined,
      })
    }
  }

  return {
    id: payloadPostcard.publicId, // Use publicId for frontend ID
    frontImage: frontImageUrl,
    frontCaption: payloadPostcard.frontCaption || undefined,
    frontEmoji: payloadPostcard.frontEmoji || undefined,
    frontCaptionPosition:
      payloadPostcard.frontCaptionPosition?.x != null &&
      payloadPostcard.frontCaptionPosition?.y != null
        ? {
            x: Number(payloadPostcard.frontCaptionPosition.x),
            y: Number(payloadPostcard.frontCaptionPosition.y),
          }
        : undefined,
    message: payloadPostcard.message,
    recipientName: payloadPostcard.recipientName || '',
    senderName: payloadPostcard.senderName || '',
    location: payloadPostcard.location || '',
    stampStyle: payloadPostcard.stampStyle || 'classic',
    stampLabel: payloadPostcard.stampLabel || undefined,
    stampYear: payloadPostcard.stampYear || undefined,
    date: new Date(payloadPostcard.date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    mediaItems,
    isPremium: payloadPostcard.isPremium || false,
    // coordinates if available
    coords:
      payloadPostcard.coords?.lat && payloadPostcard.coords?.lng
        ? {
            lat: payloadPostcard.coords.lat,
            lng: payloadPostcard.coords.lng,
          }
        : undefined,
    scratchCardEnabled: payloadPostcard.scratchCardEnabled || false,
    scratchCardImage: isMedia(payloadPostcard.scratchCardImage)
      ? normalizeMediaUrl(mediaUrl(payloadPostcard.scratchCardImage as Media))
      : undefined,
  }
}

import { isCoordinate } from '@/lib/utils'

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const postcard = await getPostcardByPublicId(slug)

  if (!postcard) {
    return {
      title: 'Carte postale introuvable',
    }
  }

  const title = `Une carte postale de ${postcard.senderName} vous attend !`
  const description = isCoordinate(postcard.location)
    ? `Découvrez la carte envoyée par ${postcard.senderName}.`
    : `Découvrez la carte envoyée par ${postcard.senderName} depuis ${postcard.location}.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://cartepostale.cool/carte/${slug}`,
      siteName: 'CartePostale.cool',
      images: [
        {
          url: '/media/enveloppe-social2.jpg',
          width: 1200,
          height: 630,
          alt: 'cartepostale.cool - Une carte postale vous attend',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/media/enveloppe-social2.jpg'],
    },
  }
}

export default async function PostcardPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const resolvedSearchParams = (await (searchParams ?? Promise.resolve({}))) as SearchParams
  const envelopeParam = resolvedSearchParams.enveloppe
  const showEnvelope = envelopeParam !== '0'

  const payloadPostcard = await getPostcardByPublicId(slug)

  if (!payloadPostcard) {
    notFound()
  }

  const frontendPostcard = mapPostcard(payloadPostcard)
  // Geocode when we have location but no coords so the back map can display
  if (frontendPostcard.location && !frontendPostcard.coords) {
    const coords = await geocodeLocation(frontendPostcard.location)
    if (coords) frontendPostcard.coords = coords
  }

  // Check contribution access
  const user = await getCurrentUser()
  const payloadPostcardAny = payloadPostcard as any
  const isAuthor =
    user &&
    payloadPostcard.author &&
    (typeof payloadPostcard.author === 'object'
      ? payloadPostcard.author.id === user.id
      : payloadPostcard.author === user.id)

  const tokenParam = resolvedSearchParams.token as string | undefined
  // Access valid if author OR if token param matches DB token
  const hasContributionAccess =
    isAuthor || (tokenParam && tokenParam === payloadPostcardAny.contributionToken)

  if (hasContributionAccess) {
    frontendPostcard.contributionToken = payloadPostcardAny.contributionToken || undefined
    frontendPostcard.isContributionEnabled = payloadPostcardAny.isContributionEnabled ?? true
  }

  const heroSection = (
    <ViewPageTitle
      title="Vous avez reçu une carte postale !"
      senderName={frontendPostcard.senderName}
    />
  )

  const pageContent = (
    <div className="min-h-screen bg-[#fdfbf7] pt-9 md:pt-0 flex flex-col items-center overflow-x-hidden landscape:justify-center landscape:pt-4 landscape:pb-4">
      <RotateDevicePrompt />

      <div className="w-full max-w-6xl flex flex-col items-center perspective-[2000px] mb-4 md:mb-6 px-2 md:px-4">
        <ScratchCardWrapper postcard={frontendPostcard} views={payloadPostcard.views || 0} />
      </div>

      {/* Cible pour la barre de réactions (rendue ici par SocialBar via portal) */}
      <div id="reactions-under-card" className="w-full" />

      {/* Galerie photo (avant le livre d'or) */}
      {frontendPostcard.mediaItems && frontendPostcard.mediaItems.length > 0 && (
        <PhotoFeed
          mediaItems={frontendPostcard.mediaItems}
          senderName={frontendPostcard.senderName}
          postcardId={payloadPostcard.id}
        />
      )}

      {/* Réactions (affichées sous la carte via portal), partage et livre d'or */}
      <div className="w-full max-w-4xl px-4">
        <SocialBar
          postcardId={payloadPostcard.id}
          publicId={slug}
          senderName={frontendPostcard.senderName}
          initialViews={payloadPostcard.views || 0}
          initialShares={payloadPostcard.shares || 0}
          coords={frontendPostcard.coords}
          reactionsPortalTargetId="reactions-under-card"
        />
      </div>

      {/* Signature de l'expéditeur + lieu et date */}
      <div className="w-full py-8 text-center space-y-2">
        <p className="font-serif text-stone-600 text-lg sm:text-xl italic">
          — {frontendPostcard.senderName}
        </p>
        <p className="text-stone-500 text-sm">
          Carte postale envoyée avec amour
          {frontendPostcard.location?.trim() ? ` de ${frontendPostcard.location.trim()}` : ''}
          {frontendPostcard.date ? `, le ${frontendPostcard.date}` : ''}.
        </p>
      </div>

      <div className="w-full bg-white/50 backdrop-blur-sm border-y border-stone-100 py-16 md:py-24 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 text-orange-600 rounded-full mb-6">
            <Sparkles size={24} />
          </div>
          <h3 className="font-serif font-bold text-2xl text-stone-800 mb-3">
            Envoyez le même bonheur
          </h3>
          <p className="text-stone-500 mb-10 leading-relaxed font-medium">
            Créez vos propres cartes postales numériques et partagez vos meilleurs moments avec vos
            proches.
          </p>
          <Link href="/editor">
            <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-7 text-xl rounded-2xl shadow-2xl shadow-teal-100 transition-all hover:-translate-y-1 active:scale-[0.98]">
              Créer ma carte postale <ArrowRight className="ml-2" />
            </Button>
          </Link>
          <p className="mt-6 text-stone-400 text-xs font-medium">
            C&apos;est gratuit et instantané ✨
          </p>
        </div>
      </div>

      <div className="py-12 text-center space-y-6">
        <Link
          href="/"
          className="text-stone-400 hover:text-stone-600 text-sm font-medium transition-colors border-b border-transparent hover:border-stone-300 pb-1"
        >
          {'Retour au site'}
        </Link>
        <p className="text-stone-500 text-sm leading-relaxed max-w-sm mx-auto">
          Merci de faire vivre les cartes postales numériques. Chaque envoi compte.
        </p>
        <p className="text-stone-400 text-xs font-semibold tracking-wider uppercase">
          — L&apos;équipe cartepostale.cool
        </p>
      </div>
    </div>
  )

  return (
    <EnvelopeExperience enabled={showEnvelope} hero={heroSection}>
      <PostcardTracking postcardId={slug} senderName={frontendPostcard.senderName} />
      {pageContent}
    </EnvelopeExperience>
  )
}
