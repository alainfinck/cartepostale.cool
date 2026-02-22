'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'
import { sendEmail, generatePromoCodeEmail } from '@/lib/email-service'
import { getCurrentUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
// crypto is available globally in Node.js 18+ and Next.js server actions

const ALWAYS_FREE_PROMO_CODE = 'COOLOS'

function normalizePromoCode(code: string): string {
  return code.trim().toUpperCase()
}

export async function submitLead(email: string) {
  try {
    const payload = await getPayload({ config })

    // Check if email already exists
    const existing = await payload.find({
      collection: 'leads',
      where: {
        email: { equals: email },
      },
    })

    if (existing.docs.length > 0) {
      return {
        success: true,
        code: existing.docs[0].code,
        message: 'Vous avez déjà réclamé votre carte gratuite !',
      }
    }

    // Generate a unique short code
    const code = crypto.randomUUID().split('-')[0].toUpperCase()

    const lead = await payload.create({
      collection: 'leads',
      data: {
        email,
        code,
        source: 'exit-intent',
      },
    })

    return {
      success: true,
      code: lead.code,
      message: 'Code généré avec succès !',
    }
  } catch (error: any) {
    console.error('Error submitting lead:', error)
    return { success: false, error: error.message }
  }
}

export async function validatePromoCode(code: string) {
  try {
    const normalizedCode = normalizePromoCode(code)
    if (normalizedCode === ALWAYS_FREE_PROMO_CODE) {
      return { success: true, leadId: null }
    }

    const payload = await getPayload({ config })

    const result = await payload.find({
      collection: 'leads',
      where: {
        code: { equals: normalizedCode },
        isUsed: { equals: false },
      },
    })

    if (result.docs.length === 0) {
      return { success: false, error: 'Code invalide ou déjà utilisé' }
    }

    return { success: true, leadId: result.docs[0].id }
  } catch (error: any) {
    console.error('Error validating code:', error)
    return { success: false, error: 'Erreur lors de la validation' }
  }
}

export async function consumePromoCode(code: string, postcardId: number) {
  try {
    const normalizedCode = normalizePromoCode(code)
    if (normalizedCode === ALWAYS_FREE_PROMO_CODE) {
      // Permanent marketing code: does not consume any lead.
      return { success: true }
    }

    const payload = await getPayload({ config })

    const result = await payload.find({
      collection: 'leads',
      where: {
        code: { equals: normalizedCode },
        isUsed: { equals: false },
      },
    })

    if (result.docs.length === 0) {
      return { success: false, error: 'Code invalide ou déjà utilisé' }
    }

    const leadId = result.docs[0].id

    // Mark lead as used
    await payload.update({
      collection: 'leads',
      id: leadId,
      data: {
        isUsed: true,
        usedAt: new Date().toISOString(),
        usedByPostcard: postcardId,
      },
    })

    // Update postcard to be premium
    await payload.update({
      collection: 'postcards',
      id: postcardId,
      data: {
        isPremium: true,
      },
    })

    return { success: true }
  } catch (error: any) {
    console.error('Error using code:', error)
    return { success: false, error: "Erreur lors de l'activation" }
  }
}

/** Redeem a promo code to add 1 credit to the current user (no postcard). */
export async function redeemPromoCodeForCredits(code: string) {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Vous devez être connecté pour utiliser un code promo.' }
  }

  try {
    const normalizedCode = normalizePromoCode(code)
    const payload = await getPayload({ config })

    if (normalizedCode === ALWAYS_FREE_PROMO_CODE) {
      await payload.update({
        collection: 'users',
        id: user.id,
        data: {
          credits: (user.credits ?? 0) + 1,
        },
      })
      revalidatePath('/espace-client')
      revalidatePath('/espace-client/cartes')
      return { success: true, creditsAdded: 1 }
    }

    const result = await payload.find({
      collection: 'leads',
      where: {
        code: { equals: normalizedCode },
        isUsed: { equals: false },
      },
    })

    if (result.docs.length === 0) {
      return { success: false, error: 'Code invalide ou déjà utilisé' }
    }

    const leadId = result.docs[0].id
    await payload.update({
      collection: 'leads',
      id: leadId,
      data: {
        isUsed: true,
        usedAt: new Date().toISOString(),
        // usedByPostcard left null when redeeming for credits only
      },
    })

    const dbUser = await payload.findByID({
      collection: 'users',
      id: user.id,
    })
    const currentCredits = dbUser.credits ?? 0
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        credits: currentCredits + 1,
      },
    })

    revalidatePath('/espace-client')
    revalidatePath('/espace-client/cartes')
    return { success: true, creditsAdded: 1 }
  } catch (error: any) {
    console.error('Error redeeming promo for credits:', error)
    return { success: false, error: "Erreur lors de l'activation du code." }
  }
}

