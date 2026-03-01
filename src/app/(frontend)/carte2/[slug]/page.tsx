import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import { getPostcardByPublicId } from '@/actions/postcard-actions'
import { getPayload } from 'payload'
import config from '@payload-config'
import ScratchCardWrapper from '@/components/view/ScratchCardWrapper'
import { Button } from '@/components/ui/button'
import { MapPin, Mail, Sparkles } from 'lucide-react'
import { Postcard as PayloadPostcard, Media } from '@/payload-types'
import { getOptimizedImageUrl } from '@/lib/image-processing'
import * as motion from 'motion/react-client'
import { Postcard as FrontendPostcard, MediaItem } from '@/types'
import ViewPageTitle from '@/components/view/ViewPageTitle'
import EnvelopeExperience from '@/components/view/EnvelopeExperience'
import { getCurrentUser } from '@/lib/auth'
import { PostcardTracking } from '@/components/analytics/PostcardTracking'
import { demoPostcards } from '@/data/demoPostcards'

// Showcase postcards extracted from GalerieClient
const SHOWCASE_POSTCARDS: FrontendPostcard[] = [
  {
    id: 'show-1',
    frontImage: 'https://img.cartepostale.cool/demo/photo-1501785888041-af3ef285b470.jpg',
    location: 'Grand Canyon, USA',
    message:
      "L'immensité de ce lieu est impossible à décrire. Les couleurs au coucher du soleil sont irréelles. Un souvenir gravé à jamais !",
    recipientName: 'Papa & Maman',
    senderName: 'Sarah',
    stampStyle: 'classic',
    date: '12 Oct 2024',
    isPremium: true,
    coords: { lat: 36.0544, lng: -112.1401 },
    mediaItems: [
      {
        id: 'm1',
        type: 'image',
        url: 'https://img.cartepostale.cool/demo/photo-1474044159687-1ee9f3a51722.jpg',
      },
      {
        id: 'm2',
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-grand-canyon-scenery-view-4844-large.mp4',
      },
      {
        id: 'm3',
        type: 'image',
        url: 'https://img.cartepostale.cool/demo/photo-1527333656061-ca7adf608ae1.jpg',
      },
    ],
  },
  {
    id: 'show-2',
    frontImage: 'https://img.cartepostale.cool/demo/photo-1493976040374-85c8e12f0c0e.jpg',
    location: 'Kyoto, Japon',
    message:
      "J'ai trouvé le jardin zen le plus paisible au monde. Le matcha ici est une révélation. La bambouseraie d'Arashiyama est magique.",
    recipientName: 'Tom',
    senderName: 'Jen',
    stampStyle: 'airmail',
    date: '05 Nov 2024',
    isPremium: true,
    coords: { lat: 35.0116, lng: 135.7681 },
    mediaItems: [
      {
        id: 'k1',
        type: 'image',
        url: 'https://img.cartepostale.cool/demo/photo-1528164344705-47542687000d.jpg',
      },
      {
        id: 'k2',
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-small-waterfall-in-a-japanese-garden-4268-large.mp4',
      },
    ],
  },
  {
    id: 'show-3',
    frontImage: 'https://img.cartepostale.cool/demo/photo-1507525428034-b723cf961d3e.jpg',
    location: 'Côte Amalfitaine, Italie',
    message:
      "Ciao ! La dolce vita pure. Les citrons sont aussi gros que des ballons, la mer est d'un bleu électrique.",
    recipientName: 'Sophie',
    senderName: 'Marc',
    stampStyle: 'classic',
    date: '14 Juil 2024',
    isPremium: false,
    coords: { lat: 40.6333, lng: 14.6002 },
  },
  {
    id: 'show-4',
    frontImage: 'https://img.cartepostale.cool/demo/photo-1506929562872-bb421503ef21.jpg',
    location: 'Îles Phi Phi, Thaïlande',
    message:
      "Le paradis sur terre. L'eau est si chaude et transparente. On a exploré des lagons secrets ce matin !",
    recipientName: 'La bande',
    senderName: 'Elena',
    stampStyle: 'modern',
    date: '02 Dec 2024',
    isPremium: true,
    coords: { lat: 7.7407, lng: 98.7784 },
    mediaItems: [
      {
        id: 'p1',
        type: 'image',
        url: 'https://img.cartepostale.cool/demo/photo-1552465011-b4e21bf6e79a.jpg',
      },
      {
        id: 'p2',
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-tropical-beach-with-palm-trees-from-above-4122-large.mp4',
      },
    ],
  },
  {
    id: 'show-5',
    frontImage: 'https://img.cartepostale.cool/demo/photo-1502602898657-3e91760cbb34.jpg',
    location: 'Paris, France',
    message:
      'La ville lumière porte bien son nom. Un croissant au beurre, un café crème et la Tour Eiffel qui scintille... Le bonheur à la française.',
    recipientName: 'Mamie',
    senderName: 'Léa',
    stampStyle: 'classic',
    date: '20 Sep 2024',
    isPremium: false,
    coords: { lat: 48.8566, lng: 2.3522 },
  },
  {
    id: 'show-6',
    frontImage: 'https://img.cartepostale.cool/demo/photo-1531366936337-7c912a4589a7.jpg',
    location: 'Tromsø, Norvège',
    message:
      "Les aurores boréales dansent au-dessus de nos têtes chaque soir. C'est le spectacle le plus incroyable que j'aie jamais vu.",
    recipientName: 'Julien & Marie',
    senderName: 'Alex',
    stampStyle: 'airmail',
    date: '18 Jan 2025',
    isPremium: true,
    coords: { lat: 69.6496, lng: 18.956 },
    mediaItems: [
      {
        id: 'n1',
        type: 'image',
        url: 'https://img.cartepostale.cool/demo/photo-1531366936337-7c912a4589a7.jpg',
      },
      {
        id: 'n2',
        type: 'image',
        url: 'https://img.cartepostale.cool/demo/photo-1483347756197-71ef80e95f73.jpg',
      },
    ],
  },
]

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

