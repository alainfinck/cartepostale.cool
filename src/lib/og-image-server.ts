/**
 * Server-only: génération d’images OG en JPEG avec Sharp.
 * Utilisé pour les routes opengraph-image (WhatsApp recommande < 600 KB, JPEG accepté partout).
 * Les images sont régénérées à chaque requête (pas de cache long) pour refléter le contenu à jour.
 */

import sharp from 'sharp'

const OG_WIDTH = 1000
const OG_HEIGHT = 525
/** Qualité JPEG pour rester sous 600 KB (WhatsApp). */
const JPEG_QUALITY = 82
const MAX_OG_BYTES = 600 * 1024

export const OG_IMAGE_WIDTH = OG_WIDTH
export const OG_IMAGE_HEIGHT = OG_HEIGHT

/**
 * Télécharge une image depuis une URL et la renvoie en JPEG 1000×525 (cover), sous 600 KB.
 * En cas d’erreur (fetch ou sharp), retourne un JPEG de fallback gris “Carte introuvable”.
 */
export async function generateOgImageJpeg(imageUrl: string): Promise<Buffer> {
  let buffer: Buffer
  try {
    const res = await fetch(imageUrl, {
      headers: { Accept: 'image/*' },
      next: { revalidate: 0 },
    })
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
    const arr = await res.arrayBuffer()
    buffer = Buffer.from(arr)
  } catch (e) {
    console.warn('[og-image] Fetch failed, using fallback:', (e as Error).message)
    return getFallbackOgJpeg()
  }

  try {
    let pipeline = sharp(buffer)
      .resize(OG_WIDTH, OG_HEIGHT, { fit: 'cover', position: 'center' })
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })

    let out = await pipeline.toBuffer()
    if (out.length > MAX_OG_BYTES) {
      out = await sharp(buffer)
        .resize(OG_WIDTH, OG_HEIGHT, { fit: 'cover', position: 'center' })
        .jpeg({ quality: 72, mozjpeg: true })
        .toBuffer()
    }
    if (out.length > MAX_OG_BYTES) {
      out = await sharp(buffer)
        .resize(800, 420, { fit: 'cover', position: 'center' })
        .jpeg({ quality: 75, mozjpeg: true })
        .toBuffer()
    }
    return out
  } catch (e) {
    console.warn('[og-image] Sharp failed, using fallback:', (e as Error).message)
    return getFallbackOgJpeg()
  }
}

/** JPEG gris 1000×525 pour “Carte introuvable”. */
function getFallbackOgJpeg(): Promise<Buffer> {
  return sharp({
    create: {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      channels: 3,
      background: { r: 253, g: 251, b: 247 },
    },
  })
    .jpeg({ quality: 80 })
    .toBuffer()
}
