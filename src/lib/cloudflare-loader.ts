export default function cloudflareLoader({
  src,
  width,
  quality,
}: {
  src: string
  width: number
  quality?: number
}) {
  if (!src || src.startsWith('data:') || src.startsWith('blob:') || src.includes('localhost')) {
    return src
  }

  // Si c'est déjà une URL optimisée, on ne la touche pas
  if (src.includes('/cdn-cgi/image/')) {
    return src
  }

  // Ne pas optimiser les images locales du dossier /images/ ou les favicons
  if (
    src.startsWith('/images/') ||
    src.startsWith('/favicon.') ||
    src.startsWith('/android-') ||
    src.startsWith('/apple-touch-') ||
    src.startsWith('/_next/')
  ) {
    return src
  }

  const params = []
  const cappedWidth = Math.min(width, 1920)
  if (cappedWidth) params.push(`width=${cappedWidth}`)
  params.push(`quality=${quality || 80}`)
  params.push('format=auto')

  const paramsString = params.join(',')

  // Domaine par défaut pour les médias si l'URL est relative
  const defaultBase = 'https://img.cartepostale.cool'

  if (src.startsWith('http')) {
    try {
      const urlObj = new URL(src)

      // On n'optimise que si c'est notre domaine de médias R2
      if (
        urlObj.hostname !== 'img.cartepostale.cool' &&
        !urlObj.hostname.includes('r2.cloudflarestorage.com')
      ) {
        return src
      }

      const domain = `${urlObj.protocol}//${urlObj.host}`
      // On retire le slash initial et le préfixe media/ car le bucket est servi à la racine
      let path = urlObj.pathname.startsWith('/') ? urlObj.pathname.slice(1) : urlObj.pathname
      path = path.replace(/^media\//, '')

      return `${domain}/cdn-cgi/image/${paramsString}/${path}`
    } catch (e) {
      return src
    }
  }

  // Si c'est un chemin relatif (ex: /media/foo.jpg)
  // On retire /media/ car le bucket R2 est servi à la racine sur img.cartepostale.cool
  const cleanPath = src.replace(/^\/media\//, '').replace(/^\//, '')
  return `${defaultBase}/cdn-cgi/image/${paramsString}/${cleanPath}`
}
