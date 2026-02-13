import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import { getPostcardByPublicId } from '@/actions/postcard-actions'
import PostcardView from '@/components/postcard/PostcardView'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, Eye } from 'lucide-react'
import { NumberTicker } from '@/components/ui/number-ticker'
import { Postcard as PayloadPostcard, Media } from '@/payload-types'
import { Postcard as FrontendPostcard, MediaItem } from '@/types'
import { RotateDevicePrompt } from "@/components/ui/rotate-device-prompt"
import SocialBar from '@/components/social/SocialBar'
import ViewPageTitle from '@/components/view/ViewPageTitle'
import DistanceDisplay from '@/components/view/DistanceDisplay'

interface PageProps {
    params: Promise<{
        slug: string
    }>
}

// Helper to check if media is an object
function isMedia(media: any): media is Media {
    return media && typeof media === 'object' && 'url' in media
}

// Geocode location string via Nominatim (when postcard has location but no coords)
async function geocodeLocation(location: string): Promise<{ lat: number; lng: number } | null> {
    if (!location?.trim()) return null
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location.trim())}&limit=1`,
            { headers: { 'User-Agent': 'CartePostaleCool/1.0 (https://cartepostale.cool)' } }
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
        frontImageUrl = payloadPostcard.frontImage.url || ''
    }

    // Fallback if no image found (shouldn't happen for valid cards)
    if (!frontImageUrl) {
        frontImageUrl = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
    }

    const mediaItems: MediaItem[] = (payloadPostcard.mediaItems || []).map((item: any) => {
        if (isMedia(item.media)) {
            return {
                id: item.id || Math.random().toString(36).substring(7),
                type: item.type === 'video' ? 'video' : 'image',
                url: item.media.url || '',
            }
        }
        return null
    }).filter((item): item is MediaItem => item !== null)

    return {
        id: payloadPostcard.publicId, // Use publicId for frontend ID
        frontImage: frontImageUrl,
        frontCaption: payloadPostcard.frontCaption || undefined,
        frontEmoji: payloadPostcard.frontEmoji || undefined,
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
        coords: payloadPostcard.coords?.lat && payloadPostcard.coords?.lng ? {
            lat: payloadPostcard.coords.lat,
            lng: payloadPostcard.coords.lng
        } : undefined
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const postcard = await getPostcardByPublicId(slug)

    if (!postcard) {
        return {
            title: 'Carte postale introuvable',
        }
    }

    const title = `Une carte postale de ${postcard.senderName} vous attend !`
    const description = `Découvrez la carte postale envoyée par ${postcard.senderName} depuis ${postcard.location}.`

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'article',
            url: `https://cartepostale.cool/carte/${slug}`,
            siteName: 'CartePostale.cool',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
        },
    }
}

export default async function PostcardPage({ params }: PageProps) {
    const { slug } = await params
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

    return (
        <div className="min-h-screen bg-[#fdfbf7] flex flex-col items-center overflow-x-hidden">
            <RotateDevicePrompt />

            {/* Header / Titre avec effet d'apparition */}
            <ViewPageTitle
                title="Vous avez reçu une carte postale !"
                senderName={frontendPostcard.senderName}
            />

            {/* Card View */}
            <div className="w-full max-w-6xl flex flex-col items-center perspective-[2000px] mb-4 md:mb-6 px-2 md:px-4 relative">
                <PostcardView
                    postcard={frontendPostcard}
                    flipped={false}
                    isLarge={true}
                    className="shadow-[0_20px_50px_rgba(0,0,0,0.15)] md:shadow-[0_30px_70px_rgba(0,0,0,0.2)]"
                />

                {/* Distance Display */}
                {frontendPostcard.coords && (
                    <DistanceDisplay
                        targetCoords={frontendPostcard.coords}
                        senderName={frontendPostcard.senderName}
                    />
                )}

                {/* View Counter */}
                <div className="absolute -bottom-10 right-4 md:right-8 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/50 backdrop-blur-sm border border-stone-100/50 text-stone-400 text-xs font-bold uppercase tracking-widest shadow-sm">
                    <Eye size={14} className="text-stone-300" />
                    <NumberTicker value={payloadPostcard.views || 0} className="text-stone-400 font-bold" />
                    <span>vues</span>
                </div>
            </div>

            {/* Social Bar & Info */}
            <div className="w-full max-w-4xl px-4 mb-20">
                <SocialBar
                    postcardId={payloadPostcard.id}
                    publicId={slug}
                    senderName={frontendPostcard.senderName}
                    initialViews={payloadPostcard.views || 0}
                    initialShares={payloadPostcard.shares || 0}
                    coords={frontendPostcard.coords}
                />
            </div>

            {/* CTA Section - Simplified & Refined */}
            <div className="w-full bg-white/50 backdrop-blur-sm border-y border-stone-100 py-16 md:py-24 px-4">
                <div className="max-w-md mx-auto text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 text-orange-600 rounded-full mb-6">
                        <Sparkles size={24} />
                    </div>
                    <h3 className="font-serif font-bold text-2xl text-stone-800 mb-3">
                        Envoyez le même bonheur
                    </h3>
                    <p className="text-stone-500 mb-10 leading-relaxed font-medium">
                        Créez vos propres cartes postales numériques et partagez vos meilleurs moments avec vos proches.
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

            <div className="py-12 text-center">
                <Link href="/" className="text-stone-400 hover:text-stone-600 text-sm font-medium transition-colors border-b border-transparent hover:border-stone-300 pb-1">
                    {"Retour au site"}
                </Link>
            </div>
        </div>
    )
}
