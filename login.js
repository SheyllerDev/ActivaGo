document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('loginButton');
    const errorMessage = document.getElementById('errorMessage');
    const loginForm = document.getElementById('loginForm');
    const welcomeSection = document.getElementById('welcomeSection');
    const welcomeMessage = document.getElementById('welcomeMessage');
    const goToAppButton = document.getElementById('goToAppButton');
    const loginTitle = document.getElementById('loginTitle');

    // Define authorized users
    const authorizedUsers = [
        { document: '72376375', name: 'ACEVEDO GONZALES CRISTINA EUGENIA' },
        { document: '71455467', name: 'ADRIANZEN REATEGUI KIARA JACOBA' },
        { document: '46062843', name: 'PRECIADO YACILA ADY MARILIA' },
        { document: '71426267', name: 'ALARCON CAMPOS GREYSS KELY' },
        { document: '43800554', name: 'ALBAN TORRES ANGELICA MARIA' },
        { document: '77088069', name: 'ALBERCA GARCIA LUIS ODILVER' },
        { document: '74227179', name: 'ALBORNOZ RAMOS EMILDA' },
        { document: '44110049', name: 'APOLAYA CÁCERES ALDO ANDRÉS' }
    ];

    loginButton.addEventListener('click', () => {
        const username = usernameInput.value;
        const password = passwordInput.value;

        // Find if the entered username (document) and password match any authorized user
        const foundUser = authorizedUsers.find(user => user.document === username && user.document === password);

        if (foundUser) {
            loginForm.style.display = 'none';
            loginTitle.textContent = '¡Bienvenido!';
            welcomeMessage.textContent = `Bienvenido(a), ${foundUser.name}!`;
            welcomeSection.style.display = 'block';
            errorMessage.textContent = '';
        } else {
            errorMessage.textContent = 'Usuario o contraseña incorrectos. Por favor, verifique sus credenciales.';
        }
    });

    goToAppButton.addEventListener('click', () => {
        // Redirect to your main application page
        // Assuming your main application page is index.html in the same directory
        window.location.href = 'index.html';
    });

    // Allow pressing Enter to log in
    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loginButton.click();
        }
    });

    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loginButton.click();
        }
    });
});