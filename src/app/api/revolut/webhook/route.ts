import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Webhook Revolut pour les packs de crédits.
 * Ajoute les crédits au compte de l'utilisateur après un paiement réussi.
 */
export async function POST(request: NextRequest) {
  const secretKey = process.env.REVOLUT_SECRET_KEY
  // Note: En prod, il faudrait vérifier la signature Revolut ici si disponible via SDK/Headers

  let event: any
  try {
    event = await request.json()
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Vérifier que l'event est bien un paiement réussi (ORDER_COMPLETED)
  // Revolut Webhook docs may vary, typically it's event.event === 'order_completed'
  if (event.event !== 'order_completed' && event.event !== 'payment_completed') {
    return NextResponse.json({ received: true, status: 'ignored' })
  }

  const orderId = event.order_id || event.id
  if (!orderId) {
    return NextResponse.json({ error: 'Missing order ID' }, { status: 400 })
  }

  try {
    const payload = await getPayload({ config })

    // On récupère les détails de la commande via l'API Revolut pour vérifier le montant et les métadonnées
    const revolutRes = await fetch(`https://merchant.revolut.com/api/1.0/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Revolut-Api-Version': '2025-12-04',
      },
    })

    if (!revolutRes.ok) {
      console.error(`Failed to fetch order ${orderId} from Revolut`)
      return NextResponse.json({ error: 'Failed to verify order' }, { status: 502 })
    }

    const orderData = await revolutRes.json()

    // Vérifier l'état de la commande
    if (orderData.state !== 'completed') {
      return NextResponse.json({ received: true, status: 'order_not_completed' })
    }

    // Récupérer le type de pack et l'ID utilisateur dans les métadonnées
    // On s'attend à ce que create-order injecte ces infos
    const userId = orderData.metadata?.user_id
    const packType = orderData.metadata?.pack_type // '3', '5', '10'

    if (!userId || !packType) {
      console.warn(`Order ${orderId} missing metadata: userId=${userId}, packType=${packType}`)
      return NextResponse.json({ received: true, status: 'missing_metadata' })
    }

    // Nombre de crédits à ajouter
    const creditsToAdd = parseInt(packType, 10)
    if (isNaN(creditsToAdd)) {
      return NextResponse.json({ error: 'Invalid pack type' }, { status: 400 })
    }

    // Mettre à jour l'utilisateur
    const user = await payload.findByID({
      collection: 'users',
      id: userId,
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const currentCredits = (user.credits as number) || 0

    await payload.update({
      collection: 'users',
      id: userId,
      data: {
        credits: currentCredits + creditsToAdd,
      },
    })

    console.log(`Successfully added ${creditsToAdd} credits to user ${userId} (Order ${orderId})`)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Webhook processing error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
