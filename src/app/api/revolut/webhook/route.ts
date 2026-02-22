import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Webhook Revolut
 * Doc: https://developer.revolut.com/docs/merchant/webhooks
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, order_id, metadata } = body

    console.log(`[Revolut Webhook] Event received: ${event}`, { order_id, metadata })

    if (event === 'ORDER_COMPLETED') {
      const userId = metadata?.userId || metadata?.order_reference
      const paymentType = metadata?.paymentType // 'pack_5' | 'pack_10' | 'pack_20' | 'pack_50' | 'pack_100' | 'pack_200' | 'single_card'

      if (!userId) {
        console.warn('[Revolut Webhook] Missing userId in metadata')
        return NextResponse.json({ received: true })
      }

      const payload = await getPayload({ config })

      // Attribution des crédits si c'est un pack
      if (paymentType && typeof paymentType === 'string' && paymentType.startsWith('pack_')) {
        const creditMap: Record<string, number> = {
          pack_5: 5,
          pack_10: 10,
          pack_20: 20,
          pack_50: 50,
          pack_100: 100,
          pack_200: 200,
        }

        const creditsToAdd = creditMap[paymentType] || 0

        if (creditsToAdd > 0) {
          const user = await payload.findByID({
            collection: 'users',
            id: userId,
          })

          if (user) {
            await payload.update({
              collection: 'users',
              id: userId,
              data: {
                credits: (user.credits || 0) + creditsToAdd,
              },
            })
            console.log(`[Revolut Webhook] Added ${creditsToAdd} credits to user ${userId}`)
          } else {
            console.error(`[Revolut Webhook] User ${userId} not found`)
          }
        }
      }

      // Optionnel: Marquer la carte comme payée si c'est un paiement à l'unité
      if (paymentType === 'single_card' || metadata?.order_reference) {
        // Logique pour marquer la carte comme premium/payée si nécessaire
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[Revolut Webhook] Error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
