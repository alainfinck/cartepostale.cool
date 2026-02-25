'use client'

import { useEffect } from 'react'

/**
 * Registers the PWA service worker (public/sw.js) and handles updates:
 * - On each page load the browser checks for a new sw.js (byte-different).
 * - When the page becomes visible again we call reg.update() to recheck.
 * - When a new worker takes control we reload so the user gets the new code.
 *
 * For cache invalidation: bump CACHE_NAME in public/sw.js on each release.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return
    if (!window.isSecureContext) return

    let reg: ServiceWorkerRegistration | null = null

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && reg) reg.update()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    const hadController = !!navigator.serviceWorker.controller
    const onControllerChange = () => {
      if (hadController) {
        window.location.reload()
      }
    }
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)

    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        reg = registration
        if (process.env.NODE_ENV === 'development') {
          console.log('[SW] Registered:', registration.scope)
        }
      })
      .catch((err) => {
        console.warn('[SW] Registration failed:', err)
      })

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
    }
  }, [])

  return null
}
