'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import type { Gallery, GalleryCategory, GalleryTag } from '@/payload-types'
import { getCurrentUser } from '@/lib/auth'

async function requireAgence(): Promise<{ userId: number; agencyId: number }> {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'agence' && user.role !== 'admin')) {
    throw new Error('Non autorisé')
  }
  if (!user.agency && user.role !== 'admin') {
    throw new Error('Non autorisé: aucune agence associée')
  }
  if (!user.agency) {
    throw new Error('Non autorisé: agence requise pour la galerie')
  }
  return { userId: user.id, agencyId: user.agency }
}

export async function getAgencyGallery() {
  const auth = await requireAgence()
  const { agencyId } = auth
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'gallery',
      where: {
        or: [{ agency: { equals: agencyId } }, { agency: { exists: false } }],
      },
      depth: 2,
      limit: 500,
    })
    return result.docs as Gallery[]
  } catch (e) {
    console.error(e)
    return []
  }
}

export async function getGalleryCategories() {
  const auth = await requireAgence()
  const { agencyId } = auth
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'gallery-categories',
      where: {
        or: [{ agency: { equals: agencyId } }, { agency: { exists: false } }],
      },
      depth: 0,
      limit: 100,
    })
    return result.docs as GalleryCategory[]
  } catch (e) {
    return []
  }
}

export async function getGalleryTags() {
  const auth = await requireAgence()
  const { agencyId } = auth
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'gallery-tags',
      where: {
        or: [{ agency: { equals: agencyId } }, { agency: { exists: false } }],
      },
      depth: 0,
      limit: 100,
    })
    return result.docs as GalleryTag[]
  } catch (e) {
    return []
  }
}

export async function deleteAgencyGalleryItem(id: number) {
  const auth = await requireAgence()
  const { agencyId } = auth

  try {
    const payload = await getPayload({ config })
    // Check ownership
    const doc = await payload.findByID({ collection: 'gallery', id, depth: 0 })
    const docAgencyId =
      typeof doc.agency === 'object' && doc.agency ? (doc.agency as any).id : doc.agency
    if (docAgencyId !== agencyId) {
      throw new Error('Vous ne pouvez supprimer que vos propres images.')
    }

    await payload.delete({ collection: 'gallery', id })
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Erreur' }
  }
}

export async function createAgencyGalleryItem(data: {
  title: string
  imageBase64: string // "data:image/jpeg;base64,..."
  caption?: string
  categoryId?: number
  tagIds?: number[]
}) {
  const auth = await requireAgence()
  const { agencyId } = auth

  try {
    const payload = await getPayload({ config })

    let mediaId: number | null = null
    if (data.imageBase64 && data.imageBase64.startsWith('data:image')) {
      const [meta, base64Data] = data.imageBase64.split(',')
      const mime = meta.match(/:(.*?);/)?.[1] || 'image/png'
      const extension = mime.split('/')[1] || 'png'
      const buffer = Buffer.from(base64Data, 'base64')

      const media = await payload.create({
        collection: 'media',
        data: {
          alt: `Image galerie - ${data.title}`,
        },
        file: {
          data: buffer,
          mimetype: mime,
          name: `gallery-${Date.now()}.${extension}`,
          size: buffer.length,
        },
      })
      mediaId = (media as any).id
    }

    if (!mediaId) return { success: false, error: 'Image invalide' }

    const doc = await payload.create({
      collection: 'gallery',
      data: {
        title: data.title,
        image: mediaId,
        caption: data.caption || undefined,
        agency: agencyId,
        category: data.categoryId || undefined,
        tags: data.tagIds || [],
        views: 0,
        usages: 0,
      },
    })

    return { success: true, doc }
  } catch (err: any) {
    console.error(err)
    return { success: false, error: err.message || 'Erreur lors de la création' }
  }
}
