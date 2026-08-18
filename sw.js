const CACHE = 'madrassa-v2';
const OFFLINE = [
  './',
  './index.html',
  './modir.html',
  './images/logo.PNG',
  'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap'
];
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(OFFLINE)).then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  // Firebase & EmailJS immer live abrufen
  if (e.request.url.includes('firebase') ||
      e.request.url.includes('googleapis.com/google.firestore') ||
      e.request.url.includes('emailjs') ||
      e.request.url.includes('firebaseio')) {
    return;
  }
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});

/* ── Push anzeigen ── */
self.addEventListener('push', function (e) {
  var data = {};
  try {
    data = e.data ? e.data.json() : {};
  } catch (x) {}

  var title = data.title || 'Madrassa Hannover';
  var options = {
    body: data.body || 'Neue Benachrichtigung',
    icon: data.icon || './images/logo.PNG',
    badge: data.badge || './images/logo.PNG',
    data: { url: data.url || './' },
    vibrate: [200, 100, 200]
  };

  e.waitUntil(self.registration.showNotification(title, options));
});

/* ── Klick öffnet die App ── */
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var target = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        if ('focus' in list[i]) return list[i].focus();
      }
      if (clients.openWindow) return clients.openWindow(target);
    })
  );
});
