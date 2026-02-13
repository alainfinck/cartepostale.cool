import { notFound } from 'next/navigation'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

interface PageProps {
    params: Promise<{ token: string }>
}

export default async function TrackingRedirectPage({ params }: PageProps) {
    const { token } = await params
    if (!token?.trim()) notFound()

    const payload = await getPayload({ config })

    const result = await payload.find({
        collection: 'postcard-tracking-links',
        where: { token: { equals: token.trim() } },
        limit: 1,
        depth: 1,
        overrideAccess: true,
    })

    const tracking = result.docs[0]
    if (!tracking) notFound()

    const postcardId = typeof tracking.postcard === 'object' ? tracking.postcard?.id : tracking.postcard
    if (!postcardId) notFound()

    const postcard = await payload.findByID({
        collection: 'postcards',
        id: postcardId as number,
        depth: 0,
    })

    if (!postcard?.publicId) notFound()
    if (postcard.status !== 'published') notFound()

    const search = new URLSearchParams({ t: token.trim() }).toString()
    redirect(`/carte/${postcard.publicId}${search ? `?${search}` : ''}`)
}
