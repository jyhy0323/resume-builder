const CACHE_NAME = 'resume-builder-pwa-v1';
const STATIC_ASSETS = [
  '/',
  '/static/css/style.css',
  '/static/js/app.js',
  '/static/manifest.json',
  '/static/icons/icon-192.png',
  '/static/icons/icon-512.png'
];

// 1. 설치 시 기본 정적 자산 캐싱
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// 2. 활성화 시 구버전 캐시 정리
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// 3. 네트워크 요청 처리: API(/generate)는 항상 네트워크 우선, 정적 파일은 캐시 우선
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 이력서 생성 API는 캐시하지 않고 항상 네트워크로 직접 전송
  if (url.pathname === '/generate') {
    event.respondWith(fetch(event.request));
    return;
  }

  // 일반 정적 파일 및 페이지는 캐시 확인 후 네트워크 폴백
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
      );
    })
  );
});
