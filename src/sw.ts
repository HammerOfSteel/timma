import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate, ExpirationPlugin, Serwist } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope & typeof globalThis;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Cache page navigations (NetworkFirst — show cached page when offline)
    {
      matcher: ({ request }) => request.mode === 'navigate',
      handler: new NetworkFirst({
        cacheName: 'pages-cache',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 30,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
          }),
        ],
      }),
    },
    // Cache API responses for schedule data (StaleWhileRevalidate)
    {
      matcher: ({ url }) =>
        url.pathname.startsWith('/api/') ||
        url.pathname === '/' ||
        url.pathname.startsWith('/_next/data/'),
      handler: new StaleWhileRevalidate({
        cacheName: 'api-cache',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 24 * 60 * 60, // 1 day
          }),
        ],
      }),
    },
    // Cache Mulberry symbol SVGs (CacheFirst — they never change)
    {
      matcher: ({ url }) => url.pathname.startsWith('/symbols/'),
      handler: new CacheFirst({
        cacheName: 'symbols-cache',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 500,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          }),
        ],
      }),
    },
    // Cache uploaded images
    {
      matcher: ({ url }) => url.pathname.startsWith('/uploads/'),
      handler: new CacheFirst({
        cacheName: 'uploads-cache',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 200,
            maxAgeSeconds: 30 * 24 * 60 * 60,
          }),
        ],
      }),
    },
    // Cache fonts and static assets
    {
      matcher: ({ url }) =>
        url.pathname.startsWith('/_next/static/') ||
        url.pathname.includes('/fonts/') ||
        url.pathname.endsWith('.css') ||
        url.pathname.endsWith('.js'),
      handler: new StaleWhileRevalidate({
        cacheName: 'static-cache',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 30 * 24 * 60 * 60,
          }),
        ],
      }),
    },
    // Cache background images
    {
      matcher: ({ url }) => url.pathname.startsWith('/images/'),
      handler: new CacheFirst({
        cacheName: 'images-cache',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 20,
            maxAgeSeconds: 30 * 24 * 60 * 60,
          }),
        ],
      }),
    },
    // Default cache for everything else
    ...defaultCache,
  ],
});

// Background sync: queue failed mutations for retry
const SYNC_TAG = 'timma-sync';
const PENDING_ACTIONS_STORE = 'timma-pending-actions';

self.addEventListener('sync', (event: ExtendableEvent & { tag?: string }) => {
  if (event.tag === SYNC_TAG) {
    event.waitUntil(replayPendingActions());
  }
});

async function replayPendingActions() {
  try {
    const cache = await caches.open(PENDING_ACTIONS_STORE);
    const requests = await cache.keys();

    for (const request of requests) {
      try {
        const response = await cache.match(request);
        if (!response) continue;

        const body = await response.text();
        await fetch(request.url, {
          method: request.method,
          headers: request.headers,
          body,
        });

        await cache.delete(request);
      } catch {
        // Still offline — will retry on next sync
        break;
      }
    }
  } catch {
    // Cache API unavailable
  }
}

serwist.addEventListeners();