// Encode path for R2 (same logic as payload.config generateFileURL)
function encodeR2Path(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/')
}

// Build media URL (Payload stores in public/media or R2; R2 uses R2_PUBLIC_BASE_URL)
function mediaUrl(media: Media | null | undefined): string {
  if (!media || typeof media !== 'object') return ''
  if (media.url && typeof media.url === 'string' && media.url.startsWith('http')) return media.url
  if (media.filename) {
    const base = process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, '')
    if (base) return `${base}/${encodeR2Path(media.filename)}`
    return `/media/${encodeR2Path(media.filename)}`
  }
  return ''
}

// Normalize legacy API URLs to static /media/ or R2 URLs (fixes 400 on public page)
function normalizeMediaUrl(url: string): string {
  if (!url) return ''

  if (url.startsWith('http')) return url

  const base = process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, '')

  const apiMatch = url.match(/^\/api\/media\/file\/(.+)$/)
  if (apiMatch) {
    const path = decodeURIComponent(apiMatch[1])
    if (base) return `${base}/${encodeR2Path(path)}`
    return `/media/${encodeR2Path(path)}`
  }

  const mediaMatch = url.match(/^\/media\/(.+)$/)
  if (mediaMatch) {
    const path = decodeURIComponent(mediaMatch[1])
    if (base) return `${base}/${encodeR2Path(path)}`
    return url
  }

  if (!url.startsWith('/') && base) {
    return `${base}/${encodeR2Path(url)}`
  }

  return url
}

import { unstable_cache } from 'next/cache'

// Geocode location string via Nominatim (when postcard has location but no coords)
// Wrapped in unstable_cache to avoid repeated external API calls
const cachedGeocodeLocation = unstable_cache(
  async (location: string): Promise<{ lat: number; lng: number } | null> => {
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
  },
  ['geocode-location'],
  { revalidate: 3600 * 24 * 30 }, // 30 days
)

async function geocodeLocation(location: string) {
  return cachedGeocodeLocation(location)
}

