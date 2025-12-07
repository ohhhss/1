const CACHE_NAME = 'worthiness-journal-v2';

// 核心资源缓存列表
// 注意：不要在这里缓存 .tsx 或 .ts 文件，因为它们在生产环境中会被编译成 .js，源文件不存在。
// 缓存 index.html 和 manifest 即可，浏览器会自动根据 HTML 加载打包后的 JS。
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  // 缓存 Tailwind CDN，确保离线样式正常
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // 使用 addAll 时，如果任何一个文件 404，整个缓存都会失败。
      // 所以只缓存最核心、肯定存在的文件。
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});