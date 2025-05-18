// script.js

document.addEventListener('DOMContentLoaded', () => {
    const loginPage = document.getElementById('loginPage');
    const dashboard = document.getElementById('dashboard');
    const loginButton = document.getElementById('loginButton');
    const logoutButton = document.getElementById('logoutButton');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    // Elementy nawigacji
    const linkStronaGlowna = document.getElementById('linkStronaGlowna');
    const linkMojeKonto = document.getElementById('linkMojeKonto');
    const linkUstawienia = document.getElementById('linkUstawienia');
    const contentArea = document.getElementById('contentArea'); // Nasz obszar na treść

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

    const showDashboard = (initialContent = true) => {
        if (loginPage) loginPage.style.display = 'none';
        if (dashboard) dashboard.style.display = 'block';
        
        if (initialContent && contentArea) { // Wyświetl domyślną treść tylko przy pierwszym załadowaniu dashboardu
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
                showDashboard(true); // Pokaż dashboard z domyślną treścią
            } else {
                alert('Nieprawidłowa nazwa użytkownika lub hasło.');
            }
        } else {
            console.error('Nie znaleziono pól logowania.');
        }
    };

    const logout = () => {
        localStorage.removeItem('loggedInPWA');
        if (contentArea) { // Wyczyść obszar treści po wylogowaniu
            contentArea.innerHTML = '';
        }
        showLoginPage();
    };

    // Obsługa kliknięć w nawigacji
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
            contentArea.innerHTML = '<h2>Moje Konto</h2><p>Tutaj w przyszłości pojawi się formularz i dane zapisane w IndexedDB.</p><p>Na razie to tylko przykładowa treść dla tej sekcji.</p>';
            updateActiveLink(linkMojeKonto);
        });
    }

    if (linkUstawienia && contentArea) {
        linkUstawienia.addEventListener('click', (event) => {
            event.preventDefault();
            contentArea.innerHTML = '<h2>Ustawienia</h2><p>W tym miejscu będziesz mógł zarządzać ustawieniami aplikacji.</p><p>Na przykład, wprowadzić klucz API lub wybrać preferencje.</p>';
            updateActiveLink(linkUstawienia);
        });
    }

    // Inicjalizacja przycisków logowania/wylogowania
    if (loginButton) {
        loginButton.addEventListener('click', login);
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }

    // Sprawdź stan zalogowania przy załadowaniu strony
    if (isLoggedIn()) {
        showDashboard(true); // Pokaż dashboard z domyślną treścią "Strona główna"
    } else {
        showLoginPage();
    }
});
