/**
 * Route API — Meta Conversions API (CAPI)
 *
 * Permet d'envoyer des événements côté serveur à Meta pour :
 * - Contourner les bloqueurs de pub / restrictions iOS
 * - Améliorer la qualité du signal pour les campagnes Facebook Ads
 * - Assurer la déduplication avec le Pixel côté client (via eventID)
 *
 * Référence : https://developers.facebook.com/docs/marketing-api/conversions-api
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const PIXEL_ID = process.env.META_PIXEL_ID
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN
const CAPI_URL = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events`

function hashSHA256(value: string): string {
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex')
}

function generateEventId(): string {
  return crypto.randomUUID()
}

export async function POST(request: NextRequest) {
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    return NextResponse.json(
      { error: 'Meta Pixel non configuré (META_PIXEL_ID ou META_ACCESS_TOKEN manquant).' },
      { status: 503 },
    )
  }

  let body: {
    eventName?: string
    eventId?: string
    params?: Record<string, unknown>
    userEmail?: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corps de requête JSON invalide.' }, { status: 400 })
  }

  const { eventName, params = {}, userEmail } = body
  if (!eventName) {
    return NextResponse.json({ error: 'eventName manquant.' }, { status: 400 })
  }

  const eventId = body.eventId || generateEventId()
  const eventTime = Math.floor(Date.now() / 1000)

  // Récupération de l'IP et du User-Agent depuis les headers de la requête
  const clientIpAddress =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    undefined
  const clientUserAgent = request.headers.get('user-agent') || undefined

  // Récupération du cookie _fbp / _fbc (envoyé par le client si disponible)
  const cookieHeader = request.headers.get('cookie') || ''
  const fbpMatch = cookieHeader.match(/_fbp=([^;]+)/)
  const fbcMatch = cookieHeader.match(/_fbc=([^;]+)/)
  const fbp = fbpMatch ? fbpMatch[1] : undefined
  const fbc = fbcMatch ? fbcMatch[1] : undefined

  // Données utilisateur hashées (PII)
  const userData: Record<string, string> = {}
  if (userEmail) {
    userData.em = hashSHA256(userEmail)
  }
  if (clientIpAddress) {
    userData.client_ip_address = clientIpAddress
  }
  if (clientUserAgent) {
    userData.client_user_agent = clientUserAgent
  }
  if (fbp) userData.fbp = fbp
  if (fbc) userData.fbc = fbc

  // Construction du payload CAPI
  const capiPayload = {
    data: [
      {
        event_name: eventName,
        event_time: eventTime,
        event_id: eventId,
        action_source: 'website',
        event_source_url: request.headers.get('referer') || `https://cartepostale.cool`,
        user_data: userData,
        custom_data: params,
      },
    ],
    // test_event_code: 'TEST12345', // décommenter pour tester dans le Meta Events Manager
  }

  try {
    const response = await fetch(`${CAPI_URL}?access_token=${ACCESS_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(capiPayload),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('[Meta CAPI] Erreur API:', data)
      return NextResponse.json({ error: 'Erreur Meta CAPI', details: data }, { status: 502 })
    }

    return NextResponse.json({ success: true, eventId, data })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    console.error('[Meta CAPI] Exception:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
