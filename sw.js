// Service worker: guarda o app para funcionar sem internet.
// IMPORTANTE: a cada nova publicação, mude o número em CACHE (v1 -> v2 ...),
// senão os celulares continuam com a versão antiga.
const CACHE = 'feirinha-v1';
const FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/app.css',
  './js/app.js',
  './js/dates.js',
  './js/html.js',
  './js/messages.js',
  './js/money.js',
  './js/orders.js',
  './js/products.js',
  './js/share.js',
  './js/store.js',
  './js/summary.js',
  './js/views/mensagem.js',
  './js/views/pedidos.js',
  './js/views/produtos.js',
  './js/views/resumo.js',
  './js/views/vender.js',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    event.respondWith(caches.match('./index.html').then((r) => r ?? fetch(req)));
    return;
  }
  event.respondWith(caches.match(req, { ignoreSearch: true }).then((r) => r ?? fetch(req)));
});
