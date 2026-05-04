importScripts(
  "https://www.gstatic.com/firebasejs/11.6.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/11.6.0/firebase-messaging-compat.js",
);

const firebaseConfig = {
  apiKey: "AIzaSyANm7Bt9fBYAFAi51kmbycKR7IoJYVU4rA",
  authDomain: "expensora-push-notification.firebaseapp.com",
  projectId: "expensora-push-notification",
  storageBucket: "expensora-push-notification.firebasestorage.app",
  messagingSenderId: "935683551132",
  appId: "1:935683551132:web:00e2450e9e634eb6526259",
  measurementId: "G-H54JNYEH9H",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  const notificationTitle =
    payload.notification?.title || "Expensora Notification";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: "/icon.png",
    badge: "/icon.png",
    tag: payload.data?.tag || "expensora-notification",
    data: payload.data || {},
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && "focus" in client) {
            return client.focus();
          }
        }
        return clients.openWindow(urlToOpen);
      }),
  );
});
