/**
 * Utilitaires pour le traitement d'images côté client.
 * Pour tous les types (JPEG, PNG, HEIC, WebP) :
 * - Redimensionnement au max 2k (2048px)
 * - Conversion en JPEG (qualité 80%) côté navigateur
 * HEIC/HEIF : conversion via heic2any puis resize ; PNG/WebP/JPEG : dessin sur canvas puis export JPEG.
 */

export const MAX_IMAGE_PX = 2048
export const JPEG_QUALITY = 0.8

const HEIC_TYPES = ['image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence']

/** Redimensionne une image (data URL) pour que le plus grand côté soit au max MAX_IMAGE_PX, en JPEG 80%. */
export function resizeImageToMax2K(dataUrl: string, maxPx: number = MAX_IMAGE_PX): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      let w = img.naturalWidth
      let h = img.naturalHeight

      // On recalcule les dimensions si besoin
      if (w > maxPx || h > maxPx) {
        if (w > h) {
          h = Math.round((h * maxPx) / w)
          w = maxPx
        } else {
          w = Math.round((w * maxPx) / h)
          h = maxPx
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(dataUrl)
        return
      }
      ctx.drawImage(img, 0, 0, w, h)
      try {
        // Toujours exporter en JPEG qualité 80% comme demandé
        const resized = canvas.toDataURL('image/jpeg', JPEG_QUALITY)
        resolve(resized)
      } catch {
        resolve(dataUrl)
      }
    }
    img.onerror = () => reject(new Error('Image load failed'))
    img.src = dataUrl
  })
}

/** Lit un fichier, convertit HEIC si besoin, et redimensionne au max 2k JPEG 80%. */
export async function fileToProcessedDataUrl(file: File): Promise<string> {
  const isHeic =
    HEIC_TYPES.includes(file.type) || /\.heic$/i.test(file.name) || /\.heif$/i.test(file.name)
  let blob: Blob = file
  if (isHeic) {
    const heic2any = (await import('heic2any')).default
    const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: JPEG_QUALITY })
    blob = Array.isArray(converted) ? converted[0] : converted
  }
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
  return resizeImageToMax2K(dataUrl)
}

/** Charge une image depuis une URL et la redimensionne côté client (max 2k, JPEG 80%). */
export async function urlToResizedDataUrl(url: string): Promise<string> {
  const fullUrl = url.startsWith('http')
    ? url
    : typeof window !== 'undefined'
      ? window.location.origin + url
      : url
  const res = await fetch(fullUrl)
  const blob = await res.blob()
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
  return resizeImageToMax2K(dataUrl)
}

/** Convertit une data URL (ex. JPEG 80% après resize) en Blob pour l’upload R2. */
export function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  return fetch(dataUrl).then((r) => r.blob())
}

/** Lit un fichier en data URL sans resize (pour vidéos). */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/** Largeur max raisonnable pour l'affichage écran (évite 4K/3840 inutile). */
export const DISPLAY_MAX_WIDTH = 1920

const IMG_DOMAIN = 'https://img.cartepostale.cool'

/**
 * Normalise une URL média du site principal (cartepostale.cool) vers le domaine CDN (img.cartepostale.cool)
 * pour que getOptimizedImageUrl puisse appliquer cdn-cgi/image.
 */
export function normalizeMediaUrlToImgDomain(url: string): string {
  if (!url || !url.startsWith('http')) return url
  try {
    const u = new URL(url)
    if (u.hostname !== 'cartepostale.cool' && u.hostname !== 'www.cartepostale.cool') return url
    if (!u.pathname.startsWith('/media/')) return url
    const path = u.pathname.replace(/^\/media\//, '')
    return `${IMG_DOMAIN}/${path}`
  } catch {
    return url
  }
}

/**
 * Retourne une URL d'image optimisée via Cloudflare Image Resizing (cdn-cgi/image).
 * Format cible: https://img.domain.com/cdn-cgi/image/params/path/to/image
 * @param url URL de l'image source (peut être absolue ou juste le nom du fichier)
 * @param options Options de redimensionnement
 */
export function getOptimizedImageUrl(
  url: string,
  options: {
    width?: number
    height?: number
    quality?: number
    fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad'
  } = {},
) {
  if (!url || url.startsWith('data:') || url.startsWith('blob:') || url.includes('localhost')) {
    return url
  }

  // Si c'est déjà une URL optimisée, on ne la touche pas
  if (url.includes('/cdn-cgi/image/')) {
    return url
  }

  // Ne pas optimiser les images locales du dossier /images/ ou les favicons
  if (
    url.startsWith('/images/') ||
    url.startsWith('/favicon.') ||
    url.startsWith('/android-') ||
    url.startsWith('/apple-touch-')
  ) {
    return url
  }

  const params = []
  if (options.width) {
    params.push(`width=${Math.min(options.width, DISPLAY_MAX_WIDTH)}`)
  }
  if (options.height) {
    // If width is also provided, fit will handle it, but capping height is harder.
    // Usually width is the primary constraint mentioned by the user.
    params.push(`height=${options.height}`)
  }
  params.push(`quality=${options.quality || 80}`)
  params.push('format=auto')
  if (options.fit) params.push(`fit=${options.fit}`)

  const paramsString = params.join(',')

  // Domaine par défaut pour les médias si l'URL est relative
  const defaultBase = 'https://img.cartepostale.cool'

  if (url.startsWith('http')) {
    try {
      const urlObj = new URL(url)

      // On n'optimise que si c'est notre domaine de médias R2
      if (
        urlObj.hostname !== 'img.cartepostale.cool' &&
        !urlObj.hostname.includes('r2.cloudflarestorage.com')
      ) {
        return url
      }

      const domain = `${urlObj.protocol}//${urlObj.host}`
      // On retire le slash initial et le préfixe media/ car le bucket est servi à la racine
      let path = urlObj.pathname.startsWith('/') ? urlObj.pathname.slice(1) : urlObj.pathname
      path = path.replace(/^media\//, '')

      return `${domain}/cdn-cgi/image/${paramsString}/${path}`
    } catch (e) {
      return url
    }
  }

  // Si c'est un chemin relatif (ex: /media/foo.jpg)
  // On retire /media/ car le bucket R2 est servi à la racine sur img.cartepostale.cool
  const cleanPath = url.replace(/^\/media\//, '').replace(/^\//, '')
  return `${defaultBase}/cdn-cgi/image/${paramsString}/${cleanPath}`
}
