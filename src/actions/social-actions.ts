'use server'

import { getPayload } from 'payload'
import config from '@payload-config'

export async function getReactions(postcardId: number): Promise<{ counts: Record<string, number>; total: number }> {
    try {
        const payload = await getPayload({ config })
        const result = await payload.find({
            collection: 'reactions',
            where: {
                postcard: { equals: postcardId },
            },
            limit: 1000,
        })

        const counts: Record<string, number> = {}
        let total = 0
        for (const doc of result.docs) {
            const emoji = doc.emoji
            counts[emoji] = (counts[emoji] || 0) + 1
            total++
        }

        return { counts, total }
    } catch (error) {
        console.error('Error fetching reactions:', error)
        return { counts: {}, total: 0 }
    }
}

export async function getUserReactions(postcardId: number, sessionId: string): Promise<Record<string, boolean>> {
    try {
        const payload = await getPayload({ config })
        const result = await payload.find({
            collection: 'reactions',
            where: {
                postcard: { equals: postcardId },
                sessionId: { equals: sessionId },
            },
            limit: 100,
        })

        const userReactions: Record<string, boolean> = {}
        for (const doc of result.docs) {
            userReactions[doc.emoji] = true
        }

        return userReactions
    } catch (error) {
        console.error('Error fetching user reactions:', error)
        return {}
    }
}

export async function toggleReaction(
    postcardId: number,
    emoji: string,
    sessionId: string
): Promise<{ added: boolean; newCount: number }> {
    try {
        const payload = await getPayload({ config })

        // Check if user already reacted with this emoji
        const existing = await payload.find({
            collection: 'reactions',
            where: {
                postcard: { equals: postcardId },
                emoji: { equals: emoji },
                sessionId: { equals: sessionId },
            },
            limit: 1,
        })

        if (existing.totalDocs > 0) {
            // Remove reaction
            await payload.delete({
                collection: 'reactions',
                id: existing.docs[0].id,
                overrideAccess: true,
            })

            // Get updated count
            const countResult = await payload.find({
                collection: 'reactions',
                where: {
                    postcard: { equals: postcardId },
                    emoji: { equals: emoji },
                },
                limit: 0,
            })

            return { added: false, newCount: countResult.totalDocs }
        } else {
            // Add reaction
            await payload.create({
                collection: 'reactions',
                data: {
                    postcard: postcardId,
                    emoji,
                    sessionId,
                },
            })

            // Get updated count
            const countResult = await payload.find({
                collection: 'reactions',
                where: {
                    postcard: { equals: postcardId },
                    emoji: { equals: emoji },
                },
                limit: 0,
            })

            return { added: true, newCount: countResult.totalDocs }
        }
    } catch (error) {
        console.error('Error toggling reaction:', error)
        return { added: false, newCount: 0 }
    }
}

export async function getComments(postcardId: number) {
    try {
        const payload = await getPayload({ config })
        const result = await payload.find({
            collection: 'comments',
            where: {
                postcard: { equals: postcardId },
            },
            sort: '-createdAt',
            limit: 100,
        })

        return result.docs.map((doc) => ({
            id: doc.id,
            authorName: doc.authorName,
            content: doc.content,
            createdAt: doc.createdAt,
        }))
    } catch (error) {
        console.error('Error fetching comments:', error)
        return []
    }
}

export async function addComment(
    postcardId: number,
    authorName: string,
    content: string,
    sessionId: string
): Promise<{ success: boolean; comment?: { id: number; authorName: string; content: string; createdAt: string } }> {
    try {
        const payload = await getPayload({ config })

        const doc = await payload.create({
            collection: 'comments',
            data: {
                postcard: postcardId,
                authorName: authorName.trim().slice(0, 50),
                content: content.trim().slice(0, 500),
                sessionId,
            },
        })

        return {
            success: true,
            comment: {
                id: doc.id,
                authorName: doc.authorName,
                content: doc.content,
                createdAt: doc.createdAt,
            },
        }
    } catch (error) {
        console.error('Error adding comment:', error)
        return { success: false }
    }
}

export async function incrementViews(postcardId: number): Promise<void> {
    try {
        const payload = await getPayload({ config })
        const postcard = await payload.findByID({
            collection: 'postcards',
            id: postcardId,
        })

        await payload.update({
            collection: 'postcards',
            id: postcardId,
            data: {
                views: (postcard.views || 0) + 1,
            },
            overrideAccess: true,
        })
    } catch (error) {
        console.error('Error incrementing views:', error)
    }
}

export async function incrementShares(postcardId: number): Promise<void> {
    try {
        const payload = await getPayload({ config })
        const postcard = await payload.findByID({
            collection: 'postcards',
            id: postcardId,
        })

        await payload.update({
            collection: 'postcards',
            id: postcardId,
            data: {
                shares: (postcard.shares || 0) + 1,
            },
            overrideAccess: true,
        })
    } catch (error) {
        console.error('Error incrementing shares:', error)
    }
}
