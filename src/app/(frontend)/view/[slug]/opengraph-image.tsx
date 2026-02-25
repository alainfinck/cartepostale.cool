import { ImageResponse } from 'next/og'
import { getPostcardByPublicId } from '@/actions/postcard-actions'
import { getOptimizedImageUrl } from '@/lib/image-processing'

/** OG image size kept under 600 KB for WhatsApp (recommended < 600 KB). PNG from ImageResponse, so we use smaller dimensions + lighter source. */
const OG_WIDTH = 1000
const OG_HEIGHT = 525
const OG_SOURCE_QUALITY = 72

export const alt = 'Carte postale'
export const size = {
  width: OG_WIDTH,
  height: OG_HEIGHT,
}

export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const postcard = await getPostcardByPublicId(slug)

  if (!postcard) {
    return new ImageResponse(
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fdfbf7',
        }}
      >
        <h1>Carte postale introuvable</h1>
      </div>,
    )
  }

  const frontMedia = typeof postcard.frontImage === 'object' ? postcard.frontImage : null
  let imageUrl =
    postcard.frontImageURL ||
    (frontMedia &&
      (frontMedia.url ||
        (frontMedia.filename ? `/media/${encodeURIComponent(frontMedia.filename)}` : ''))) ||
    ''

  // Normalize legacy API URLs to static /media/ URLs
  if (imageUrl.startsWith('/api/media/file/')) {
    imageUrl = `/media/${imageUrl.replace(/^\/api\/media\/file\//, '')}`
  }

  if (!imageUrl) {
    // Fallback image
    imageUrl = 'https://cartepostale.cool/media/enveloppe-social2.jpg'
  } else {
    // Enforce absolute URLs for open graph images (Cloudflare CGI or local)
    if (imageUrl.startsWith('/')) {
      imageUrl = `https://cartepostale.cool${imageUrl}`
      imageUrl = getOptimizedImageUrl(imageUrl, { width: OG_WIDTH, quality: OG_SOURCE_QUALITY, fit: 'cover' })
    } else {
      imageUrl = getOptimizedImageUrl(imageUrl, { width: OG_WIDTH, quality: OG_SOURCE_QUALITY, fit: 'cover' })
    }
  }

  // Workaround for Vercel OG returning 500 when img src is not fully qualified or fails to load:
  // Ensure URL is explicitly absolute if `getOptimizedImageUrl` returns a relative path (it shouldn't, but safely check).
  if (imageUrl.startsWith('/')) {
    imageUrl = `https://cartepostale.cool${imageUrl}`
  }

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        height: '100%',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#e5e7eb', // stone-200 background
        padding: '40px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: 'white',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
          border: '24px solid white', // Epaisse bordure blanche comme demandé
          position: 'relative',
        }}
      >
        {/* Background Image / Photo Principal */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="Photo de la carte"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>
    </div>,
    {
      ...size,
    },
  )
}
