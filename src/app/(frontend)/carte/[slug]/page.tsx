import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import { getPostcardByPublicId } from '@/actions/postcard-actions'
import { getPayload } from 'payload'
import config from '@payload-config'
import ScratchCardWrapper from '@/components/view/ScratchCardWrapper'
import { Button } from '@/components/ui/button'
import { MapPin, Mail, Share2, Heart, Plus, RotateCw, ArrowRight, Sparkles } from 'lucide-react'
import { Postcard as PayloadPostcard, Media } from '@/payload-types'
import { getOptimizedImageUrl } from '@/lib/image-processing'
import * as motion from 'motion/react-client'
import { Postcard as FrontendPostcard, MediaItem } from '@/types'
import { RotateDevicePrompt } from '@/components/ui/rotate-device-prompt'
import SocialBar from '@/components/social/SocialBar'
import ViewPageTitle from '@/components/view/ViewPageTitle'
import PhotoFeed from '@/components/view/PhotoFeed'
import EnvelopeExperience from '@/components/view/EnvelopeExperience'
import { getCurrentUser } from '@/lib/auth'
import { PostcardTracking } from '@/components/analytics/PostcardTracking'
import { TextAnimate } from '@/components/ui/text-animate'

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
  if (!frontImageUrl || frontImageUrl.includes('placeholder')) {
    frontImageUrl = 'https://img.cartepostale.cool/demo/photo-1507525428034-b723cf961d3e.jpg'
  }

  // Optimization for main display
  frontImageUrl = getOptimizedImageUrl(frontImageUrl, { width: 1920 })

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

