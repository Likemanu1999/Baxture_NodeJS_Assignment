importScripts('https://www.gstatic.com/firebasejs/7.24.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.24.0/firebase-messaging.js');
firebase.initializeApp({
    apiKey: "AIzaSyDZJfj2INNKYPmwMHC3beH_ecPoNMNPWtc",
    authDomain: "spipl-dev.firebaseapp.com",
    projectId: "spipl-dev",
    storageBucket: "spipl-dev.appspot.com",
    messagingSenderId: "62779999742",
    appId: "1:62779999742:web:4c01a2199f4a5cef06ecaf",
    measurementId: "G-9NM8LBBT8G",
});
const messaging = firebase.messaging();

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(self.clients.openWindow(event.notification.data.url));
});
