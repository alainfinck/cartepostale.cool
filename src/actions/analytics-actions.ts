'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'
// ua-parser-js v2: call as function (uaString) => IResult
import UAParser from 'ua-parser-js'

export interface RecordPostcardViewParams {
    postcardId: number
    sessionId: string
    userAgent: string
    openedAt: string
    referrer?: string
}

export interface RecordPostcardViewResult {
    success: boolean
    eventId?: number
}

export async function recordPostcardView(data: RecordPostcardViewParams): Promise<RecordPostcardViewResult> {
    try {
        const payload = await getPayload({ config })
        const headersList = await headers()

        const country = headersList.get('x-vercel-ip-country') ?? undefined
        const countryCode = country ?? undefined
        const region = headersList.get('x-vercel-ip-country-region') ?? undefined
        const city = headersList.get('x-vercel-ip-city') ?? undefined

        const uaResult = (UAParser as unknown as (ua: string) => { browser: { name?: string; version?: string }; os: { name?: string; version?: string } })(data.userAgent)
        const browser = uaResult.browser?.name
            ? [uaResult.browser.name, uaResult.browser.version].filter(Boolean).join(' ')
            : undefined
        const os = uaResult.os?.name
            ? [uaResult.os.name, uaResult.os.version].filter(Boolean).join(' ')
            : undefined

        const event = await payload.create({
            collection: 'postcard-view-events',
            data: {
                postcard: data.postcardId,
                openedAt: data.openedAt,
                sessionId: data.sessionId,
                userAgent: data.userAgent,
                browser: browser ?? undefined,
                os: os ?? undefined,
                referrer: data.referrer ?? undefined,
                country: country ?? undefined,
                countryCode: country ?? undefined,
                region: region ?? undefined,
                city: city ?? undefined,
            },
        })

        const postcard = await payload.findByID({
            collection: 'postcards',
            id: data.postcardId,
        })
        await payload.update({
            collection: 'postcards',
            id: data.postcardId,
            data: {
                views: (postcard.views || 0) + 1,
            },
            overrideAccess: true,
        })

        return { success: true, eventId: event.id }
    } catch (error) {
        console.error('Error recording postcard view:', error)
        return { success: false }
    }
}

export interface RecordPostcardViewCloseParams {
    eventId: number
    closedAt: string
    durationSeconds: number
}

export async function recordPostcardViewClose(data: RecordPostcardViewCloseParams): Promise<{ success: boolean }> {
    try {
        const payload = await getPayload({ config })
        await payload.update({
            collection: 'postcard-view-events',
            id: data.eventId,
            data: {
                closedAt: data.closedAt,
                durationSeconds: data.durationSeconds,
            },
            overrideAccess: true,
        })
        return { success: true }
    } catch (error) {
        console.error('Error recording postcard view close:', error)
        return { success: false }
    }
}
