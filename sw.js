// Importa as bibliotecas do Firebase para o Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const CACHE_NAME = 'pontoweb-unified-v2-firebase';
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

// Configuração do Firebase no Service Worker (Deve ser igual ao index.html)
const firebaseConfig = {
  apiKey: "AIzaSyCn89LRlH1lksZ811--jb2jlB2iZS5NH1s",
  authDomain: "pontoweb-dc8dd.firebaseapp.com",
  projectId: "pontoweb-dc8dd",
  storageBucket: "pontoweb-dc8dd.firebasestorage.app",
  messagingSenderId: "465750633035",
  appId: "1:465750633035:web:282efd14b807e2a3823bce"
};

// Inicializa Firebase no SW se configurado
try {
  // Verifica se a biblioteca carregou antes de usar
  if (typeof firebase !== 'undefined' && firebaseConfig.apiKey !== "SUA_API_KEY") {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    // Manipula mensagens quando o app está FECHADO ou em SEGUNDO PLANO
    messaging.onBackgroundMessage((payload) => {
      console.log('Mensagem em background recebida: ', payload);
      
      // Personaliza a notificação com base no payload recebido
      const notificationTitle = payload.notification?.title || 'PontoWeb';
      const notificationOptions = {
        body: payload.notification?.body || 'Nova mensagem',
        icon: 'https://cdn-icons-png.flaticon.com/512/2983/2983818.png', // Ícone fixo para garantir visualização
        vibrate: [200, 100, 200]
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  }
} catch(e) { console.log('Erro ao inicializar Firebase no SW (pode ser offline):', e); }

// --- CACHE E OFFLINE (Versão Robusta) ---

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Tenta cachear, mas não falha a instalação se um arquivo der erro (ex: 404)
        return cache.addAll(ASSETS_TO_CACHE).catch(err => {
           console.warn('Aviso: Alguns arquivos não foram cacheados, mas o SW continuará.', err);
        });
      })
  );
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
      return cachedResponse || fetch(event.request).catch(() => {
         // Fallback opcional para quando estiver offline e sem cache
         // return caches.match('./offline.html');
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
