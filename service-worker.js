const CACHE_NAME = 'lpn-cache-v2';
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

self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request));
    return;
  }
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});