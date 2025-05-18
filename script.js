// script.js

document.addEventListener('DOMContentLoaded', () => {
    const loginPage = document.getElementById('loginPage');
    const dashboard = document.getElementById('dashboard');
    const loginButton = document.getElementById('loginButton');
    const logoutButton = document.getElementById('logoutButton');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    const navLinksContainer = document.querySelector('nav ul'); // Kontener na linki nawigacyjne
    let linkStronaGlowna = document.getElementById('linkStronaGlowna');
    let linkMojeKonto = document.getElementById('linkMojeKonto');
    let linkUstawienia = document.getElementById('linkUstawienia');
    // Dodamy link Pogoda dynamicznie, jeśli jeszcze go nie ma
    let linkPogoda = document.getElementById('linkPogoda');


    const contentArea = document.getElementById('contentArea');

    // IndexedDB setup
    let db;
    const DB_NAME = 'PwaFormDataDB';
    const STORE_NAME = 'formDataStore';

    // localStorage key for API Key
    const API_KEY_STORAGE_KEY = 'openWeatherApiKey';

    function initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, 1);

            request.onupgradeneeded = (event) => {
                db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                }
                console.log('[DB] Aktualizacja zakończona (onupgradeneeded)');
            };

            request.onsuccess = (event) => {
                db = event.target.result;
                console.log('[DB] Połączenie z IndexedDB udane');
                resolve(db);
            };

            request.onerror = (event) => {
                console.error('[DB] Błąd połączenia z IndexedDB:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    async function addDataToDB(data) {
        if (!db) {
            console.error('[DB] Baza danych nie jest zainicjowana.');
            return;
        }
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.add(data);

            request.onsuccess = () => {
                console.log('[DB] Dane dodane do IndexedDB', data);
                resolve(request.result);
                loadAndDisplayData();
            };

            request.onerror = (event) => {
                console.error('[DB] Błąd podczas dodawania danych:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    async function loadAndDisplayData() {
        if (!db) {
            console.error('[DB] Baza danych nie jest zainicjowana.');
            return;
        }
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                const dataListElement = document.getElementById('dataList');
                if (dataListElement) {
                    dataListElement.innerHTML = '';
                    const items = request.result;
                    if (items.length > 0) {
                        const ul = document.createElement('ul');
                        items.forEach(item => {
                            const li = document.createElement('li');
                            li.textContent = `Notatka: ${item.noteText}, Data: ${new Date(item.timestamp).toLocaleString('pl-PL')}`;
                            ul.appendChild(li);
                        });
                        dataListElement.appendChild(ul);
                    } else {
                        dataListElement.innerHTML = '<p>Brak zapisanych danych.</p>';
                    }
                }
                resolve(items);
            };

            request.onerror = (event) => {
                console.error('[DB] Błąd podczas odczytu danych:', event.target.error);
                const dataListElement = document.getElementById('dataList');
                if (dataListElement) {
                    dataListElement.innerHTML = '<p>Błąd podczas ładowania danych.</p>';
                }
                reject(event.target.error);
            };
        });
    }

    const isLoggedIn = () => {
        return localStorage.getItem('loggedInPWA') === 'true';
    };

    const updateActiveLink = (activeLink) => {
        document.querySelectorAll('nav ul li a').forEach(link => link.classList.remove('active'));
        if (activeLink && activeLink.classList) { // Upewnij się, że activeLink jest elementem DOM
            activeLink.classList.add('active');
        }
    };

    const showLoginPage = () => {
        if (loginPage) loginPage.style.display = 'block';
        if (dashboard) dashboard.style.display = 'none';
    };
    
    // Funkcja do dynamicznego tworzenia linków w nawigacji, jeśli ich brakuje
    function ensureNavLinks() {
        if (!linkStronaGlowna) {
            const li = document.createElement('li');
            li.innerHTML = `<a href="#" id="linkStronaGlowna">Strona główna</a>`;
            navLinksContainer.appendChild(li);
            linkStronaGlowna = document.getElementById('linkStronaGlowna');
            attachStronaGlownaListener();
        }
        if (!linkMojeKonto) {
            const li = document.createElement('li');
            li.innerHTML = `<a href="#" id="linkMojeKonto">Moje konto</a>`;
            navLinksContainer.appendChild(li);
            linkMojeKonto = document.getElementById('linkMojeKonto');
            attachMojeKontoListener();
        }
        if (!linkUstawienia) {
            const li = document.createElement('li');
            li.innerHTML = `<a href="#" id="linkUstawienia">Ustawienia</a>`;
            navLinksContainer.appendChild(li);
            linkUstawienia = document.getElementById('linkUstawienia');
            attachUstawieniaListener();
        }
        // Dodajemy link "Pogoda", jeśli go nie ma
        if (!linkPogoda && navLinksContainer) {
            const liPogoda = document.createElement('li');
            liPogoda.innerHTML = `<a href="#" id="linkPogoda">Pogoda</a>`;
            navLinksContainer.appendChild(liPogoda);
            linkPogoda = document.getElementById('linkPogoda');
            attachPogodaListener(); // Funkcję dodamy później
        }
    }


    const showDashboard = async (initialContent = true) => {
        if (loginPage) loginPage.style.display = 'none';
        if (dashboard) dashboard.style.display = 'block';
        
        ensureNavLinks(); // Upewnij się, że wszystkie linki nawigacyjne istnieją

        try {
            await initDB();
        } catch (error) {
            console.error("Nie udało się zainicjować IndexedDB przy starcie dashboardu", error);
        }

        if (initialContent && contentArea && linkStronaGlowna) {
            contentArea.innerHTML = '<h2>Witaj na pulpicie!</h2><p>Jesteś na stronie głównej dashboardu. Wybierz opcję z menu, aby zobaczyć więcej.</p>';
            updateActiveLink(linkStronaGlowna);
        }
    };

    const login = () => {
        if (usernameInput && passwordInput) {
            const username = usernameInput.value;
            const password = passwordInput.value;

            if (username === 'admin' && password === 'password') {
                localStorage.setItem('loggedInPWA', 'true');
                showDashboard(true);
            } else {
                alert('Nieprawidłowa nazwa użytkownika lub hasło.');
            }
        } else {
            console.error('Nie znaleziono pól logowania.');
        }
    };

    const logout = () => {
        localStorage.removeItem('loggedInPWA');
        if (contentArea) {
            contentArea.innerHTML = '';
        }
        showLoginPage();
    };

    function attachStronaGlownaListener() {
        if (linkStronaGlowna && contentArea) {
            linkStronaGlowna.addEventListener('click', (event) => {
                event.preventDefault();
                contentArea.innerHTML = '<h2>Witaj na pulpicie!</h2><p>Jesteś na stronie głównej dashboardu. Wybierz opcję z menu, aby zobaczyć więcej.</p>';
                updateActiveLink(linkStronaGlowna);
            });
        }
    }

    function attachMojeKontoListener() {
        if (linkMojeKonto && contentArea) {
            linkMojeKonto.addEventListener('click', (event) => {
                event.preventDefault();
                contentArea.innerHTML = `
                    <h2>Moje Konto - Zapisane Dane</h2>
                    <form id="dataForm">
                        <div>
                            <label for="noteInput">Twoja notatka:</label>
                            <input type="text" id="noteInput" name="noteInput" required>
                        </div>
                        <button type="submit">Zapisz dane</button>
                    </form>
                    <h3>Zapisane wpisy:</h3>
                    <div id="dataList">
                        <p>Ładowanie danych...</p>
                    </div>
                `;
                updateActiveLink(linkMojeKonto);
                loadAndDisplayData();

                const dataForm = document.getElementById('dataForm');
                if (dataForm) {
                    dataForm.addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const noteText = document.getElementById('noteInput').value;
                        if (noteText.trim() === '') {
                            alert('Notatka nie może być pusta!');
                            return;
                        }
                        const dataObject = {
                            noteText: noteText,
                            timestamp: new Date().toISOString()
                        };
                        try {
                            await addDataToDB(dataObject);
                            document.getElementById('noteInput').value = '';
                        } catch (error) {
                            alert('Nie udało się zapisać danych.');
                        }
                    });
                }
            });
        }
    }
    
    function attachUstawieniaListener() {
        if (linkUstawienia && contentArea) {
            linkUstawienia.addEventListener('click', (event) => {
                event.preventDefault();
                const currentApiKey = localStorage.getItem(API_KEY_STORAGE_KEY) || '';
                contentArea.innerHTML = `
                    <h2>Ustawienia</h2>
                    <p>W tym miejscu będziesz mógł zarządzać ustawieniami aplikacji.</p>
                    <form id="settingsForm">
                        <div>
                            <label for="apiKeyInput">Klucz API (OpenWeatherMap):</label>
                            <input type="text" id="apiKeyInput" name="apiKeyInput" value="${currentApiKey}" style="width: 300px;">
                        </div>
                        <button type="submit">Zapisz klucz API</button>
                    </form>
                    <p id="apiKeyMessage" style="margin-top: 10px;"></p>
                `;
                updateActiveLink(linkUstawienia);
    
                const settingsForm = document.getElementById('settingsForm');
                if (settingsForm) {
                    settingsForm.addEventListener('submit', (e) => {
                        e.preventDefault();
                        const apiKey = document.getElementById('apiKeyInput').value;
                        localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
                        const apiKeyMessage = document.getElementById('apiKeyMessage');
                        if (apiKeyMessage) {
                            apiKeyMessage.textContent = 'Klucz API został zapisany!';
                            apiKeyMessage.style.color = 'green';
                            setTimeout(() => { apiKeyMessage.textContent = ''; }, 3000);
                        }
                        console.log('Zapisano klucz API:', apiKey);
                    });
                }
            });
        }
    }

    // Placeholder dla listenera "Pogoda" - dodamy logikę później
    function attachPogodaListener() {
        if (linkPogoda && contentArea) {
            linkPogoda.addEventListener('click', (event) => {
                event.preventDefault();
                contentArea.innerHTML = `
                    <h2>Pogoda</h2>
                    <p>Tutaj wkrótce pojawi się możliwość sprawdzenia pogody.</p>
                    <div>
                        <label for="cityInput">Wpisz miasto:</label>
                        <input type="text" id="cityInput" name="cityInput">
                        <button id="getWeatherButton">Pokaż pogodę</button>
                    </div>
                    <div id="weatherResult" style="margin-top: 20px;">
                        </div>
                `;
                updateActiveLink(linkPogoda);
                // Logikę pobierania pogody dodamy w następnym kroku
                const getWeatherButton = document.getElementById('getWeatherButton');
                if(getWeatherButton) {
                    getWeatherButton.addEventListener('click', () => {
                        // Tutaj będzie wywołanie funkcji pobierającej pogodę
                        alert('Funkcja pobierania pogody nie jest jeszcze zaimplementowana.');
                    });
                }
            });
        }
    }


    // Inicjalizacja przycisków logowania/wylogowania i listenerów
    if (loginButton) {
        loginButton.addEventListener('click', login);
    }
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }

    // Inicjalizacja
    if (isLoggedIn()) {
        showDashboard(true); // Pokaż dashboard z domyślną treścią "Strona główna"
    } else {
        showLoginPage();
    }
    
    // Dodajemy listenery do istniejących linków przy pierwszym załadowaniu
    // ensureNavLinks() jest już wywoływane w showDashboard, co powinno wystarczyć
    // ale dla pewności można je też wywołać tutaj, jeśli linki są statycznie w HTML
    attachStronaGlownaListener();
    attachMojeKontoListener();
    attachUstawieniaListener();
    // attachPogodaListener(); // Wywołanie tego listenera jest już w ensureNavLinks, które jest w showDashboard

});
