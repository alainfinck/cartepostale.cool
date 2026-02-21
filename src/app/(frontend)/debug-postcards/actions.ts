'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'
import { revalidatePath } from 'next/cache'

export async function fixPrivatePostcards(_formData: FormData) {
  const payload = await getPayload({ config })

  await payload.update({
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
}
