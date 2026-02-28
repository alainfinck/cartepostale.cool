'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { sendEmail } from '@/lib/email-service'

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function buildCommentNotificationEmail(params: {
  postcardUrl: string
  senderName?: string | null
  commentAuthor: string
  commentContent: string
  isPrivate: boolean
}) {
  const sender = params.senderName?.trim() || 'votre carte'
  const visibility = params.isPrivate
    ? 'Ce message est privé (visible uniquement par vous).'
    : "Ce message est public (visible dans le livre d'or)."

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouveau message sur votre carte</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 24px; background-color: #f8fafc;">
  <div style="max-width: 640px; margin: 0 auto; background: #fff; border-radius: 14px; border: 1px solid #e5e7eb; overflow: hidden;">
    <div style="padding: 20px 24px; background: linear-gradient(135deg, #fdfbf7 0%, #f0fdfa 100%); border-bottom: 1px solid #e5e7eb;">
      <h1 style="margin: 0; font-size: 22px; font-family: Georgia, serif; color: #0f766e;">Nouveau message recu 💌</h1>
    </div>
    <div style="padding: 24px;">
      <p style="margin: 0 0 16px 0;">Bonjour,</p>
      <p style="margin: 0 0 16px 0;"><strong>${escapeHtml(params.commentAuthor)}</strong> a laisse un message sur ${escapeHtml(sender)}.</p>
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">Message :</p>
      <blockquote style="margin: 0 0 16px 0; padding: 12px 14px; border-left: 4px solid #14b8a6; background: #f8fafc; color: #111827; white-space: pre-wrap;">${escapeHtml(params.commentContent)}</blockquote>
      <p style="margin: 0 0 20px 0; font-size: 14px; color: #6b7280;">${visibility}</p>
      <p style="margin: 0;">
        <a href="${params.postcardUrl}" style="display: inline-block; background-color: #0d9488; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 9999px; font-weight: 600;">Voir la carte</a>
      </p>
    </div>
  </div>
</body>
</html>
    `.trim()
}

export async function getReactions(
  postcardId: number,
  mediaItemId?: string,
): Promise<{ counts: Record<string, number>; total: number }> {
  try {
    const payload = await getPayload({ config })
    const where: any = {
      postcard: { equals: postcardId },
    }

    if (mediaItemId) {
      where.mediaItemId = { equals: mediaItemId }
    } else {
      // If no mediaItemId, only get reactions that DON'T have a mediaItemId (postcard-level)
      where.mediaItemId = { exists: false }
    }

    const result = await payload.find({
      collection: 'reactions',
      where,
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

export async function getUserReactions(
  postcardId: number,
  sessionId: string,
  mediaItemId?: string,
): Promise<Record<string, boolean>> {
  try {
    const payload = await getPayload({ config })
    const where: any = {
      postcard: { equals: postcardId },
      sessionId: { equals: sessionId },
    }

    if (mediaItemId) {
      where.mediaItemId = { equals: mediaItemId }
    } else {
      where.mediaItemId = { exists: false }
    }

    const result = await payload.find({
      collection: 'reactions',
      where,
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
  sessionId: string,
  mediaItemId?: string,
): Promise<{ added: boolean; newCount: number }> {
  try {
    const payload = await getPayload({ config })

    const where: any = {
      postcard: { equals: postcardId },
      emoji: { equals: emoji },
      sessionId: { equals: sessionId },
    }

    if (mediaItemId) {
      where.mediaItemId = { equals: mediaItemId }
    } else {
      where.mediaItemId = { exists: false }
    }

    // Check if user already reacted
    const existing = await payload.find({
      collection: 'reactions',
      where,
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
      const countWhere: any = {
        postcard: { equals: postcardId },
        emoji: { equals: emoji },
      }
      if (mediaItemId) {
        countWhere.mediaItemId = { equals: mediaItemId }
      } else {
        countWhere.mediaItemId = { exists: false }
      }

      const countResult = await payload.find({
        collection: 'reactions',
        where: countWhere,
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
          mediaItemId,
          sessionId,
        },
      })

      // Get updated count
      const countWhere: any = {
        postcard: { equals: postcardId },
        emoji: { equals: emoji },
      }
      if (mediaItemId) {
        countWhere.mediaItemId = { equals: mediaItemId }
      } else {
        countWhere.mediaItemId = { exists: false }
      }

      const countResult = await payload.find({
        collection: 'reactions',
        where: countWhere,
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
        isPrivate: { not_equals: true },
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
  sessionId: string,
  isPrivate: boolean = false,
): Promise<{
  success: boolean
  comment?: {
    id: number
    authorName: string
    content: string
    createdAt: string
    isPrivate: boolean
  }
}> {
  try {
    const payload = await getPayload({ config })
    const sanitizedAuthorName = authorName.trim().slice(0, 50)
    const sanitizedContent = content.trim().slice(0, 500)

    const doc = await payload.create({
      collection: 'comments',
      data: {
        postcard: postcardId,
        authorName: sanitizedAuthorName,
        content: sanitizedContent,
        sessionId,
        isPrivate,
      },
    })

    // Non-blocking email notification to postcard owner.
    try {
      const postcard = await payload.findByID({
        collection: 'postcards',
        id: postcardId,
        depth: 1,
      })
      const authorRelation = postcard.author
      const authorEmail =
        typeof authorRelation === 'object' && authorRelation?.email
          ? authorRelation.email
          : postcard.senderEmail || null

      if (authorEmail) {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.cartepostale.cool'
        const postcardUrl = `${siteUrl.replace(/\/$/, '')}/view/${postcard.publicId}`
        const subject = isPrivate
          ? 'Nouveau message prive sur votre carte'
          : 'Nouveau message sur votre carte'

        const html = buildCommentNotificationEmail({
          postcardUrl,
          senderName: postcard.senderName,
          commentAuthor: sanitizedAuthorName,
          commentContent: sanitizedContent,
          isPrivate,
        })

        const sent = await sendEmail({
          to: authorEmail,
          subject,
          html,
        })

        if (!sent) {
          console.error('Comment notification email failed to send')
        }
      }
    } catch (notifyError) {
      console.error('Error sending comment notification email:', notifyError)
    }

    return {
      success: true,
      comment: {
        id: doc.id,
        authorName: doc.authorName,
        content: doc.content,
        createdAt: doc.createdAt,
        isPrivate: doc.isPrivate || false,
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
