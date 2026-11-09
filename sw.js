/* 语之境界 service worker v2.4.0 — 网络优先+缓存兜底(保证每日更新), 静态资源缓存优先 */
const CACHE = "yunyu-quest-v2.4.0";
const CORE = ["./", "manifest.json", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  if (url.pathname.endsWith("sw.js")) return;
  const isStatic = /\.(png|json|ico)$/.test(url.pathname);
  if (isStatic) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
      const cp = resp.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return resp;
    })));
  } else {
    e.respondWith(fetch(e.request).then(resp => {
      const cp = resp.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return resp;
    }).catch(() => caches.match(e.request)));
  }
});
