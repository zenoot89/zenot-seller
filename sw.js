// sw.js (zenoot-seller) v2: menerima Web Push dan membuka halaman yang tepat saat notifikasi diketuk.
// Sengaja tidak menyimpan cache halaman: hanya untuk notifikasi.

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

// Tujuan ketukan disimpan dulu di Cache Storage. Halaman membacanya saat dibuka atau kembali ke depan,
// jadi tetap sampai walau iPhone tidak meneruskan pesan atau mengabaikan alamat saat membuka aplikasi.
async function savePendingNav(base, hash) {
  try {
    const c = await caches.open('zenot-nav');
    await c.put(base + '__pending-nav', new Response(JSON.stringify({ hash: hash, t: Date.now() }), { headers: { 'Content-Type': 'application/json' } }));
  } catch (e) { /* Cache Storage tidak tersedia: lanjut tanpa jalur cadangan */ }
}

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const hash = (event.notification.data && event.notification.data.hash) || '';
  const base = self.registration.scope; // contoh: https://zenoot89.github.io/zenot-seller/
  event.waitUntil((async () => {
    if (hash) await savePendingNav(base, hash);
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    let handled = false;
    for (const c of wins) {
      if (c.url.indexOf(base) !== 0) continue;
      try { c.postMessage({ type: 'push-open', hash: hash }); handled = true; } catch (e) { /* lanjut */ }
      try { await c.focus(); } catch (e) { /* iPhone bisa menolak focus(); pesan sudah terkirim */ }
    }
    if (!handled) {
      try { await self.clients.openWindow(base + hash); } catch (e) { /* tujuan tetap tersimpan di cache */ }
    }
  })());
});
