import { ImageResponse } from 'next/og'
import { getPostcardByPublicId } from '@/actions/postcard-actions'

export const alt = 'Carte postale'
export const size = {
    width: 1200,
    height: 630,
}

export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const postcard = await getPostcardByPublicId(slug)

    if (!postcard) {
        return new ImageResponse(
            (
                <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', background: '#fdfbf7' }}>
                    <h1>Carte postale introuvable</h1>
                </div>
            )
        )
    }

    const sender = postcard.senderName || 'Un ami'
    const frontMedia = typeof postcard.frontImage === 'object' ? postcard.frontImage : null
    let imageUrl = postcard.frontImageURL || (frontMedia && (frontMedia.url || (frontMedia.filename ? `/media/${encodeURIComponent(frontMedia.filename)}` : ''))) || ''
    // Normalize legacy API URLs to static /media/ URLs
    if (imageUrl.startsWith('/api/media/file/')) {
        imageUrl = `/media/${imageUrl.replace(/^\/api\/media\/file\//, '')}`
    }

    if (!imageUrl) {
        // Fallback beautiful travel image
        imageUrl = 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200&auto=format&fit=crop'
    } else if (imageUrl.startsWith('/')) {
        // Correct URL for OG Image generation which happens on server side
        imageUrl = `https://cartepostale.cool${imageUrl}`
    }

    return new ImageResponse(
        (
            <div
                style={{
                    display: 'flex',
                    height: '100%',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#fdfbf7',
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
                        borderRadius: '24px',
                        overflow: 'hidden',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                        border: '12px solid white',
                        position: 'relative',
                    }}
                >
                    {/* Background Image */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={imageUrl}
                        alt="Postcard Front"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                    />

                    {/* Overlay for text readability */}
                    <div
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '50%',
                            background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.4), transparent)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                            padding: '60px 40px',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                            <div style={{ width: '40px', height: '3px', backgroundColor: '#fbbf24', marginRight: '16px' }}></div>
                            <span style={{ color: 'white', fontSize: '24px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '4px' }}>
                                Carte Postale
                            </span>
                        </div>
                        <h1 style={{ color: 'white', fontSize: '64px', margin: 0, fontWeight: 800, lineHeight: 1.1 }}>
                            Vous avez reçu une carte de <span style={{ color: '#2dd4bf' }}>{sender}</span> !
                        </h1>
                    </div>

                    {/* Stamp lookalike in corner */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '40px',
                            right: '40px',
                            width: '120px',
                            height: '150px',
                            backgroundColor: 'white',
                            padding: '8px',
                            borderRadius: '6px',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            border: '2px dashed #d1d5db',
                        }}
                    >
                        <div style={{ width: '100%', height: '80%', backgroundColor: '#f1f5f9', borderRadius: '4px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ fontSize: '32px' }}>📩</div>
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#94a3b8' }}>2024</span>
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}