// Mapper function
function mapPostcard(payloadPostcard: PayloadPostcard): FrontendPostcard {
  let frontImageUrl = payloadPostcard.frontImageURL || ''

  if (!frontImageUrl && isMedia(payloadPostcard.frontImage)) {
    frontImageUrl = mediaUrl(payloadPostcard.frontImage as Media)
  }
  frontImageUrl = normalizeMediaUrl(frontImageUrl)

  // Fallback if no image found (shouldn't happen for valid cards)
  if (!frontImageUrl || frontImageUrl.includes('placeholder')) {
    frontImageUrl = 'https://img.cartepostale.cool/demo/photo-1507525428034-b723cf961d3e.jpg'
  }

  // L'optimisation dynamique est gérée par les composants clients (ex: Next Image avec loader Cloudflare)
  // frontImageUrl = getOptimizedImageUrl(frontImageUrl, { width: 1920 })

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
        location: (item.media as any).location || undefined,
        exif: (item.media as any).exif || undefined,
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
    frontCaptionFontFamily: payloadPostcard.frontCaptionFontFamily || undefined,
    frontCaptionFontSize: payloadPostcard.frontCaptionFontSize ?? undefined,
    frontCaptionColor: payloadPostcard.frontCaptionColor || undefined,
    frontTextBgOpacity: payloadPostcard.frontTextBgOpacity ?? undefined,
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
    audioMessage: (payloadPostcard as any).audioMessage ?? undefined,
    audioDuration: (payloadPostcard as any).audioDuration ?? undefined,
    backgroundMusic: (payloadPostcard as any).backgroundMusic ?? undefined,
    backgroundMusicTitle: (payloadPostcard as any).backgroundMusicTitle ?? undefined,
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
    puzzleCardEnabled: payloadPostcard.puzzleCardEnabled || false,
    puzzleCardDifficulty: (payloadPostcard.puzzleCardDifficulty as '3' | '4' | '5') || '3',
    eventType: (payloadPostcard as any).eventType ?? undefined,
    agencyBanner: (() => {
      const agencyObj =
        typeof payloadPostcard.agency === 'object' && payloadPostcard.agency
          ? (payloadPostcard.agency as any)
          : null
      if (!agencyObj?.bannerEnabled || !agencyObj?.bannerText) return undefined
      return {
        enabled: true as const,
        text: agencyObj.bannerText || undefined,
        subtext: agencyObj.bannerSubtext || undefined,
        color: agencyObj.bannerColor || '#0d9488',
        textColor: agencyObj.bannerTextColor || '#ffffff',
        link: agencyObj.bannerLink || undefined,
      }
    })(),
  }
}

import { isCoordinate } from '@/lib/utils'

