'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { getCurrentUser } from '@/lib/auth'

export async function submitFeedback(data: {
  rating: number
  message: string
  pageUrl?: string
  email?: string
}) {
  try {
    const user = await getCurrentUser()
    const payload = await getPayload({ config })

    const feedback = await payload.create({
      collection: 'feedback',
      data: {
        rating: data.rating,
        message: data.message,
        email: data.email,
        pageUrl: data.pageUrl,
        user: user ? user.id : undefined,
        status: 'new',
      },
    })

    return { success: true, id: feedback.id }
  } catch (error: any) {
    console.error('Error submitting feedback:', error)
    return { success: false, error: error.message || 'Une erreur est survenue' }
  }
}

export async function getFeedbacks() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') {
    throw new Error('Non autorisé')
  }

  try {
    const payload = await getPayload({ config })
    const feedbacks = await payload.find({
      collection: 'feedback',
      sort: '-createdAt',
      depth: 1,
    })

    return feedbacks.docs
  } catch (error) {
    console.error('Error fetching feedbacks:', error)
    return []
  }
}
