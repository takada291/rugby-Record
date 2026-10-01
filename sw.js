const CACHE_NAME = 'rugby-record-cache-v1.1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// インストール時にすぐに待機状態をスキップ（即時アクティベート）
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// アクティベート時に古いバージョンのキャッシュを強制全削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('古いキャッシュを削除しました:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// フェッチ時は「ネットワーク優先（Network First）」
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // ネットワーク通信成功時は最新版をキャッシュに上書き保存して返す
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // オフライン（通信失敗）時のみキャッシュから返す
        return caches.match(event.request);
      })
  );
});
