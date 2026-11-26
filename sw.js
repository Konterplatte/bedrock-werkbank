// Bedrock-Werkbank als Web-App: speichert alle Dateien beim ersten Besuch, danach läuft sie ohne Internet.
'use strict';
const VERSION = "bw-9a820cde1c63";
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

// Originalbilder: kommen direkt aus Mojangs Repository und bleiben nur auf diesem Gerät gespeichert (eigener Speicher, übersteht Updates)
const TEX = 'https://raw.githubusercontent.com/Mojang/bedrock-samples/';
const TEXCACHE = 'mojang-tex-1';

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (req.url.startsWith(TEX)) {
    event.respondWith(caches.open(TEXCACHE).then((cache) => cache.match(req.url).then((hit) => hit ||
      fetch(new Request(req.url, { mode: 'cors', credentials: 'omit' })).then((res) => {
        if (res.ok) cache.put(req.url, res.clone());
        return res;
      }))));
    return;
  }
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || url.pathname.includes('/download/')) return;   // Downloads nie zwischenspeichern
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
