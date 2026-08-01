/* =========================================================
   ADEVOS-X TECH — SERVICE WORKER (v4)
   NETWORK-FIRST strategy for HTML/CSS/JS. Always tries the
   network first so code updates are picked up immediately;
   only falls back to cache when the device is truly offline.
   This trades a tiny bit of speed for never-stale-again code —
   worth it while the app is under active development.
   ========================================================= */

const CACHE_NAME = 'adevos-x-shell-v4';

self.addEventListener('install', () => {
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

  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;
  if (request.url.includes('/api/')) return;

  // Icons/images: cache-first (they rarely change, safe to serve instantly)
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((response) => {
        if (response && response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      }))
    );
    return;
  }

  // Everything else (HTML/CSS/JS): network-first, cache only as an
  // offline fallback. This guarantees the newest deployed code always
  // wins when the device has a connection.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === 'navigate') {
          const fallback = await caches.match('/');
          if (fallback) return fallback;
        }
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      })
  );
});
