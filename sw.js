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
// ⚠️ PREENCHA AQUI TAMBÉM
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
};

// Inicializa Firebase no SW se configurado
try {
  if (firebaseConfig.apiKey !== "SUA_API_KEY") {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    // Manipula mensagens quando o app está FECHADO ou em SEGUNDO PLANO
    messaging.onBackgroundMessage((payload) => {
      console.log('Mensagem em background recebida: ', payload);
      const notificationTitle = payload.notification.title;
      const notificationOptions = {
        body: payload.notification.body,
        icon: './icon.png' // Certifique-se de ter um ícone
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  }
} catch(e) { console.log('Firebase SW config pendente'); }

// --- CACHE E OFFLINE (Padrão) ---

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)));
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
      return cachedResponse || fetch(event.request);
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