export async function getAllLeads() {
  try {
    const payload = await getPayload({ config })
    const leads = await payload.find({
      collection: 'leads',
      limit: 100,
      sort: '-createdAt',
    })
    return { success: true, docs: leads.docs, totalDocs: leads.totalDocs }
  } catch (error: any) {
    console.error('Error getting leads:', error)
    return { success: false, error: 'Erreur lors de la récupération des leads' }
  }
}

/** Generate a unique short code (not already in use). */
async function generateUniqueCode(
  payload: Awaited<ReturnType<typeof getPayload>>,
): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const code = crypto.randomUUID().split('-')[0].toUpperCase()
    const existing = await payload.find({
      collection: 'leads',
      where: { code: { equals: code } },
      limit: 1,
    })
    if (existing.docs.length === 0) return code
  }
  return crypto.randomUUID().split('-').slice(0, 2).join('').toUpperCase().slice(0, 8)
}

/** Create a promo code (lead) — admin only. Email required; code optional (auto-generated if not provided). */
export async function createPromoCode(data: { email: string; code?: string }) {
  try {
    const payload = await getPayload({ config })
    const { email, code: customCode } = data
    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail) return { success: false, error: 'Email requis' }

    const existing = await payload.find({
      collection: 'leads',
      where: { email: { equals: trimmedEmail } },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      return {
        success: true,
        code: existing.docs[0].code,
        message: 'Un code existe déjà pour cet email.',
      }
    }

    let code = (customCode || '').trim().toUpperCase()
    if (!code) code = await generateUniqueCode(payload)
    else {
      const codeExists = await payload.find({
        collection: 'leads',
        where: { code: { equals: code } },
        limit: 1,
      })
      if (codeExists.docs.length > 0) return { success: false, error: 'Ce code est déjà utilisé.' }
    }

    await payload.create({
      collection: 'leads',
      data: {
        email: trimmedEmail,
        code,
        source: 'admin',
      },
    })
    return { success: true, code }
  } catch (error: any) {
    console.error('Error creating promo code:', error)
    return { success: false, error: error?.message || 'Erreur lors de la création du code' }
  }
}

/** Send a promo code to an email. Creates the lead if needed, then sends the email. */
export async function sendPromoCodeToEmail(email: string) {
  try {
    const payload = await getPayload({ config })
    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail) return { success: false, error: 'Email requis' }

    const lead = await payload.find({
      collection: 'leads',
      where: { email: { equals: trimmedEmail } },
      limit: 1,
    })

    let code: string
    if (lead.docs.length > 0) {
      code = lead.docs[0].code
    } else {
      code = await generateUniqueCode(payload)
      await payload.create({
        collection: 'leads',
        data: {
          email: trimmedEmail,
          code,
          source: 'admin',
        },
      })
    }

    const html = generatePromoCodeEmail(code)
    const sent = await sendEmail({
      to: trimmedEmail,
      subject: 'Votre code promo CartePostale.cool',
      html,
    })
    if (!sent) return { success: false, error: "Échec de l'envoi de l'email" }
    return { success: true, code }
  } catch (error: any) {
    console.error('Error sending promo code email:', error)
    return { success: false, error: error?.message || "Erreur lors de l'envoi" }
  }
}
