// Custom service worker code for UnitySOS
// This is imported into the next-pwa generated service worker via importScripts.

// Handle notification clicks — focus the app window or open it
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const urlToOpen = new URL("/", self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // Focus an existing window if found
      for (const client of windowClients) {
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle push events (for future server-sent push notifications)
self.addEventListener("push", (event) => {
  let data = { title: "UnitySOS Alert", body: "New alert received", type: "General" };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    vibrate: [200, 100, 200],
    tag: "unity-sos-alert",
    renotify: true,
    data: { url: "/" },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});
