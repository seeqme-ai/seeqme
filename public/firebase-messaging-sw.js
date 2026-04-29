// Scripts for firebase and firebase-messaging
importScripts('https://www.gstatic.com/firebasejs/12.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.8.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
firebase.initializeApp({
    apiKey: "AIzaSyBy34ZRWyZiaIAxl-GjqrMCMqg6ZgMR2CM",
    authDomain: "seeqme-94bb8.firebaseapp.com",
    databaseURL: "https://seeqme-94bb8-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "seeqme-94bb8",
    storageBucket: "seeqme-94bb8.firebasestorage.app",
    messagingSenderId: "703342269252",
    appId: "1:703342269252:web:7de8257e87691c24fa7d11"
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title || 'SeeqMe Update';
  const notificationOptions = {
    body: payload.notification.body || 'You have a new update in your mesh.',
    icon: '/seeqme-logo-black.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
