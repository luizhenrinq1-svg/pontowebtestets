importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const CACHE_NAME = 'pontoweb-v6-offline-master';
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

    messaging.onBackgroundMessage((payload) => {
      const data = payload.data || payload.notification;
      const notificationTitle = data?.title || 'PontoWeb';
      const notificationOptions = {
        body: data?.body || 'Aviso de horário',
        icon: 'https://cdn-icons-png.flaticon.com/512/2983/2983818.png',
        vibrate: [3000, 1000, 3000, 1000, 3000], 
        renotify: true,           
        tag: 'pontoweb-alert',    
        requireInteraction: true, 
        silent: false             
      };
      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  }
} catch(e) { console.log('SW Init Error:', e); }

// INSTALAÇÃO: Cacheia os arquivos essenciais
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(err => console.warn('Cache parcial:', err));
    })
  );
});

// ATIVAÇÃO: Limpa caches antigos
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

// FETCH: Estratégia Cache-First com Fallback para Rede
self.addEventListener('fetch', (event) => {
  // Ignora requisições POST (envio de dados) - deixa o app lidar
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Se tem no cache, retorna. Se não, tenta buscar na rede.
      return cachedResponse || fetch(event.request).catch(() => {
        // Se falhar a rede e não tiver no cache (ex: offline total tentando acessar algo novo)
        return null; 
      });
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
