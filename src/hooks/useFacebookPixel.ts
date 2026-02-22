/**
 * useFacebookPixel — Hook pour tracker des événements Meta Pixel
 * depuis n'importe quel composant React.
 *
 * Événements standard couverts pour CartePostale.cool :
 * - ViewContent    : consultation d'une carte / page produit
 * - AddToCart      : sélection d'une offre premium
 * - InitiateCheckout : ouverture du formulaire de paiement
 * - Purchase       : paiement validé (+ Conversions API côté serveur)
 * - Lead           : inscription / demande de contact
 * - CompleteRegistration : création de compte finalisée
 * - Search         : recherche dans la galerie
 * - CustomizeProduct : modification d'une carte (édition)
 */

'use client'

import { useCallback } from 'react'

type FbEventName =
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'Purchase'
  | 'Lead'
  | 'CompleteRegistration'
  | 'Search'
  | 'CustomizeProduct'
  | string

interface PurchaseParams {
  value: number
  currency: string
  content_ids?: string[]
  content_name?: string
  content_type?: string
}

interface ViewContentParams {
  content_ids?: string[]
  content_name?: string
  content_type?: string
  content_category?: string
  value?: number
  currency?: string
}

interface AddToCartParams {
  content_ids?: string[]
  content_name?: string
  value?: number
  currency?: string
}

type FbEventParams = PurchaseParams | ViewContentParams | AddToCartParams | Record<string, unknown>

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void
  }
}

export function useFacebookPixel() {
  const trackEvent = useCallback(
    (eventName: FbEventName, params?: FbEventParams, eventId?: string) => {
      if (typeof window === 'undefined' || !window.fbq) return

      if (eventId) {
        window.fbq('track', eventName, params || {}, { eventID: eventId })
      } else {
        window.fbq('track', eventName, params || {})
      }
    },
    [],
  )

  /**
   * Déclenche un événement Purchase côté pixel ET côté serveur (Conversions API)
   * pour une déduplication optimale et le tracking iOS/bloqueurs d'annonces.
   */
  const trackPurchase = useCallback(
    async (params: PurchaseParams & { eventId: string; userEmail?: string }) => {
      const { eventId, userEmail, ...pixelParams } = params

      // 1. Pixel côté client
      trackEvent('Purchase', pixelParams, eventId)

      // 2. Conversions API côté serveur
      try {
        await fetch('/api/meta/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventName: 'Purchase',
            eventId,
            params: pixelParams,
            userEmail,
          }),
        })
      } catch (err) {
        console.warn('[Meta CAPI] Erreur envoi serveur:', err)
      }
    },
    [trackEvent],
  )

  /**
   * Track ViewContent : consultation d'une carte
   */
  const trackViewContent = useCallback(
    (params: ViewContentParams) => {
      trackEvent('ViewContent', params)
    },
    [trackEvent],
  )

  /**
   * Track AddToCart : sélection d'une offre premium
   */
  const trackAddToCart = useCallback(
    (params: AddToCartParams) => {
      trackEvent('AddToCart', params)
    },
    [trackEvent],
  )

  /**
   * Track InitiateCheckout : ouverture du widget de paiement
   */
  const trackInitiateCheckout = useCallback(
    (params?: { value?: number; currency?: string; content_name?: string }) => {
      trackEvent('InitiateCheckout', params)
    },
    [trackEvent],
  )

  /**
   * Track Lead : soumission du formulaire de contact / agence
   */
  const trackLead = useCallback(
    (params?: { content_name?: string }) => {
      trackEvent('Lead', params)
    },
    [trackEvent],
  )

  /**
   * Track CompleteRegistration : création de compte finalisée
   */
  const trackCompleteRegistration = useCallback(
    (params?: { content_name?: string }) => {
      trackEvent('CompleteRegistration', params)
    },
    [trackEvent],
  )

  /**
   * Track CustomizeProduct : modification active dans l'éditeur
   */
  const trackCustomizeProduct = useCallback(() => {
    trackEvent('CustomizeProduct')
  }, [trackEvent])

  /**
   * Track Search : recherche dans la galerie
   */
  const trackSearch = useCallback(
    (searchString: string) => {
      trackEvent('Search', { search_string: searchString })
    },
    [trackEvent],
  )

  /**
   * Track un événement server-side uniquement via la Conversions API
   */
  const trackServerEvent = useCallback(
    async (
      eventName: FbEventName,
      params?: FbEventParams,
      options?: { eventId?: string; userEmail?: string },
    ) => {
      try {
        await fetch('/api/meta/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventName,
            eventId: options?.eventId,
            params,
            userEmail: options?.userEmail,
          }),
        })
      } catch (err) {
        console.warn('[Meta CAPI] Erreur envoi serveur:', err)
      }
    },
    [],
  )

  return {
    trackEvent,
    trackPurchase,
    trackViewContent,
    trackAddToCart,
    trackInitiateCheckout,
    trackLead,
    trackCompleteRegistration,
    trackCustomizeProduct,
    trackSearch,
    trackServerEvent,
  }
}
