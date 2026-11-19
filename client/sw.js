// Sodier War app shell (16/11/2026): only here so phones offer "install"; it never caches, the game always comes fresh from the server
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {}); // network as usual
