/**
 * Revolut Merchant API – création de commande pour Hosted Checkout.
 * Doc: https://developer.revolut.com/docs/merchant/create-order
 */

const REVOLUT_API_BASE = 'https://merchant.revolut.com/api/1.0'
const API_VERSION = '2025-12-04'

export type CreateOrderParams = {
  /** Montant en unités mineures (ex. 199 = 1,99 €) */
  amountMinor: number
  currency?: string
  description?: string
  customerEmail?: string
  /** URL de redirection après paiement réussi (absolue) */
  redirectUrl?: string
  /** Référence interne (ex. publicId de la carte) */
  merchantOrderReference?: string
  /** Métadonnées arbitraires */
  metadata?: Record<string, any>
  /** Expiration des commandes en attente (ex. "PT30M" = 30 min) */
  expirePendingAfter?: string
}

export type RevolutOrder = {
  id: string
  token?: string
  state: string
  amount: number
  currency: string
  checkout_url?: string
  [key: string]: unknown
}

export async function createRevolutOrder(
  secretKey: string,
  params: CreateOrderParams,
): Promise<RevolutOrder> {
  const {
    amountMinor,
    currency = 'EUR',
    description,
    customerEmail,
    redirectUrl,
    merchantOrderReference,
    metadata,
    expirePendingAfter,
  } = params
  const body: Record<string, unknown> = {
    amount: amountMinor,
    currency,
    ...(description && { description }),
    ...(customerEmail && { customer: { email: customerEmail } }),
    ...(redirectUrl && { redirect_url: redirectUrl }),
    ...(merchantOrderReference && {
      metadata: { order_reference: merchantOrderReference, ...(metadata || {}) },
    }),
    ...(!merchantOrderReference && metadata && { metadata }),
    ...(expirePendingAfter && { expire_pending_after: expirePendingAfter }),
  }

  const res = await fetch(`${REVOLUT_API_BASE}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${secretKey.trim()}`,
      'Revolut-Api-Version': API_VERSION,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errText = await res.text()
    let errJson: { message?: string; error?: string } = {}
    try {
      errJson = JSON.parse(errText)
    } catch {
      // ignore
    }
    throw new Error(errJson.message || errJson.error || `Revolut API ${res.status}: ${errText}`)
  }

  const data = (await res.json()) as RevolutOrder
  // Hosted Checkout: checkout_url peut être dans la réponse (selon version API)
  if (!data.checkout_url && data.token) {
    data.checkout_url = `https://checkout.revolut.com/payment-link/${data.token}`
  }
  return data
}
