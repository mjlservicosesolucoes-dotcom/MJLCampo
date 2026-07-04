// MJL — Service Worker (offline)
// Guarda o app no aparelho: abre mesmo SEM internet.
// Quando há internet, baixa a versão nova em segundo plano —
// na próxima abertura, o app já vem atualizado.
const CACHE = 'mjl-app-v1';

self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(['./', './index.html']); }));
});

self.addEventListener('activate', function(e){
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(e){
  if (e.request.method !== 'GET') return;
  var u = new URL(e.request.url);
  // Não intercepta chamadas ao Google (Apps Script / Sheets) — só o app em si
  if (u.origin !== self.location.origin) return;
  e.respondWith(
    caches.match(e.request).then(function(cached){
      var rede = fetch(e.request).then(function(r){
        if (r && r.ok) { var cp = r.clone(); caches.open(CACHE).then(function(c){ c.put(e.request, cp); }); }
        return r;
      }).catch(function(){ return cached; });
      return cached || rede;
    })
  );
});
