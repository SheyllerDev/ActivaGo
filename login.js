// Importar las funciones necesarias de los SDK de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

// --- CONFIGURACIÓN DE FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyC7esUXDazPJmGbbfDHIrLhgIxhQ8iEyM4",
    authDomain: "activago-bebad.firebaseapp.com",
    projectId: "activago-bebad",
    storageBucket: "activago-bebad.firebasestorage.app",
    messagingSenderId: "380945965051",
    appId: "1:380945965051:web:5215a89a82c60040b9755e"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// --- REFERENCIAS AL DOM ---
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('loginButton');
const errorMessage = document.getElementById('errorMessage');

// --- LÓGICA DE LOGIN DIRECTO ---
const handleLogin = () => {
    const dni = usernameInput.value.trim();
    const email = dni + '@sistema.com';
    const password = passwordInput.value;

    if (!dni || !password) {
        errorMessage.textContent = 'Por favor, ingrese DNI y contraseña.';
        return;
    }
    errorMessage.textContent = '';

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Autenticación exitosa, redirigir inmediatamente a la página principal
            window.location.href = 'index.html';
        })
        .catch((error) => {
            // Manejo de errores
            errorMessage.textContent = 'Usuario o contraseña incorrectos.';
        });
};

// Event listeners
loginButton.addEventListener('click', handleLogin);
passwordInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleLogin(); });
usernameInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleLogin(); });