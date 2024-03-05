self.addEventListener("install", () => {
  log("Service worker installed");
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  log("Service worker activated");
});

self.addEventListener("notificationclick", (e) => {
  log("Clicked " + e.action);
});

self.addEventListener("periodicsync", (e) => {
  log("Periodic sync: " + e.tag);
  self.registration.showNotification(`The PWA is still alive: ${i++}`);

  //  if (e.tag === "get-scheduled") {
  //    e.waitUntil(sendGetScheduledToMain(self.clients));
  //  }
});

self.addEventListener("message", (event) => {
  log("Message received:", event.data);

  if (event.data === "ping") {
    self.registration.showNotification("Pong!", {
      body: "Returned from sw.js...",
    });
  }
});

// async function sendGetScheduledToMain(clients) {
// const allClients = await clients.matchAll();
// const client = await clients.get(allClients[0].id);
// client.postMessage("get-scheduled");

//  return Promise.resolve();
// }

function log(message, ...params) {
  console.log("[sw]: " + message, ...params);
}

let i = 1;

/*
function scheduleNotificationIn10min() {
  setTimeout(() => {
    self.registration.showNotification(`My PWA is still alive: ${i++}`);
    scheduleNotificationIn10min();
  }, 20 * 1000);
}

scheduleNotificationIn10min();
*/
