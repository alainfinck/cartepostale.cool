'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { getCurrentUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function addWelcomeCredit() {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Non connecté.' }
  }
  const payload = await getPayload({ config })
  const dbUser = await payload.findByID({ collection: 'users', id: user.id })
  await payload.update({
    collection: 'users',
    id: user.id,
    data: { credits: (dbUser.credits || 0) + 1 },
  })
  revalidatePath('/espace-client')
  return { success: true }
}

export async function consumeCredit() {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Vous devez être connecté pour utiliser vos crédits.' }
  }

  const payload = await getPayload({ config })

  // Refresh user data from DB to be sure of credit count
  const dbUser = await payload.findByID({
    collection: 'users',
    id: user.id,
  })

  const currentCredits = dbUser.credits || 0
  if (currentCredits <= 0) {
    return { success: false, error: "Vous n'avez plus de crédits disponibles." }
  }

  try {
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        credits: currentCredits - 1,
      },
    })

    revalidatePath('/espace-client')
    return { success: true }
  } catch (err) {
    console.error('Error consuming credit:', err)
    return { success: false, error: "Une erreur est survenue lors de l'utilisation du crédit." }
  }
}
