'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import type { Gallery, GalleryCategory, GalleryTag } from '@/payload-types'
import { getCurrentUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

async function requireAgence(): Promise<{ userId: string; agencyId: number | null; role: string }> {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'agence' && user.role !== 'admin')) {
    throw new Error('Non autorisé')
  }
  if (user.role === 'agence' && !user.agency) {
    throw new Error('Non autorisé: aucune agence associée')
  }
  return { userId: user.id, agencyId: user.agency ?? null, role: user.role }
}

export async function getAgencyGallery(categoryId?: number | 'root' | null) {
  const { agencyId, role } = await requireAgence()
  try {
    const payload = await getPayload({ config })

    const agencyWhere =
      role === 'admin' && !agencyId
        ? {}
        : {
            or: [{ agency: { equals: agencyId } }, { agency: { exists: false } }],
          }

    let categoryWhere: any = {}
    if (categoryId === 'root') {
      categoryWhere = {
        or: [{ category: { exists: false } }, { category: { equals: null } }],
      }
    } else if (categoryId != null) {
      categoryWhere = { category: { equals: categoryId } }
    }

    const where: any =
      Object.keys(agencyWhere).length > 0
        ? { and: [agencyWhere, ...(Object.keys(categoryWhere).length > 0 ? [categoryWhere] : [])] }
        : categoryWhere

    const result = await payload.find({
      collection: 'gallery',
      where: Object.keys(where).length > 0 ? where : undefined,
      depth: 2,
      limit: 500,
      sort: 'order',
    })
    return result.docs as Gallery[]
  } catch (e) {
    console.error(e)
    return []
  }
}

export async function getGalleryCategories() {
  const { agencyId, role } = await requireAgence()
  try {
    const payload = await getPayload({ config })
    const where: any =
      role === 'admin' && !agencyId
        ? {}
        : {
            or: [{ agency: { equals: agencyId } }, { agency: { exists: false } }],
          }
    const result = await payload.find({
      collection: 'gallery-categories',
      where,
      depth: 1, // populate parent
      limit: 200,
    })
    return result.docs as GalleryCategory[]
  } catch (e) {
    return []
  }
}

export async function getGalleryTags() {
  const { agencyId, role } = await requireAgence()
  try {
    const payload = await getPayload({ config })
    const where: any =
      role === 'admin' && !agencyId
        ? {}
        : {
            or: [{ agency: { equals: agencyId } }, { agency: { exists: false } }],
          }
    const result = await payload.find({
      collection: 'gallery-tags',
      where,
      depth: 0,
      limit: 100,
    })
    return result.docs as GalleryTag[]
  } catch (e) {
    return []
  }
}

export async function deleteAgencyGalleryItem(id: number) {
  const { agencyId, role } = await requireAgence()

  try {
    const payload = await getPayload({ config })
    const doc = await payload.findByID({ collection: 'gallery', id, depth: 0 })
    const docAgencyId =
      typeof doc.agency === 'object' && doc.agency ? (doc.agency as any).id : doc.agency
    if (role !== 'admin' && docAgencyId !== agencyId) {
      throw new Error('Vous ne pouvez supprimer que vos propres images.')
    }

    await payload.delete({ collection: 'gallery', id })
    revalidatePath('/espace-agence/galerie')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Erreur' }
  }
}

// ─── Catégories ──────────────────────────────────────────────────────────────

export async function createGalleryCategory(data: {
  name: string
  description?: string
  parentId?: number | null
}) {
  const { agencyId } = await requireAgence()
  try {
    const payload = await getPayload({ config })
    const doc = await payload.create({
      collection: 'gallery-categories',
      data: {
        name: data.name,
        description: data.description || undefined,
        parent: data.parentId || undefined,
        agency: agencyId || undefined,
      } as any,
    })
    revalidatePath('/espace-agence/galerie')
    return { success: true, doc }
  } catch (err: any) {
    console.error(err)
    return { success: false, error: err.message || 'Erreur lors de la création' }
  }
}

export async function moveGalleryItem(id: number, categoryId: number | null) {
  const { agencyId, role } = await requireAgence()
  try {
    const payload = await getPayload({ config })
    const doc = await payload.findByID({ collection: 'gallery', id, depth: 0 })
    const docAgencyId =
      typeof doc.agency === 'object' && doc.agency ? (doc.agency as any).id : doc.agency
    if (role !== 'admin' && docAgencyId !== agencyId) {
      throw new Error('Non autorisé')
    }
    await payload.update({
      collection: 'gallery',
      id,
      data: { category: categoryId } as any,
    })
    revalidatePath('/espace-agence/galerie')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Erreur' }
  }
}

export async function deleteGalleryCategory(id: number) {
  const { agencyId, role } = await requireAgence()
  try {
    const payload = await getPayload({ config })
    const doc = await payload.findByID({ collection: 'gallery-categories', id, depth: 0 })
    const docAgencyId =
      typeof (doc as any).agency === 'object' && (doc as any).agency
        ? (doc as any).agency.id
        : (doc as any).agency
    if (role !== 'admin' && docAgencyId !== agencyId) {
      throw new Error('Non autorisé')
    }
    await payload.delete({ collection: 'gallery-categories', id })
    revalidatePath('/espace-agence/galerie')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Erreur' }
  }
}

// ─── Upload multiple images ───────────────────────────────────────────────────

export async function uploadGalleryImages(formData: FormData) {
  const { agencyId } = await requireAgence()

  try {
    const payload = await getPayload({ config })
    const categoryId = formData.get('categoryId') ? Number(formData.get('categoryId')) : undefined

    const files = formData.getAll('files') as File[]
    if (!files || files.length === 0) {
      return { success: false, error: 'Aucun fichier fourni' }
    }

    const results: Gallery[] = []

    for (const file of files) {
      if (!file.type.startsWith('image/')) continue

      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const extension = file.type.split('/')[1] || 'jpg'
      const name = file.name || `gallery-${Date.now()}.${extension}`

      // Upload to media
      const media = await payload.create({
        collection: 'media',
        data: {
          alt: name.replace(/\.[^.]+$/, ''),
        },
        file: {
          data: buffer,
          mimetype: file.type,
          name: `gallery-${Date.now()}-${name}`,
          size: buffer.length,
        },
      })

      // Create gallery item
      const doc = await payload.create({
        collection: 'gallery',
        data: {
          title: name.replace(/\.[^.]+$/, ''),
          image: (media as any).id,
          category: categoryId || undefined,
          agency: agencyId || undefined,
          views: 0,
          usages: 0,
        } as any,
      })

      results.push(doc as Gallery)
    }

    revalidatePath('/espace-agence/galerie')
    return { success: true, uploadedCount: results.length, docs: results }
  } catch (err: any) {
    console.error(err)
    return { success: false, error: err.message || "Erreur lors de l'upload" }
  }
}

export async function createAgencyGalleryItem(data: {
  title: string
  imageBase64: string
  caption?: string
  categoryId?: number
  tagIds?: number[]
}) {
  const { agencyId } = await requireAgence()

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
      } as any,
    })

    revalidatePath('/espace-agence/galerie')
    return { success: true, doc }
  } catch (err: any) {
    console.error(err)
    return { success: false, error: err.message || 'Erreur lors de la création' }
  }
}
