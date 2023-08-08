importScripts('https://www.gstatic.com/firebasejs/7.24.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.24.0/firebase-messaging.js');
firebase.initializeApp({
    apiKey: "AIzaSyDUzBAPIwmo7-H5I3g7-Z8hGAyKZNIHwIw",
    authDomain: "erp-prod-382ae.firebaseapp.com",
    projectId: "erp-prod-382ae",
    storageBucket: "erp-prod-382ae.appspot.com",
    messagingSenderId: "109025724927",
    appId: "1:109025724927:web:ca8d285ff186b7242b3fca",
    measurementId: "G-9HRV1RSY8B",
});
const messaging = firebase.messaging();

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(self.clients.openWindow(event.notification.data.url));
});

