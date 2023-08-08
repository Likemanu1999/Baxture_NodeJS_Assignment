importScripts('https://www.gstatic.com/firebasejs/7.24.0/firebase-app.js'); 
importScripts('https://www.gstatic.com/firebasejs/7.24.0/firebase-messaging.js');

const firebaseCo =require('./environments/environment');

// require('./environments/environment')

firebase.initializeApp(firebaseCo.environment.firebaseConfig);
const messaging = firebase.messaging();

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(self.clients.openWindow(event.notification.data.url));
});

