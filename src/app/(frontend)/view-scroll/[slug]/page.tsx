import { notFound } from 'next/navigation'
import { getPostcardByPublicId } from '@/actions/postcard-actions'
import PostcardScrollFlow from '@/components/postcard/PostcardScrollFlow'
import { Postcard as PayloadPostcard, Media } from '@/payload-types'
import { Postcard as FrontendPostcard, MediaItem } from '@/types'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

// Helper to check if media is an object
function isMedia(media: any): media is Media {
  return media && typeof media === 'object' && ('url' in media || 'filename' in media)
}

// Build media URL
function mediaUrl(media: Media | null | undefined): string {
  if (!media || typeof media !== 'object') return ''
  if (media.url) return media.url
  if (media.filename) return `/media/${encodeURIComponent(media.filename)}`
  return ''
}

// Normalize legacy API URLs
function normalizeMediaUrl(url: string): string {
  const match = url.match(/^\/api\/media\/file\/(.+)$/)
  return match ? `/media/${match[1]}` : url
}

// Mapper function (Simplified for scroll view prototype)
function mapPostcard(payloadPostcard: PayloadPostcard): FrontendPostcard {
  let frontImageUrl = payloadPostcard.frontImageURL || ''

  if (!frontImageUrl && isMedia(payloadPostcard.frontImage)) {
    frontImageUrl = mediaUrl(payloadPostcard.frontImage as Media)
  }
  frontImageUrl = normalizeMediaUrl(frontImageUrl)

  if (!frontImageUrl) {
    frontImageUrl = 'https://img.cartepostale.cool/demo/photo-1507525428034-b723cf961d3e.jpg'
  }

  const mediaItems: MediaItem[] = (payloadPostcard.mediaItems || [])
    .map((item: any) => {
      if (isMedia(item.media)) {
        const url = normalizeMediaUrl(mediaUrl(item.media as Media))
        if (!url) return null
        return {
          id: item.id || Math.random().toString(36).substring(7),
          type: item.type === 'video' ? 'video' : 'image',
          url,
        }
      }
      return null
    })
    .filter((item): item is MediaItem => item !== null)

  return {
    id: payloadPostcard.publicId,
    frontImage: frontImageUrl,
    message: payloadPostcard.message,
    recipientName: payloadPostcard.recipientName || '',
    senderName: payloadPostcard.senderName || '',
    location: payloadPostcard.location || '',
    date: new Date(payloadPostcard.date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    mediaItems,
    isPremium: payloadPostcard.isPremium || false,
    stampStyle: payloadPostcard.stampStyle || 'classic',
    stampLabel: payloadPostcard.stampLabel || undefined,
    stampYear: payloadPostcard.stampYear || undefined,
    postmarkText: payloadPostcard.postmarkText || undefined,
    eventType: (payloadPostcard as any).eventType || undefined,
    coords:
      payloadPostcard.coords?.lat && payloadPostcard.coords?.lng
        ? {
            lat: payloadPostcard.coords.lat,
            lng: payloadPostcard.coords.lng,
          }
        : undefined,
  }
}

export default async function PostcardScrollPage({ params }: PageProps) {
  const { slug } = await params
  const payloadPostcard = await getPostcardByPublicId(slug)

  if (!payloadPostcard) {
    notFound()
  }

  const frontendPostcard = mapPostcard(payloadPostcard)

  return (
    <main className="min-h-screen">
      <PostcardScrollFlow postcard={frontendPostcard} />
    </main>
  )
}
