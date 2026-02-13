/**
 * Utilitaires pour le traitement d'images côté client :
 * - Redimensionnement au max 2k (2048px)
 * - Conversion en JPEG (qualité 80%)
 * - Support de HEIC/HEIF via heic2any
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
    const isHeic = HEIC_TYPES.includes(file.type) || /\.heic$/i.test(file.name) || /\.heif$/i.test(file.name)
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
    const fullUrl = url.startsWith('http') ? url : (typeof window !== 'undefined' ? window.location.origin + url : url)
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

/**
 * Retourne une URL d'image optimisée via Cloudflare Image Resizing (cdn-cgi/image).
 * @param url URL de l'image source
 * @param options Options de redimensionnement
 */
export function getOptimizedImageUrl(url: string, options: { width?: number; height?: number; quality?: number; fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad' } = {}) {
    if (!url || url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('/') || url.includes('localhost')) {
        return url
    }

    const params = []
    if (options.width) params.push(`width=${options.width}`)
    if (options.height) params.push(`height=${options.height}`)
    params.push(`quality=${options.quality || 80}`)
    params.push('format=auto')
    if (options.fit) params.push(`fit=${options.fit}`)

    const paramsString = params.join(',')

    return `/cdn-cgi/image/${paramsString}/${url}`
}
