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

    const showLoginPage = () => {
        if (loginPage) loginPage.style.display = 'block';
        if (dashboard) dashboard.style.display = 'none';
    };

    const showDashboard = () => {
        if (loginPage) loginPage.style.display = 'none';
        if (dashboard) dashboard.style.display = 'block';
        // Po pokazaniu dashboardu, wyświetl domyślną treść "Strona główna"
        if (contentArea) {
            contentArea.innerHTML = '<p>Jesteś na stronie głównej dashboardu.</p>';
        }
    };

    const login = () => {
        if (usernameInput && passwordInput) {
            const username = usernameInput.value;
            const password = passwordInput.value;

            if (username === 'admin' && password === 'password') {
                localStorage.setItem('loggedInPWA', 'true');
                showDashboard();
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
            event.preventDefault(); // Zapobiegaj domyślnej akcji linku (#)
            contentArea.innerHTML = '<p>Jesteś na stronie głównej dashboardu.</p>';
            // Opcjonalnie: usuń klasę 'active' z innych linków i dodaj do tego
            document.querySelectorAll('nav ul li a').forEach(link => link.classList.remove('active'));
            linkStronaGlowna.classList.add('active');
        });
    }

    if (linkMojeKonto) {
        linkMojeKonto.addEventListener('click', (event) => {
            event.preventDefault();
            alert('Funkcja "Moje konto" nie jest jeszcze gotowa.');
            // Opcjonalnie: zarządzanie klasą 'active'
            document.querySelectorAll('nav ul li a').forEach(link => link.classList.remove('active'));
            linkMojeKonto.classList.add('active');
        });
    }

    if (linkUstawienia) {
        linkUstawienia.addEventListener('click', (event) => {
            event.preventDefault();
            alert('Funkcja "Ustawienia" nie jest jeszcze gotowa.');
            // Opcjonalnie: zarządzanie klasą 'active'
            document.querySelectorAll('nav ul li a').forEach(link => link.classList.remove('active'));
            linkUstawienia.classList.add('active');
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
        showDashboard();
        // Ustaw link "Strona główna" jako aktywny przy pierwszym załadowaniu dashboardu
        if (linkStronaGlowna) linkStronaGlowna.classList.add('active');
    } else {
        showLoginPage();
    }
});