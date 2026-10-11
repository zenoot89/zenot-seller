// sw.js (zenoot-seller): menerima Web Push dan membuka halaman yang tepat saat notifikasi diketuk.
// Sengaja tidak menyimpan cache apa pun: hanya untuk notifikasi.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

self.addEventListener('push', event => {
  let d = {};
  try {
    d = event.data ? event.data.json() : {};
  } catch (e) {
    d = { body: event.data ? event.data.text() : '' };
  }
  const title = d.title || 'Zenoot Seller';
  event.waitUntil(self.registration.showNotification(title, {
    body: d.body || '',
    tag: d.tag || 'zenot-seller',
    renotify: true,
    icon: 'icon-192.png',
    data: { hash: typeof d.hash === 'string' ? d.hash : '' }
  }));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const hash = (event.notification.data && event.notification.data.hash) || '';
  const base = self.registration.scope; // contoh: https://zenoot89.github.io/zenot-seller/
  event.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of wins) {
      if (c.url.indexOf(base) === 0) {
        await c.focus();
        c.postMessage({ type: 'push-open', hash: hash });
        return;
      }
    }
    await self.clients.openWindow(base + hash);
  })());
});
