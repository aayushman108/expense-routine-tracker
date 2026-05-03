// This file is used to resolve the 404 error for the Firebase Messaging Service Worker.
// Since Firebase is not yet fully configured or a previous SW might still be registered,
// having this file prevents the browser from throwing a 404 error.

self.addEventListener("push", (event) => {
  // Dummy event listener
});