/** URL d’image Open Graph : utilise Cloudflare cdn-cgi/image pour img.cartepostale.cool */
function ogImageUrl(url: string): string {
  return getOptimizedImageUrl(url, { width: 1000, quality: 85, fit: 'cover' })
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params

  // Ensure absolute image URLs
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://cartepostale.cool'

  // Check demo postcards
  const demoCard =
    demoPostcards.find((c) => c.id === slug) || SHOWCASE_POSTCARDS.find((c) => c.id === slug)
  if (demoCard) {
    const title = `Une carte postale de ${demoCard.senderName} vous attend !`
    const description = isCoordinate(demoCard.location)
      ? `Découvrez la carte envoyée par ${demoCard.senderName}.`
      : `Découvrez la carte envoyée par ${demoCard.senderName} depuis ${demoCard.location}.`

    // Use frontImage or fallback
    const imageUrl = demoCard.frontImage || `${baseUrl}/media/enveloppe-social3.jpg`
    const absoluteImageUrl = imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`
    const imageForOg = ogImageUrl(absoluteImageUrl)

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'article',
        url: `${baseUrl}/carte/${slug}`,
        siteName: 'CartePostale.cool',
        images: [
          {
            url: imageForOg,
            width: 1000,
            height: 525,
            alt: `Carte postale de ${demoCard.senderName}`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageForOg],
      },
    }
  }

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

  // Map to frontend postcard to easily grab front image logic
  const frontendPostcard = mapPostcard(postcard)
  // Use frontImage or fallback to enveloppe-social3.jpg
  const imageUrl =
    frontendPostcard.frontImage && !frontendPostcard.frontImage.includes('placeholder')
      ? frontendPostcard.frontImage
      : `${baseUrl}/media/enveloppe-social3.jpg`
  const absoluteImageUrl = imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`
  const imageForOg = ogImageUrl(absoluteImageUrl)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `${baseUrl}/carte/${slug}`,
      siteName: 'CartePostale.cool',
      images: [
        {
          url: imageForOg,
          width: 1000,
          height: 525,
          alt: `Carte postale de ${postcard.senderName}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageForOg],
    },
  }
}

import EnvelopeHero from '@/components/view/EnvelopeHero'
import PostcardEmbedView from '@/components/view/PostcardEmbedView'
import { getEventTheme } from '@/lib/event-theme'

export default async function PostcardPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const resolvedSearchParams = (await (searchParams ?? Promise.resolve({}))) as SearchParams
  const envelopeParam = resolvedSearchParams.enveloppe
  const showEnvelope = envelopeParam !== '0'
  const paymentSuccess = resolvedSearchParams.payment_success === 'true'
  /** Mode intégration : affiche uniquement le composant postcard recto/verso (pour iframe sur site tiers) */
  const isEmbed = resolvedSearchParams.embed === '1'

  // Handling demo postcards
  const demoPostcard =
    demoPostcards.find((c) => c.id === slug) || SHOWCASE_POSTCARDS.find((c) => c.id === slug)

  let frontendPostcard: FrontendPostcard
  let payloadPostcardId: number | undefined
  let payloadPostcardViews = 0
  let payloadPostcardShares = 0
  let isDemo = false

  if (demoPostcard) {
    frontendPostcard = { ...demoPostcard }
    isDemo = true
  } else {
    const payloadPostcard = await getPostcardByPublicId(slug)
    if (!payloadPostcard) {
      notFound()
    }
    frontendPostcard = mapPostcard(payloadPostcard)
    payloadPostcardId = payloadPostcard.id
    payloadPostcardViews = payloadPostcard.views || 0
    payloadPostcardShares = payloadPostcard.shares || 0
  }

  // Geocode when we have location but no coords so the back map can display
  if (frontendPostcard.location && !frontendPostcard.coords) {
    const coords = await geocodeLocation(frontendPostcard.location)
    if (coords) frontendPostcard.coords = coords
  }

  // Mode intégration : uniquement le composant postcard avec effet recto/verso
  if (isEmbed) {
    return (
      <div className="min-h-screen w-full">
        {!isDemo && <PostcardTracking postcardId={slug} senderName={frontendPostcard.senderName} />}
        <PostcardEmbedView postcard={frontendPostcard} views={payloadPostcardViews} />
      </div>
    )
  }

  // Check contribution access (only for real cards)
  let hasContributionAccess = false
  if (!isDemo && !demoPostcard) {
    const user = await getCurrentUser()
    const payloadPostcard = await getPostcardByPublicId(slug) // refetch or ideally reuse
    if (payloadPostcard) {
      const payloadPostcardAny = payloadPostcard as any
      const isAuthor =
        user &&
        payloadPostcard.author &&
        (typeof payloadPostcard.author === 'object'
          ? payloadPostcard.author.id === user.id
          : payloadPostcard.author === user.id)

      const tokenParam = resolvedSearchParams.token as string | undefined
      // Access valid if author OR if token param matches DB token
      hasContributionAccess =
        !!isAuthor || !!(tokenParam && tokenParam === payloadPostcardAny.contributionToken)

      if (hasContributionAccess) {
        frontendPostcard.contributionToken = payloadPostcardAny.contributionToken || undefined
        frontendPostcard.isContributionEnabled = payloadPostcardAny.isContributionEnabled ?? true
      }
    }
  }

  const theme = getEventTheme(frontendPostcard.eventType)

  const heroSection = showEnvelope ? (
    <EnvelopeHero
      senderName={frontendPostcard.senderName}
      location={frontendPostcard.location}
      date={frontendPostcard.date}
      coords={frontendPostcard.coords}
      eventType={frontendPostcard.eventType}
    />
  ) : (
    <ViewPageTitle
      title="Vous avez reçu une carte postale !"
      senderName={frontendPostcard.senderName}
      location={frontendPostcard.location}
      date={frontendPostcard.date}
      eventType={frontendPostcard.eventType}
    />
  )

  const pageContent = (
    <div
      className={`w-full ${theme.pageBg} flex flex-col items-center landscape:pb-4 relative pt-0`}
    >
      <div className="w-full max-w-6xl flex flex-col items-center perspective-[2000px] mb-0 px-2 md:px-4 min-h-[70vh] md:min-h-[80vh] pt-8 md:pt-12">
        <ScratchCardWrapper postcard={frontendPostcard} views={payloadPostcardViews} />
      </div>
    </div>
  )

  return (
    <EnvelopeExperience
      enabled={showEnvelope}
      hero={heroSection}
      frontImage={frontendPostcard.frontImage}
    >
      {!isDemo && <PostcardTracking postcardId={slug} senderName={frontendPostcard.senderName} />}
      {pageContent}
    </EnvelopeExperience>
  )
}
