// Service worker: keeps a copy of the app on the phone so it works offline.
importScripts('data.js'); // for LIB, the list of demo pictures
const CACHE = 'myfit-v7';
const PICS = [...new Set(Object.values(LIB).map(l => l.img).filter(Boolean))]
  .map(p => 'img/' + p + '.jpg');
const FILES = [
  './',
  'index.html',
  'styles.css',
  'data.js',
  'app.js',
  'manifest.webmanifest',
  'icon-180.png',
  'icon-192.png',
  'icon-512.png',
  'img/hero.jpg'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.concat(PICS))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Serve from the saved copy first (instant, works offline), and quietly
// refresh the saved copy in the background whenever there is internet.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const cached = await cache.match(req, { ignoreSearch: true });
      const fresh = fetch(req).then(res => {
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      }).catch(() => null);
      if (cached) { e.waitUntil(fresh); return cached; }
      return (await fresh) || (req.mode === 'navigate' ? cache.match('index.html') : Response.error());
    })
  );
});
