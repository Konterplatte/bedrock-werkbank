// Bedrock-Werkbank als Web-App: speichert alle Dateien beim ersten Besuch, danach läuft sie ohne Internet.
'use strict';
const VERSION = "bw-faf82b2f62c2";
const FILES = [
 "./",
 "lexikon/",
 "bauplaene/",
 "favicon.ico",
 "index.html",
 "lizenzen.txt",
 "manifest.webmanifest",
 "bauplaene/index.html",
 "fonts/barlow-condensed-latin-500-normal.woff2",
 "fonts/barlow-condensed-latin-600-normal.woff2",
 "fonts/barlow-condensed-latin-700-normal.woff2",
 "fonts/fonts.css",
 "fonts/ibm-plex-sans-latin-400-normal.woff2",
 "fonts/ibm-plex-sans-latin-500-normal.woff2",
 "fonts/ibm-plex-sans-latin-600-normal.woff2",
 "icons/apple-touch-icon.png",
 "icons/icon-192.png",
 "icons/icon-512.png",
 "icons/icon-maskable-512.png",
 "lexikon/index.html"
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('bw-') && k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    caches.open(VERSION).then((cache) =>
      cache.match(req, { ignoreSearch: true }).then((hit) => {
        if (hit) return hit;
        return fetch(req).then((res) => {
          if (res.ok && res.type === 'basic') cache.put(req, res.clone());
          return res;
        }).catch(() => (req.mode === 'navigate' ? cache.match('./') : Response.error()));
      })
    )
  );
});
