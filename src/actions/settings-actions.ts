'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { getCurrentUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function getSettings() {
  const payload = await getPayload({ config })
  const settings = await payload.findGlobal({
    slug: 'settings',
  })
  return settings
}

export async function updateSettings(data: { exitIntentEnabled: boolean }) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') {
    throw new Error('Non autorisé')
  }

  const payload = await getPayload({ config })
  await payload.updateGlobal({
    slug: 'settings',
    data,
  })

  revalidatePath('/')
  return { success: true }
}
