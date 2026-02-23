import crypto from 'node:crypto'

/**
 * In-memory store for editor preview links.
 * Preview URL is valid for 5 minutes (or while user stays on editor and re-creates).
 * The definitive /carte/[publicId] link is activated once payment is completed.
 */

const PREVIEW_TTL_MS = 5 * 60 * 1000 // 5 minutes

const store = new Map<
  string,
  {
    data: Record<string, unknown>
    expiresAt: number
  }
>()

export function setEditorPreview(token: string, postcardData: Record<string, unknown>): void {
  store.set(token, {
    data: postcardData,
    expiresAt: Date.now() + PREVIEW_TTL_MS,
  })
}

export function getEditorPreview(token: string): Record<string, unknown> | null {
  const entry = store.get(token)
  if (!entry || Date.now() > entry.expiresAt) {
    if (entry) store.delete(token)
    return null
  }
  return entry.data
}

export function generatePreviewToken(): string {
  return crypto.randomBytes(12).toString('hex')
}
