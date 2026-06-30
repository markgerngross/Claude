/* Service Worker: macht die App offline nutzbar und installierbar.
   Strategie: App-Schale (HTML/CSS/JS) cachen, API immer live vom Server. */
const CACHE = 'stuhl-taichi-v3';
const SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './program.js',
  './figure.js',
  './manifest.webmanifest',
  './icon.svg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // API niemals cachen – Fortschritt muss aktuell sein.
  if (url.pathname.startsWith('/api/')) return;
  // Fremde Hosts (z. B. Video-CDN) direkt durchreichen, nicht cachen.
  if (url.origin !== self.location.origin) return;
  // App-Schale: Cache zuerst, Netz als Fallback (und Cache nachfuellen).
  e.respondWith(
    caches.match(e.request).then((hit) =>
      hit || fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      }).catch(() => hit)
    )
  );
});
