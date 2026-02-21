'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'
import { revalidatePath } from 'next/cache'

export async function fixPrivatePostcards() {
  const payload = await getPayload({ config })

  const result = await payload.update({
    collection: 'postcards',
    where: {
      isPublic: {
        equals: false,
      },
    },
    data: {
      isPublic: true,
      status: 'published',
    },
  })

  revalidatePath('/debug-postcards')
  revalidatePath('/carte/syno')

  return { updated: result.docs.length }
}
