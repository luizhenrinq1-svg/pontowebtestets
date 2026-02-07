/**
 * Service Worker para PontoWeb - PWA e Firebase
 * Versão: Correção de Link (Abre o App correto ao clicar)
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

// === LÓGICA DE BACKGROUND ===
messaging.onBackgroundMessage((payload) => {
  console.log('[sw.js] Mensagem recebida:', payload);
  
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
      url: 'https://luizhenrinq1-svg.github.io/pontowebtestets/' // Link absoluto do App
    }
  };

  return self.registration.showNotification(title, notificationOptions);
});

// === LÓGICA DE CLIQUE NA NOTIFICAÇÃO (CORRIGIDA) ===
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  // Define a URL correta (usa o que veio na notificação ou o link fixo)
  const urlToOpen = event.notification.data?.url || 'https://luizhenrinq1-svg.github.io/pontowebtestets/';

  event.waitUntil(
    clients.matchAll({type: 'window', includeUncontrolled: true}).then( windowClients => {
      // 1. Tenta encontrar uma aba que já esteja no App
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        // Verifica se a URL da aba corresponde ao App (procura por parte do link)
        if (client.url.includes("pontowebtestets") && 'focus' in client) {
          return client.focus();
        }
      }
      // 2. Se não achou, abre nova janela no link correto
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// === PWA ===
self.addEventListener('install', (event) => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
