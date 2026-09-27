// Grofience Service Worker — PWA Mobile Support
const CACHE_NAME = 'grofience-pwa-v2'
const STATIC_ASSETS = [
  '/',
  '/grofience-logo.png',
  '/manifest.json',
]

// ── INSTALL: Pre-cache core assets ──
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Grofience PWA...')
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    }).then(() => {
      console.log('[SW] Core assets cached.')
      return self.skipWaiting()
    })
  )
})

// ── ACTIVATE: Remove old caches ──
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating new service worker...')
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name)
            return caches.delete(name)
          })
      )
    ).then(() => self.clients.claim())
  )
})

// ── FETCH: Smart caching strategy ──
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Always skip non-GET requests and API calls
  if (request.method !== 'GET') return
  if (url.pathname.startsWith('/api/')) return
  if (url.pathname.startsWith('/admin')) return

  // Static assets (JS, CSS, images, fonts) → cache-first
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/_next/image/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname === '/manifest.json'
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        })
      })
    )
    return
  }

  // HTML pages → network-first, fallback to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          return cached || caches.match('/')
        })
      })
  )
})

// Handle skipWaiting message from client
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting()
  }
})
