// ====================================================================
// FRAN SILLER ARQUITETURA - Progressive Web App Service Worker
// Professional caching with automatic update detection
// ====================================================================

const CACHE_VERSION = 'v2';
const CACHE_STATIC = `fran-siller-static-${CACHE_VERSION}`;
const CACHE_IMAGES = `fran-siller-images-${CACHE_VERSION}`;
const CACHE_DYNAMIC = `fran-siller-dynamic-${CACHE_VERSION}`;

// Static assets to pre-cache on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json'
];

// Supabase storage URL pattern for project images
const SUPABASE_STORAGE_PATTERN = 'pycvlkcxgfwsquzolkzw.supabase.co/storage';

// ====================================================================
// INSTALL EVENT - Pre-cache essential static assets
// ====================================================================
self.addEventListener('install', (event) => {

    event.waitUntil(
        caches.open(CACHE_STATIC)
            .then((cache) => {
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                // Skip waiting to activate immediately
                return self.skipWaiting();
            })
            .catch(() => {
                // Pre-cache failed silently
            })
    );
});

// ====================================================================
// ACTIVATE EVENT - Clean up old caches and take control
// ====================================================================
self.addEventListener('activate', (event) => {

    const currentCaches = [CACHE_STATIC, CACHE_IMAGES, CACHE_DYNAMIC];

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        // Delete any cache that's not in our current list
                        if (!currentCaches.includes(cacheName)) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                // Take control of all clients immediately
                return self.clients.claim();
            })
            .then(() => {
                // Notify all clients that there's a new version
                return self.clients.matchAll().then((clients) => {
                    clients.forEach((client) => {
                        client.postMessage({
                            type: 'SW_UPDATED',
                            message: 'New content available'
                        });
                    });
                });
            })
    );
});

// ====================================================================
// FETCH EVENT - Smart caching strategies based on request type
// ====================================================================
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests - Cache API only supports GET
    if (request.method !== 'GET') {
        return;
    }

    // Skip non-HTTP requests (chrome-extension, etc.)
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // Skip API requests - always fetch fresh
    if (url.pathname.startsWith('/api') || url.pathname.includes('rest/v1')) {
        return;
    }

    // Determine the caching strategy based on request type
    if (isImageRequest(request)) {
        // IMAGES: Stale-While-Revalidate
        // Show cached version immediately, update cache in background
        event.respondWith(staleWhileRevalidate(request, CACHE_IMAGES));
    } else if (isStaticAsset(request)) {
        // STATIC ASSETS (JS, CSS): Cache First with Network Fallback
        event.respondWith(cacheFirstWithRefresh(request, CACHE_STATIC));
    } else {
        // HTML/OTHER: Network First with Cache Fallback
        event.respondWith(networkFirstWithCache(request, CACHE_DYNAMIC));
    }
});

// ====================================================================
// HELPER: Check if request is for an image
// ====================================================================
function isImageRequest(request) {
    const url = new URL(request.url);
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.avif'];
    const isImageExtension = imageExtensions.some(ext => url.pathname.toLowerCase().endsWith(ext));
    const isSupabaseStorage = url.href.includes(SUPABASE_STORAGE_PATTERN);

    return isImageExtension || isSupabaseStorage;
}

// ====================================================================
// HELPER: Check if request is for static asset
// ====================================================================
function isStaticAsset(request) {
    const url = new URL(request.url);
    const staticExtensions = ['.js', '.css', '.woff', '.woff2', '.ttf', '.eot'];
    return staticExtensions.some(ext => url.pathname.endsWith(ext));
}

// ====================================================================
// STRATEGY: Stale-While-Revalidate (Best for images)
// Returns cached version immediately while updating cache in background
// ====================================================================
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    // Start fetch in background (don't await)
    const fetchPromise = fetch(request)
        .then((networkResponse) => {
            // Only cache successful responses
            if (networkResponse && networkResponse.status === 200) {
                // Clone because response can only be consumed once
                cache.put(request, networkResponse.clone());
            }
            return networkResponse;
        })
        .catch(() => {
            // Network failed, but we might have cache
            return cachedResponse;
        });

    // Return cached response immediately if available, otherwise wait for network
    return cachedResponse || fetchPromise;
}

// ====================================================================
// STRATEGY: Cache First with Background Refresh (Static assets)
// Serves from cache but updates in background for next visit
// ====================================================================
async function cacheFirstWithRefresh(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    // Always try to update cache in background
    const networkPromise = fetch(request)
        .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
            }
            return networkResponse;
        })
        .catch(() => null);

    // Return cache immediately if available
    if (cachedResponse) {
        // Fire and forget the network update
        networkPromise;
        return cachedResponse;
    }

    // No cache, must wait for network
    const networkResponse = await networkPromise;
    if (networkResponse) {
        return networkResponse;
    }

    // Fallback to offline page
    return caches.match('/index.html');
}

// ====================================================================
// STRATEGY: Network First with Cache Fallback (HTML pages)
// Always tries network first for fresh content
// ====================================================================
async function networkFirstWithCache(request, cacheName) {
    const cache = await caches.open(cacheName);

    try {
        const networkResponse = await fetch(request);

        // Cache successful responses
        if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        // Network failed, try cache
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        // For navigation requests, return index.html for SPA routing
        if (request.mode === 'navigate') {
            return caches.match('/index.html');
        }

        // Nothing available
        return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// ====================================================================
// MESSAGE EVENT - Handle messages from the main thread
// ====================================================================
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => caches.delete(cacheName))
                );
            })
        );
    }
});

// ====================================================================
// PERIODIC SYNC - Check for updates periodically (if supported)
// ====================================================================
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'check-updates') {
        event.waitUntil(checkForUpdates());
    }
});

async function checkForUpdates() {
    try {
        await fetch('/manifest.json', { cache: 'no-store' });
    } catch {
        // Update check failed silently
    }
}
