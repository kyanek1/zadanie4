// sw.js

// Zmieniona nazwa cache na nową wersję
const CACHE_NAME = 'pwa-dashboard-cache-v3';
const urlsToCache = [
    './', // Alias dla index.html
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    './images/icon-192x192.png', // Upewnij się, że masz ten plik
    './images/icon-512x512.png', // Upewnij się, że masz ten plik
    // Jeśli używałeś pliku sample.png i jest on osobną ikoną, dodaj go tutaj, np.:
    // './images/sample.png',
    './offline.html' // Nasza strona offline
];

// Instalacja Service Workera i cachowanie zasobów
self.addEventListener('install', function(event) {
    console.log('[SW] Instalacja, wersja cache:', CACHE_NAME);
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('[SW] Otwarto cache:', CACHE_NAME);
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('[SW] Wszystkie zasoby dodane do cache');
                return self.skipWaiting(); // Wymusza aktywację nowego SW natychmiast
            })
            .catch(error => {
                console.error('[SW] Błąd podczas cachowania zasobów w fazie install:', error);
            })
    );
});

// Aktywacja Service Workera i zarządzanie starymi cache'ami
self.addEventListener('activate', function(event) {
    console.log('[SW] Aktywacja, obecny cache:', CACHE_NAME);
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Usuwanie starego cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[SW] Stare cache usunięte, aktywowano nowy SW');
            return self.clients.claim(); // Przejmuje kontrolę nad otwartymi klientami natychmiast
        })
    );
});

// Przechwytywanie żądań sieciowych (strategia Cache First z fallbackiem do strony offline)
self.addEventListener('fetch', function(event) {
    console.log('[SW] Przechwycono żądanie:', event.request.url);

    // Chcemy obsługiwać tylko żądania GET dla strategii cachowania
    if (event.request.method !== 'GET') {
        console.log('[SW] Pomijam żądanie nie-GET:', event.request.method, event.request.url);
        // Dla żądań nie-GET, po prostu pozwalamy im przejść do sieci bez modyfikacji
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Jeśli zasób jest w cache, zwróć go
                if (response) {
                    console.log('[SW] Znaleziono w cache:', event.request.url);
                    return response;
                }

                // W przeciwnym razie, pobierz z sieci
                console.log('[SW] Nie znaleziono w cache, pobieranie z sieci:', event.request.url);
                return fetch(event.request)
                    .then(function(networkResponse) {
                        // Opcjonalnie: dynamiczne cachowanie nowych zasobów
                        return networkResponse;
                    })
                    .catch(function() { // Błąd pobierania z sieci (np. brak połączenia)
                        console.log('[SW] Błąd pobierania z sieci, próba zwrócenia strony offline dla:', event.request.url);
                        // Zwróć stronę offline tylko dla żądań nawigacyjnych (gdy użytkownik próbuje otworzyć stronę HTML)
                        if (event.request.mode === 'navigate') {
                            return caches.match('./offline.html');
                        }
                    });
            })
    );
});