/* =========================================================
   ADEVOS-X TECH — SERVICE WORKER (v2)
   Caches the app shell so the PWA opens instantly and never
   shows the browser's native offline page. v2 bumps the cache
   name to clear any broken v1 cache from earlier deploys.
   ========================================================= */

const CACHE_NAME = 'adevos-x-shell-v2';
const APP_SHELL = [
  '/index.html',
  '/css/global.css',
  '/css/components.css',
  '/css/layout.css',
  '/js/config.js',
  '/js/theme.js',
  '/js/api.js',
  '/js/auth.js',
  '/js/ui.js',
  '/js/actionEngine.js',
  '/js/offline.js',
  '/js/main.js',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle same-origin GET requests. Everything else (API calls,
  // Google Fonts, Font Awesome CDN, POST/PUT/DELETE) goes straight to the
  // network untouched — this is what was previously breaking navigation.
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;
  if (request.url.includes('/api/')) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          if (request.mode === 'navigate') {
            const fallback = await caches.match('/index.html');
            if (fallback) return fallback;
          }
          // Always resolve with a real Response — never undefined,
          // or Chrome reports ERR_FAILED instead of a normal network error.
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        })
    })
  );
});
