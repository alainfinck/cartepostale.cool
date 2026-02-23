import crypto from 'node:crypto'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Store for editor preview links ("Voir comme le destinataire").
 * Persisted in DB (editor-previews collection) so all server instances see the same data.
 * Preview URL is valid for 5 minutes.
 */

const PREVIEW_TTL_MS = 5 * 60 * 1000 // 5 minutes

export function generatePreviewToken(): string {
  return crypto.randomBytes(12).toString('hex')
}

export async function setEditorPreview(
  token: string,
  postcardData: Record<string, unknown>,
): Promise<void> {
  const payload = await getPayload({ config })
  const expiresAt = new Date(Date.now() + PREVIEW_TTL_MS).toISOString()

  const existing = await payload.find({
    collection: 'editor-previews',
    where: { token: { equals: token } },
    limit: 1,
  })

  if (existing.docs.length > 0) {
    await payload.update({
      collection: 'editor-previews',
      id: existing.docs[0].id,
      data: { data: postcardData as any, expiresAt },
    })
  } else {
    await payload.create({
      collection: 'editor-previews',
      data: {
        token,
        data: postcardData as any,
        expiresAt,
      },
    })
  }
}

export async function getEditorPreview(
  token: string,
): Promise<Record<string, unknown> | null> {
  const payload = await getPayload({ config })
  const now = new Date().toISOString()

  const result = await payload.find({
    collection: 'editor-previews',
    where: {
      and: [
        { token: { equals: token } },
        { expiresAt: { greater_than: now } },
      ],
    },
    limit: 1,
  })

  const doc = result.docs[0]
  if (!doc || !doc.data) return null

  return doc.data as Record<string, unknown>
}