import EnvelopeHero from '@/components/view/EnvelopeHero'

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

  const heroSection = showEnvelope ? (
    <EnvelopeHero
      senderName={frontendPostcard.senderName}
      location={frontendPostcard.location}
      date={frontendPostcard.date}
      coords={frontendPostcard.coords}
    />
  ) : (
    <ViewPageTitle
      title="Vous avez reçu une carte postale !"
      senderName={frontendPostcard.senderName}
      location={frontendPostcard.location}
      date={frontendPostcard.date}
    />
  )

  const pageContent = (
    <div className="w-full bg-[#fdfbf7] pt-9 md:pt-0 flex flex-col items-center landscape:justify-center landscape:pt-4 landscape:pb-4">
      <RotateDevicePrompt />

      <div className="w-full max-w-6xl flex flex-col items-center perspective-[2000px] mb-0 px-2 md:px-4 min-h-[70vh] md:min-h-[80vh] justify-center">
        <ScratchCardWrapper postcard={frontendPostcard} views={payloadPostcard.views || 0} />
      </div>

      {/* Cible pour la barre de réactions (rendue ici par SocialBar via portal) — collée à la carte / languette */}
      <div id="reactions-under-card" className="w-full" />

      {/* Galerie photo (avant le livre d'or) */}
      {frontendPostcard.mediaItems && frontendPostcard.mediaItems.length > 0 && (
        <PhotoFeed
          mediaItems={frontendPostcard.mediaItems}
          senderName={frontendPostcard.senderName}
          postcardId={payloadPostcard.id}
          postcardDate={frontendPostcard.date}
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

      {/* Signature de l'expéditeur + lieu et date stylisés */}
      <div className="w-full py-8 md:py-12 text-center space-y-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="relative inline-block"
        >
          <p className="font-serif font-bold text-teal-700 text-4xl sm:text-5xl md:text-6xl -rotate-2 drop-shadow-sm tracking-tight">
            — {frontendPostcard.senderName}
          </p>
          <div className="absolute -bottom-3 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-teal-300/40 to-transparent" />
        </motion.div>

        <div className="max-w-2xl mx-auto px-8 py-10 rounded-[2.5rem] bg-white border border-stone-100 shadow-[0_20px_60px_rgba(0,0,0,0.03)] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-2 h-full bg-teal-500/20" />
          <TextAnimate
            by="character"
            animation="blurIn"
            duration={3}
            className="text-stone-600 text-lg sm:text-xl md:text-2xl leading-relaxed font-semibold italic md:px-6"
          >
            {`Carte postale envoyée avec amour${
              frontendPostcard.location?.trim() ? ` de ${frontendPostcard.location.trim()}` : ''
            }${frontendPostcard.date ? `, le ${frontendPostcard.date}` : ''}.`}
          </TextAnimate>
        </div>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="w-full bg-gradient-to-b from-white to-[#fdfbf7] pt-12 pb-24 md:pt-16 md:pb-40 px-4 relative"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-stone-200 to-transparent" />

        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-[3rem] p-10 md:p-20 shadow-[0_50px_120px_rgba(0,0,0,0.06)] border border-stone-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-teal-50/50 rounded-full blur-3xl -mr-40 -mt-40" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-50/50 rounded-full blur-3xl -ml-40 -mb-40" />

            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl rotate-6 mb-6 shadow-sm border border-orange-100/50 group hover:rotate-12 transition-transform duration-500">
                <Sparkles size={28} className="group-hover:scale-110 transition-transform" />
              </div>

              <h3 className="font-serif font-bold text-2xl md:text-3xl text-stone-800 mb-4 tracking-tight leading-tight">
                Envoyez le <br className="sm:hidden" />
                même bonheur
              </h3>

              <p className="text-stone-500 text-base md:text-lg mb-8 leading-relaxed max-w-xl mx-auto font-medium">
                Créez vos propres cartes postales numériques et partagez vos meilleurs moments avec
                vos proches.
              </p>

              <div className="max-w-md mx-auto space-y-10">
                <Link href="/editor">
                  <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-black h-20 sm:h-28 text-2xl sm:text-3xl rounded-[2rem] shadow-[0_30px_70px_rgba(13,148,136,0.35)] transition-all hover:-translate-y-2 active:scale-[0.98] group flex items-center justify-center gap-5">
                    <span>Créer ma carte</span>
                    <ArrowRight
                      className="group-hover:translate-x-3 transition-transform"
                      size={32}
                    />
                  </Button>
                </Link>

                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 1 }}
                  className="flex items-center justify-center gap-6"
                >
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-stone-200" />
                  <p className="text-teal-600 font-black tracking-widest text-sm uppercase px-2 whitespace-nowrap">
                    Gratuit et instantané ✨
                  </p>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-stone-200" />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <footer className="py-24 border-t border-stone-200/60 bg-white/30">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-12">
          {/* Retour au site */}
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-stone-500 hover:text-teal-600 font-bold transition-all duration-300"
          >
            <span className="text-lg md:text-xl border-b-2 border-transparent group-hover:border-teal-600 pb-1">
              Retour au site
            </span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Message de remerciement */}
          <div className="space-y-4">
            <p className="text-stone-600 text-lg md:text-2xl leading-relaxed max-w-2xl mx-auto font-medium font-serif italic">
              « Merci de faire vivre les cartes postales numériques. Chaque envoi compte. »
            </p>
          </div>

          {/* Logo et Signature */}
          <div className="pt-4 flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative bg-gradient-to-r from-pink-500 to-orange-400 p-2 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/20">
                <Mail className="text-white" size={24} />
                <div className="absolute -top-1 -right-1 rounded-full bg-white p-[2px]">
                  <Heart className="text-rose-500" size={16} />
                </div>
              </div>
              <span className="font-bold text-stone-800 text-xl md:text-2xl tracking-tighter">
                cartepostale.cool
              </span>
            </div>
            <p className="text-stone-400 text-xs md:text-sm font-black tracking-[0.4em] uppercase">
              — L&apos;ÉQUIPE CARTEPOSTALE.COOL
            </p>
          </div>
        </div>
      </footer>
    </div>
  )

  return (
    <EnvelopeExperience enabled={showEnvelope} hero={heroSection}>
      <PostcardTracking postcardId={slug} senderName={frontendPostcard.senderName} />
      {pageContent}
    </EnvelopeExperience>
  )
}
