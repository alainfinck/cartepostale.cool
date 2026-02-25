import { getPostcardByPublicId } from '@/actions/postcard-actions'
import {
  getOptimizedImageUrl,
  normalizeMediaUrlToImgDomain,
} from '@/lib/image-processing'
import {
  generateOgImageJpeg,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
} from '@/lib/og-image-server'

/** OG image en JPEG pour rester sous 600 KB (WhatsApp). Régénérée à chaque requête. */
export const alt = 'Carte postale'
export const size = { width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT }
export const contentType = 'image/jpeg'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const postcard = await getPostcardByPublicId(slug)

  let imageUrl: string
  if (!postcard) {
    imageUrl = 'https://cartepostale.cool/media/enveloppe-social2.jpg'
  } else {
    const frontMedia = typeof postcard.frontImage === 'object' ? postcard.frontImage : null
    imageUrl =
      postcard.frontImageURL ||
      (frontMedia &&
        (frontMedia.url ||
          (frontMedia.filename
            ? `/media/${encodeURIComponent(String(frontMedia.filename))}`
            : ''))) ||
      ''
    if (imageUrl.startsWith('/api/media/file/')) {
      imageUrl = `/media/${imageUrl.replace(/^\/api\/media\/file\//, '')}`
    }
    if (!imageUrl) {
      imageUrl = 'https://cartepostale.cool/media/enveloppe-social2.jpg'
    } else {
      if (imageUrl.startsWith('/')) {
        imageUrl = `https://cartepostale.cool${imageUrl}`
      }
      imageUrl = normalizeMediaUrlToImgDomain(imageUrl)
      imageUrl = getOptimizedImageUrl(imageUrl, {
        width: OG_IMAGE_WIDTH,
        quality: 78,
        fit: 'cover',
      })
      if (imageUrl.startsWith('/')) {
        imageUrl = `https://cartepostale.cool${imageUrl}`
      }
    }
  }

  const jpegBuffer = await generateOgImageJpeg(imageUrl)
  return new Response(jpegBuffer, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
