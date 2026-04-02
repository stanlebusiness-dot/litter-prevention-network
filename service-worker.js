const CACHE_NAME = 'lpn-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/events.html',
  '/report-litter.html',
  '/rewards.html',
  '/volunteer.html',
  '/submit-proof.html',
  '/login.html',
  '/dashboard.html',
  '/prize-portal.html',
  '/shared.css',
  '/shared.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});