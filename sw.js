/**
 * Service Worker para PontoWeb - PWA e Firebase
 * Versão: Data Message (Silenciosa para o Browser, Ativa para o SW)
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
  console.log('[sw.js] Mensagem recebida:', payload);
  
  // Tenta ler de 'data' (novo padrão) ou 'notification' (fallback)
  const title = payload.data?.title || payload.notification?.title || "Nova Mensagem";
  const body = payload.data?.body || payload.notification?.body || "";

  const notificationOptions = {
    body: body,
    icon: 'https://cdn-icons-png.flaticon.com/512/2983/2983818.png', // Ícone do App
    badge: 'https://cdn-icons-png.flaticon.com/512/2983/2983818.png', // Ícone pequeno na barra
    vibrate: [500, 200, 500, 200, 500], // Vibração Forte
    requireInteraction: true, // Fica na tela até o usuário clicar
    tag: 'ponto-notification', // Evita empilhamento excessivo
    data: {
      url: '/' // Para onde ir ao clicar
    }
  };

  return self.registration.showNotification(title, notificationOptions);
});

// === LÓGICA DE CLIQUE NA NOTIFICAÇÃO ===
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  // Foca na aba aberta ou abre uma nova
  event.waitUntil(
    clients.matchAll({type: 'window'}).then( windowClients => {
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// === LÓGICA DE PWA ===
self.addEventListener('install', (event) => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
