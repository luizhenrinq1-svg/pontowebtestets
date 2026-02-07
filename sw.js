/**
 * Service Worker para PontoWeb - PWA e Firebase
 */
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCn89LRlH1lksZ811--jb2jlB2iZS5NH1s",
  authDomain: "pontoweb-dc8dd.firebaseapp.com",
  projectId: "pontoweb-dc8dd",
  storageBucket: "pontoweb-dc8dd.firebasestorage.app",
  messagingSenderId: "465750633035",
  appId: "1:465750633035:web:282efd14b807e2a3823bce"
};

// Inicializa Firebase no Service Worker
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// === LÓGICA DE BACKGROUND (Quando app está fechado) ===
messaging.onBackgroundMessage((payload) => {
  console.log('[sw.js] Recebeu mensagem em background: ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'https://cdn-icons-png.flaticon.com/512/2983/2983818.png',
    badge: 'https://cdn-icons-png.flaticon.com/512/2983/2983818.png',
    vibrate: [200, 100, 200, 100, 200], // Vibração padrão
    requireInteraction: true // Fica na tela até usuário interagir
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// === LÓGICA DE PWA (Cache Simples) ===
self.addEventListener('install', (event) => {
  console.log('SW Instalado');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('SW Ativado');
  event.waitUntil(self.clients.claim());
});

// Intercepta cliques na notificação para abrir o app
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({type: 'window'}).then( windowClients => {
      // Se já tiver aba aberta, foca nela
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // Se não, abre nova aba
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});


