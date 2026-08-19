const CACHE = 'madrassa-v3';
const ASSETS = ['./images/logo.PNG'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return Promise.all(
        ASSETS.map(function (url) {
          return cache.add(url).catch(function () {});
        })
      );
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE; }).map(function (k) {
          return caches.delete(k);
        })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (
    e.request.method !== 'GET' ||
    e.request.url.indexOf('firebase') !== -1 ||
    e.request.url.indexOf('googleapis') !== -1 ||
    e.request.url.indexOf('firestore') !== -1 ||
    e.request.url.indexOf('firebaseio') !== -1 ||
    e.request.url.indexOf('emailjs') !== -1
  ) {
    return;
  }
  e.respondWith(
    fetch(e.request).then(function (res) {
      var clone = res.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, clone).catch(function () {}); });
      return res;
    }).catch(function () {
      return caches.match(e.request);
    })
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
