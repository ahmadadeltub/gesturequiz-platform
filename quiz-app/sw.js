// GestureQuiz Service Worker for Offline Functionality
const CACHE_NAME = 'gesturequiz-v2.1.0';
const STATIC_CACHE = 'gesturequiz-static-v2.1';
const DYNAMIC_CACHE = 'gesturequiz-dynamic-v2.1';

// Resources to cache immediately
const STATIC_ASSETS = [
  '/quiz-app/',
  '/quiz-app/index.html',
  '/quiz-app/pages/teacher-dashboard.html',
  '/quiz-app/pages/student-dashboard.html',
  '/quiz-app/pages/class-management.html',
  '/quiz-app/pages/analytics.html',
  '/quiz-app/pages/quiz-creator.html',
  '/quiz-app/pages/quiz-interface.html',
  '/quiz-app/pages/quiz-management.html',
  '/quiz-app/pages/system-command-center.html',
  '/quiz-app/pages/complete-system-test.html',
  '/quiz-app/setup-test-users.html',
  '/quiz-app/js/main.js',
  '/quiz-app/js/auth.js',
  '/quiz-app/js/quiz.js',
  '/quiz-app/js/utils.js',
  '/quiz-app/js/live-data-manager.js',
  '/quiz-app/js/api-simulator.js',
  '/quiz-app/js/data-integration.js',
  '/quiz-app/js/notification-system.js',
  '/quiz-app/js/performance-monitor.js',
  '/quiz-app/css/main.css',
  '/quiz-app/css/auth.css',
  '/quiz-app/css/quiz.css',
  '/quiz-app/css/landing.css',
  '/quiz-app/css/modern-dashboard.css',
  '/quiz-app/css/modern-landing.css',
  '/quiz-app/manifest.json'
];

// External resources
const EXTERNAL_RESOURCES = [
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
  'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/hands.js'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Cache external resources
      caches.open(STATIC_CACHE).then(cache => {
        console.log('Service Worker: Caching external resources');
        return Promise.allSettled(
          EXTERNAL_RESOURCES.map(url => 
            cache.add(url).catch(err => console.warn('Failed to cache:', url, err))
          )
        );
      })
    ]).then(() => {
      console.log('Service Worker: Installation complete');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete old caches
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!request.url.startsWith('http')) {
    return;
  }
  
  event.respondWith(
    // Try cache first, then network
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        console.log('Service Worker: Serving from cache:', request.url);
        return cachedResponse;
      }
      
      // Not in cache, fetch from network
      return fetch(request).then(networkResponse => {
        // Cache successful responses
        if (networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          
          // Determine which cache to use
          const cacheToUse = STATIC_ASSETS.includes(new URL(request.url).pathname) 
            ? STATIC_CACHE 
            : DYNAMIC_CACHE;
          
          caches.open(cacheToUse).then(cache => {
            cache.put(request, responseClone);
          });
        }
        
        return networkResponse;
      }).catch(error => {
        console.log('Service Worker: Network request failed:', request.url);
        
        // Provide fallback for navigation requests
        if (request.destination === 'document') {
          return caches.match('/quiz-app/index.html');
        }
        
        // Provide fallback for images
        if (request.destination === 'image') {
          return new Response(
            '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#f0f0f0"/><text x="100" y="100" text-anchor="middle" dy="0.3em" font-family="Arial" font-size="14" fill="#666">Image unavailable</text></svg>',
            { headers: { 'Content-Type': 'image/svg+xml' } }
          );
        }
        
        throw error;
      });
    })
  );
});

// Background sync for data synchronization
self.addEventListener('sync', event => {
  console.log('Service Worker: Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-quiz-data') {
    event.waitUntil(syncQuizData());
  }
});

// Push notifications (for future server integration)
self.addEventListener('push', event => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from GestureQuiz',
    icon: '/quiz-app/assets/icon-192x192.png',
    badge: '/quiz-app/assets/badge.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/quiz-app/assets/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/quiz-app/assets/xmark.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('GestureQuiz', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/quiz-app/')
    );
  }
});

// Data synchronization function
async function syncQuizData() {
  try {
    console.log('Service Worker: Syncing quiz data...');
    
    // Get stored data from IndexedDB/localStorage
    const clients = await self.clients.matchAll();
    
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_DATA',
        timestamp: Date.now()
      });
    });
    
    console.log('Service Worker: Data sync completed');
  } catch (error) {
    console.error('Service Worker: Data sync failed:', error);
  }
}

// Message handling from main thread
self.addEventListener('message', event => {
  console.log('Service Worker: Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_QUIZ_DATA') {
    // Cache quiz data for offline access
    caches.open(DYNAMIC_CACHE).then(cache => {
      const dataBlob = new Blob([JSON.stringify(event.data.data)], {
        type: 'application/json'
      });
      const response = new Response(dataBlob);
      cache.put('/quiz-data-cache', response);
    });
  }
});

// Periodic background sync (when supported)
self.addEventListener('periodicsync', event => {
  console.log('Service Worker: Periodic sync triggered:', event.tag);
  
  if (event.tag === 'quiz-data-sync') {
    event.waitUntil(syncQuizData());
  }
});

console.log('Service Worker: Script loaded successfully');
