importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const CACHE_NAME = 'pontoweb-v4-heavy-vibration';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdn.tailwindcss.com',
  'https://cdn-icons-png.flaticon.com/512/2983/2983818.png'
];

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCn89LRlH1lksZ811--jb2jlB2iZS5NH1s",
  authDomain: "pontoweb-dc8dd.firebaseapp.com",
  projectId: "pontoweb-dc8dd",
  storageBucket: "pontoweb-dc8dd.firebasestorage.app",
  messagingSenderId: "465750633035",
  appId: "1:465750633035:web:282efd14b807e2a3823bce"
};

try {
  if (typeof firebase !== 'undefined' && firebaseConfig.apiKey !== "SUA_API_KEY") {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    // Configuração para quando o app está FECHADO (Background)
    messaging.onBackgroundMessage((payload) => {
      console.log('Push recebido:', payload);
      
      const notificationTitle = payload.notification?.title || 'PontoWeb';
      const notificationOptions = {
        body: payload.notification?.body || 'Aviso de horário',
        icon: 'https://cdn-icons-png.flaticon.com/512/2983/2983818.png',
        
        // --- CONFIGURAÇÃO DE VIBRAÇÃO FORTE ---
        // Padrão: [Vibra 3s, Pausa 1s, Vibra 3s, Pausa 1s, Vibra 3s]
        vibrate: [3000, 1000, 3000, 1000, 3000], 
        renotify: true,           
        tag: 'pontoweb-alert',    
        requireInteraction: true, 
        silent: false             
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  }
} catch(e) { console.log('SW Firebase Init Error:', e); }

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE).catch(()=>{})));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keyList) => {
        return Promise.all(keyList.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        }));
      })
    ])
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).catch(() => {});
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({type: 'window', includeUncontrolled: true}).then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('./');
    })
  );
});
