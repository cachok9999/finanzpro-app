// FinanzPro Service Worker - Offline First Caching
const CACHE_NAME = 'finanzpro-v1.0.1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './src/css/styles.css',
  './src/js/app.js',
  './src/js/state.js',
  './src/js/financialEngine.js',
  './src/js/components/dashboard.js',
  './src/js/components/transactions.js',
  './src/js/components/transactionModal.js',
  './src/js/components/accounts.js',
  './src/js/components/budgets.js',
  './src/js/components/goals.js',
  './src/js/components/debts.js',
  './src/js/components/reports.js',
  './src/js/components/settings.js',
  './src/js/components/categories.js',
  './src/js/utils/currency.js',
  './src/js/utils/exporter.js',
  './src/js/utils/sampleData.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Precaching app shell & assets');
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn('[Service Worker] Non-critical cache error:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Try network first, fall back to cache
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Clone and cache successful GET responses
        if (event.request.method === 'GET' && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
