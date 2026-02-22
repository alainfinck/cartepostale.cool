/**
 * Crée une commande Revolut et retourne l’URL de checkout (Hosted Checkout Page).
 * La clé secrète Revolut ne doit jamais être exposée au client : elle est lue côté serveur.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRevolutOrder } from '@/lib/revolut'

export async function POST(request: NextRequest) {
  const secretKey = process.env.REVOLUT_SECRET_KEY?.trim()
  if (!secretKey) {
    return NextResponse.json(
      { error: 'Paiement Revolut non configuré (REVOLUT_SECRET_KEY manquant).' },
      { status: 503 },
    )
  }

  let body: {
    amountEur?: number
    description?: string
    customerEmail?: string
    redirectPath?: string
    merchantOrderReference?: string
    userId?: string
    packType?: string
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corps de requête JSON invalide.' }, { status: 400 })
  }

  const amountEur = typeof body.amountEur === 'number' ? body.amountEur : 0
  if (amountEur <= 0) {
    return NextResponse.json({ error: 'Montant invalide.' }, { status: 400 })
  }

  // EUR : unités mineures = centimes (1,99 € = 199)
  const amountMinor = Math.round(amountEur * 100)
  const description =
    typeof body.description === 'string' ? body.description : 'Carte postale CartePostale.cool'
  const customerEmail = typeof body.customerEmail === 'string' ? body.customerEmail : undefined
  const merchantOrderReference =
    typeof body.merchantOrderReference === 'string' ? body.merchantOrderReference : undefined

  let redirectUrl: string | undefined
  if (body.redirectPath && typeof body.redirectPath === 'string') {
    const base = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
    redirectUrl =
      base.replace(/\/$/, '') +
      (body.redirectPath.startsWith('/') ? body.redirectPath : `/${body.redirectPath}`)
  }

  try {
    const order = await createRevolutOrder(secretKey, {
      amountMinor,
      currency: 'EUR',
      description,
      customerEmail,
      redirectUrl,
      merchantOrderReference,
      expirePendingAfter: 'PT30M',
      metadata: {
        ...(body.userId && { user_id: body.userId }),
        ...(body.packType && { pack_type: body.packType }),
      },
    } as any)

    const checkoutUrl =
      order.checkout_url ||
      (order.token ? `https://checkout.revolut.com/payment-link/${order.token}` : null)
    if (!checkoutUrl) {
      return NextResponse.json(
        { error: 'Revolut n’a pas renvoyé d’URL de paiement.' },
        { status: 502 },
      )
    }

    return NextResponse.json({
      checkout_url: checkoutUrl,
      order_id: order.id,
      order_token: order.token,
    })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Erreur lors de la création de la commande Revolut.'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
