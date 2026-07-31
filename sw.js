const CACHE_NAME = 'critical-care-offline-v2'; // قمنا بتغيير الإصدار إلى v2 لفرض التحديث الحالي

self.addEventListener('install', (event) => {
    self.skipWaiting(); // اجبار الخدمة على التثبيت فوراً دون الانتظار
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                './',
                './index.html',
                './manifest.json'
            ]);
        })
    );
});

self.addEventListener('activate', (event) => {
    // مسح الكاش القديم تلقائياً فور تشغيل نسخة جديدة
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).then((networkResponse) => {
            return caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
            });
        }).catch(() => {
            return caches.match(event.request);
        })
    );
});
