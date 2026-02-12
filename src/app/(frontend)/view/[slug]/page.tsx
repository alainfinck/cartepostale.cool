import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import { getPostcardByPublicId } from '@/actions/postcard-actions'
import PostcardView from '@/components/postcard/PostcardView'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Postcard as PayloadPostcard, Media } from '@/payload-types'
import { Postcard as FrontendPostcard, MediaItem } from '@/types'
import { RotateDevicePrompt } from "@/components/ui/rotate-device-prompt"
import SocialBar from '@/components/social/SocialBar'

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
            url: `https://cartepostale.cool/view/${slug}`,
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
        <div className="min-h-screen bg-[#fdfbf7] py-6 md:py-12 landscape:py-2 flex flex-col items-center justify-center overflow-x-hidden">
            <RotateDevicePrompt />

            {/* Header / Context */}
            <div className="text-center mb-4 md:mb-8 px-4 landscape:mb-2">
                <h1 className="text-xl md:text-4xl font-serif font-bold text-stone-800 mb-1 md:mb-2 landscape:text-lg">
                    Vous avez reçu une carte postale !
                </h1>
                <p className="text-stone-500 text-sm md:text-lg landscape:text-xs">
                    De la part de <span className="font-semibold text-teal-600">{frontendPostcard.senderName}</span>
                </p>
            </div>

            {/* Card View */}
            <div className="w-full max-w-[100vw] md:max-w-4xl flex justify-center perspective-[1000px] mb-6 md:mb-12 px-2 md:px-0 landscape:mb-4">
                <PostcardView 
                    postcard={frontendPostcard} 
                    flipped={false} 
                    isLarge={true}
                    className="shadow-2xl" 
                />
            </div>

            {/* Social Bar */}
            <SocialBar
                postcardId={payloadPostcard.id}
                publicId={slug}
                senderName={frontendPostcard.senderName}
                initialViews={payloadPostcard.views || 0}
                initialShares={payloadPostcard.shares || 0}
            />

            {/* CTA Section */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200 text-center max-w-md w-full">
                <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles size={32} />
                </div>
                <h3 className="font-serif font-bold text-xl text-stone-800 mb-2">
                    À votre tour !
                </h3>
                <p className="text-stone-500 mb-6">
                    Créez et envoyez votre propre carte postale numérique en quelques secondes. {"C'est"} gratuit.
                </p>
                <Link href="/editor">
                    <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg shadow-teal-100 transition-transform hover:-translate-y-1">
                        Créer ma carte postale <ArrowRight className="ml-2" />
                    </Button>
                </Link>
            </div>

            <div className="mt-8 text-center text-stone-400 text-sm">
                <Link href="/" className="hover:text-stone-600 underline">
                    {"Retour à l'accueil"}
                </Link>
            </div>

        </div>
    )
}
