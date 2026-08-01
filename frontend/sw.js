/* =========================================================
   ADEVOS-X TECH — SERVICE WORKER
   Caches the app shell so the PWA opens instantly and never
   shows the browser's native offline page.
   ========================================================= */

const CACHE_NAME = 'adevos-x-shell-v1';
const APP_SHELL = [
  '/index.html',
  '/css/global.css',
  '/css/components.css',
  '/css/layout.css',
  '/js/config.js',
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
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
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

  // Never cache API calls — always go to network, they need fresh data
  if (request.url.includes('/api/')) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (request.method === 'GET' && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          if (request.mode === 'navigate') return caches.match('/index.html');
        });
    })
  );
});

