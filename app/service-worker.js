// Copy Pasta v2 — Service Worker
// Enables offline use by caching all app files on first visit.

const CACHE_NAME = 'copy-pasta-v2.0.0';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './js/app.js',
  './js/tools.js',
  './icons/icon-prompt.svg',
  './manifest.json'
];

// Install: pre-cache all app assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches from previous versions
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: serve from cache, fall back to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request))
  );
});
