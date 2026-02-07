/**
 * Service Worker para PontoWeb - PWA e Firebase
 * Versão: PWA Installable (Com Fetch Handler obrigatório)
 */
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCn89LRlH1lksZ811--jb2jlB2iZS5NH1s",
  authDomain: "pontoweb-dc8dd.firebaseapp.com",
  projectId: "pontoweb-dc8dd",
  storageBucket: "pontoweb-dc8dd.firebasestorage.app",
  messagingSenderId: "465750633035",
  appId: "1:465750633035:web:282efd14b807e2a3823bce"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// === 1. LÓGICA DE BACKGROUND (Notificações) ===
messaging.onBackgroundMessage((payload) => {
  console.log('[sw.js] Background:', payload);
  
  const title = payload.data?.title || "Nova Mensagem";
  const body = payload.data?.body || "";

  const notificationOptions = {
    body: body,
    icon: 'https://cdn-icons-png.flaticon.com/512/2983/2983818.png',
    badge: 'https://cdn-icons-png.flaticon.com/512/2983/2983818.png',
    vibrate: [500, 200, 500, 200, 500],
    requireInteraction: true,
    tag: 'ponto-notification',
    data: {
      url: 'https://luizhenrinq1-svg.github.io/pontowebtestets/' // Link absoluto para evitar erros
    }
  };

  return self.registration.showNotification(title, notificationOptions);
});

// === 2. CLIQUE NA NOTIFICAÇÃO ===
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || self.registration.scope;

  event.waitUntil(
    clients.matchAll({type: 'window', includeUncontrolled: true}).then( windowClients => {
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url.includes("pontowebtestets") && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// === 3. CRITÉRIOS OBRIGATÓRIOS PARA INSTALAÇÃO (PWA) ===

// OBRIGATÓRIO: O Chrome só permite instalar se houver um manipulador 'fetch'
self.addEventListener('fetch', (event) => {
  // Estratégia "Network Only" (passa direto para a internet)
  // Isso satisfaz o critério de PWA sem precisar cachear arquivos complexos agora
  event.respondWith(fetch(event.request));
});

self.addEventListener('install', (event) => {
  console.log('SW Instalado');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('SW Ativado');
  event.waitUntil(self.clients.claim());
});
