// Service Worker for CartePostale.cool PWA
// CACHE_NAME is replaced at build time by scripts/generate-sw.mjs (do not edit manually).
const CACHE_NAME = 'cartepostale-0c32cb81f0d6'
const STATIC_CACHE = [
  '/',
  '/editor',
  '/galerie',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
]

// Install event - cache static resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_CACHE)
    }),
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
  self.clients.claim()
})

// Fetch event - navigation always network-first so HTML/JS stay fresh; images cache-first
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  if (
    event.request.url.includes('/api/') ||
    event.request.url.includes('/admin') ||
    event.request.url.includes('/payload')
  ) {
    return
  }

  // Navigation (HTML pages): always fetch from network so users get latest code (fixes stale clicks on Safari desktop)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    )
    return
  }

  // Images and static assets: cache-first
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).then((fetchResponse) => {
          if (
            fetchResponse.ok &&
            (event.request.url.includes('/images/') ||
              event.request.url.includes('/media/') ||
              event.request.url.includes('.jpg') ||
              event.request.url.includes('.png') ||
              event.request.url.includes('.webp'))
          ) {
            const responseToCache = fetchResponse.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache)
            })
          }
          return fetchResponse
        })
      )
    })
  )
})
