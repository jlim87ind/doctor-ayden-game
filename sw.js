// Service worker for Doctor Ayden to the Rescue!
// Strategy: network-first for same-origin GETs (so `npm start` / dev always
// sees fresh files), falling back to the cache when offline. Every
// successful same-origin GET response also refreshes the cache, and the
// full runtime file list (assets/*, fonts, JS modules...) is precached on
// install so the game works offline after one online visit.

const CACHE = 'doctor-ayden-v1';
const PRECACHE_URL = 'precache.json';

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      try {
        const res = await fetch(PRECACHE_URL, { cache: 'no-store' });
        const files = await res.json();
        const urls = Array.from(new Set([...files, PRECACHE_URL, './']));
        await Promise.all(
          urls.map(async (url) => {
            try {
              const req = new Request(url, { cache: 'no-store' });
              const response = await fetch(req);
              if (response && response.ok) await cache.put(url, response);
            } catch {
              // Ignore individual precache failures; offline coverage is
              // best-effort for files that don't fetch on install.
            }
          })
        );
      } catch {
        // No network / no precache manifest yet: nothing to precache now.
      }
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const network = fetch(request).then((response) => {
        if (response && response.ok) cache.put(request, response.clone());
        return response;
      });
      network.catch(() => {}); // a late failure after the cache answered is fine
      try {
        // On slow classroom Wi-Fi, use the saved copy after 4 s rather than wait forever.
        const slow = new Promise((resolve) => setTimeout(resolve, 4000, 'slow'));
        const first = await Promise.race([network, slow]);
        if (first !== 'slow') return first;
        const cached = await cache.match(request);
        return cached || (await network);
      } catch {
        const cached = await cache.match(request);
        if (cached) return cached;
        const fallback = await cache.match('index.html');
        if (fallback && request.mode === 'navigate') return fallback;
        throw new Error('offline and not cached: ' + request.url);
      }
    })()
  );
});
