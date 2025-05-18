// script.js

document.addEventListener('DOMContentLoaded', () => {
    const loginPage = document.getElementById('loginPage');
    const dashboard = document.getElementById('dashboard');
    const loginButton = document.getElementById('loginButton');
    const logoutButton = document.getElementById('logoutButton');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    const linkStronaGlowna = document.getElementById('linkStronaGlowna');
    const linkMojeKonto = document.getElementById('linkMojeKonto');
    const linkUstawienia = document.getElementById('linkUstawienia');
    const contentArea = document.getElementById('contentArea');

    // IndexedDB setup
    let db;
    const DB_NAME = 'PwaFormDataDB';
    const STORE_NAME = 'formDataStore';

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
                resolve(request.result); // Zwraca ID nowego obiektu
                loadAndDisplayData(); // Odśwież wyświetlane dane
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
            const request = store.getAll(); // Pobierz wszystkie obiekty

            request.onsuccess = () => {
                const dataListElement = document.getElementById('dataList');
                if (dataListElement) {
                    dataListElement.innerHTML = ''; // Wyczyść starą listę
                    const items = request.result;
                    if (items.length > 0) {
                        const ul = document.createElement('ul');
                        items.forEach(item => {
                            const li = document.createElement('li');
                            // Załóżmy, że obiekt 'item' ma pole 'textField' i 'dateField'
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
        if (activeLink) {
            activeLink.classList.add('active');
        }
    };

    const showLoginPage = () => {
        if (loginPage) loginPage.style.display = 'block';
        if (dashboard) dashboard.style.display = 'none';
    };

    const showDashboard = async (initialContent = true) => {
        if (loginPage) loginPage.style.display = 'none';
        if (dashboard) dashboard.style.display = 'block';
        
        // Inicjalizuj IndexedDB zaraz po pokazaniu dashboardu (lub wcześniej, jeśli potrzeba)
        try {
            await initDB(); // Upewnij się, że baza jest gotowa
        } catch (error) {
            console.error("Nie udało się zainicjować IndexedDB przy starcie dashboardu", error);
        }

        if (initialContent && contentArea) {
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
        if (db) { // Zamknij połączenie z bazą danych przy wylogowaniu
            // db.close(); // Choć przeglądarki zwykle dobrze sobie z tym radzą, można jawnie zamknąć.
            // console.log('[DB] Połączenie z IndexedDB zamknięte.');
        }
        showLoginPage();
    };

    if (linkStronaGlowna && contentArea) {
        linkStronaGlowna.addEventListener('click', (event) => {
            event.preventDefault();
            contentArea.innerHTML = '<h2>Witaj na pulpicie!</h2><p>Jesteś na stronie głównej dashboardu. Wybierz opcję z menu, aby zobaczyć więcej.</p>';
            updateActiveLink(linkStronaGlowna);
        });
    }

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
            loadAndDisplayData(); // Załaduj dane od razu po wyświetleniu widoku

            // Dodaj obsługę formularza po jego wstawieniu do DOM
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
                        timestamp: new Date().toISOString() // Zapiszmy też czas dodania
                    };
                    try {
                        await addDataToDB(dataObject);
                        document.getElementById('noteInput').value = ''; // Wyczyść pole po zapisie
                    } catch (error) {
                        alert('Nie udało się zapisać danych.');
                    }
                });
            }
        });
    }

    if (linkUstawienia && contentArea) {
        linkUstawienia.addEventListener('click', (event) => {
            event.preventDefault();
            contentArea.innerHTML = '<h2>Ustawienia</h2><p>W tym miejscu będziesz mógł zarządzać ustawieniami aplikacji.</p><p>Na przykład, wprowadzić klucz API lub wybrać preferencje.</p>';
            updateActiveLink(linkUstawienia);
        });
    }

    if (loginButton) {
        loginButton.addEventListener('click', login);
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }

    // Inicjalizacja
    if (isLoggedIn()) {
        showDashboard(true);
    } else {
        showLoginPage();
    }
});
