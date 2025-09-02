// Importar las funciones necesarias de los SDK de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

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

// --- VERIFICACIÓN DE SESIÓN ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        initializeAppLogic(user); 
    } else {
        window.location.href = 'login.html';
    }
});

// --- LÓGICA PRINCIPAL DE LA APLICACIÓN ---
function initializeAppLogic(currentUser) {
    
    // LÓGICA PARA CERRAR SESIÓN Y MOSTRAR USUARIO
    const logoutButton = document.getElementById('logoutButton');
    const userNameDisplay = document.getElementById('userNameDisplay');
    
    userNameDisplay.textContent = currentUser.email.split('@')[0];

    logoutButton.addEventListener('click', () => {
        signOut(auth).catch((error) => console.error('Error al cerrar sesión:', error));
    });
    
    // --- TEMPORIZADOR DE INACTIVIDAD (10 MINUTOS) ---
    const INACTIVITY_TIMEOUT = 10 * 60 * 1000;
    let timeoutId;

    const logoutDueToInactivity = () => {
        signOut(auth).then(() => {
            alert("Su sesión ha expirado por inactividad.");
        }).catch((error) => {
            console.error('Error al cerrar sesión por inactividad:', error);
        });
    };

    const resetTimeout = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(logoutDueToInactivity, INACTIVITY_TIMEOUT);
    };

    document.addEventListener('mousemove', resetTimeout);
    document.addEventListener('keypress', resetTimeout);
    document.addEventListener('click', resetTimeout);
    document.addEventListener('scroll', resetTimeout);
    
    resetTimeout();


    // --- INICIO DEL CÓDIGO ORIGINAL DE LA APLICACIÓN ---
    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const asignacionesCicloFecha = {
        1: 4, 2: 4, 3: 4, 4: 4, 5: 4, 6: 4, 7: 4, 8: 4, 9: 3, 10: 3, 11: 3, 12: 3, 13: 3, 14: 3, 15: 3,
        16: 5, 17: 5, 18: 5, 19: 5, 20: 5, 21: 5, 22: 5, 23: 1, 24: 1, 25: 1, 26: 1, 27: 1, 28: 1, 29: 1, 30: 1, 31: 1
    };

    const datosCiclos = {
        1: { diaInicioCiclo: 1, diaEmision: 31, diaVencimiento: 16 },
        3: { diaInicioCiclo: 16, diaEmision: 15, diaVencimiento: 2 },
        5: { diaInicioCiclo: 23, diaEmision: 22, diaVencimiento: 7 },
        4: { diaInicioCiclo: 9, diaEmision: 8, diaVencimiento: 24 }
    };

    const planTarifarioSelect = document.getElementById('planTarifario');
    const mesSeleccionado = document.getElementById('mesSeleccionado');
    const diasDelMesElement = document.getElementById('diasDelMes');
    const fechaActivacionInput = document.getElementById('fechaActivacion');
    const fechaActivacionError = document.getElementById('fechaActivacionError');
    const lineasActivasSelect = document.getElementById('lineasActivas');
    const tituloCicloFactElement = document.getElementById('tituloCicloFact');
    const cicloResultadoElement = document.getElementById('cicloResultado');
    const cicloFactSelect = document.getElementById('cicloFact');
    const fechaInicioElement = document.getElementById('fechaInicio');
    const fechaFinElement = document.getElementById('fechaFin');
    const fechaEmisionElement = document.getElementById('fechaEmision');
    const fechaVencimientoElement = document.getElementById('fechaVencimiento');
    const diasProrrateoElement = document.getElementById('diasProrrateo');
    const proporcionalPagarElement = document.getElementById('proporcionalPagar');
    const mensajeTextoElement = document.getElementById('mensajeTexto');

    function getDaysInMonth(year, monthIndex) { return new Date(year, monthIndex + 1, 0).getDate(); }
    function formatDayMonth(day, monthIndex) { return `${day} de ${meses[monthIndex]}`; }
    function populateMeses() {
        mesSeleccionado.innerHTML = '<option value="" disabled selected hidden>Seleccione un mes</option>';
        meses.forEach((mes, index) => {
            const option = document.createElement('option');
            option.value = index + 1;
            option.textContent = mes;
            mesSeleccionado.appendChild(option);
        });
    }
    function updateDiasDelMes() {
        const selectedMonthIndex = parseInt(mesSeleccionado.value) - 1;
        if (!isNaN(selectedMonthIndex)) {
            const dias = getDaysInMonth(new Date().getFullYear(), selectedMonthIndex);
            diasDelMesElement.textContent = `El mes de ${meses[selectedMonthIndex]} tiene ${dias} días.`;
        } else {
            diasDelMesElement.textContent = "";
        }
    }
    function toggleCicloFact() {
        const clienteActivo = lineasActivasSelect.value === 'SI';
        cicloFactSelect.disabled = !clienteActivo;
        if (!clienteActivo) cicloFactSelect.value = "";
    }
    function updateAllCalculations() {
        const planTarifario = parseFloat(planTarifarioSelect.value);
        const selectedMonthIndex = parseInt(mesSeleccionado.value) - 1;
        const fechaActivacion = parseInt(fechaActivacionInput.value);
        const clienteActivo = lineasActivasSelect.value === 'SI';
        const currentYear = new Date().getFullYear();
        
        const defaultResultText = "-";

        const showDefaultResults = (message = defaultResultText) => {
            cicloResultadoElement.textContent = message;
            fechaInicioElement.textContent = message;
            fechaFinElement.textContent = message;
            fechaEmisionElement.textContent = message;
            fechaVencimientoElement.textContent = message;
            diasProrrateoElement.textContent = message;
            proporcionalPagarElement.textContent = 'S/ ' + message;
            mensajeTextoElement.textContent = "Complete todos los campos para generar el mensaje.";
        };
        const maxDaysInMonth = !isNaN(selectedMonthIndex) ? getDaysInMonth(currentYear, selectedMonthIndex) : 31;
        if (fechaActivacion > maxDaysInMonth) {
             fechaActivacionError.textContent = `Día inválido para ${meses[selectedMonthIndex]}.`;
        } else {
             fechaActivacionError.textContent = '';
        }
        if (isNaN(planTarifario) || isNaN(selectedMonthIndex) || isNaN(fechaActivacion) || fechaActivacionError.textContent !== "" || (clienteActivo && !cicloFactSelect.value)) {
            showDefaultResults();
            return;
        }
        let cicloDeterminante;
        if (clienteActivo) {
            tituloCicloFactElement.textContent = "CICLO DE FACTURACIÓN ANTERIOR";
            cicloDeterminante = parseInt(cicloFactSelect.value);
        } else {
            tituloCicloFactElement.textContent = "CICLO DE FACTURACIÓN A ASIGNAR";
            cicloDeterminante = asignacionesCicloFecha[fechaActivacion];
        }
        cicloResultadoElement.textContent = cicloDeterminante || '-';
        if (!cicloDeterminante || !datosCiclos[cicloDeterminante]) {
            showDefaultResults('Ciclo no válido');
            return;
        }
        const cicloInfo = datosCiclos[cicloDeterminante];
        const fechaActivacionDate = new Date(currentYear, selectedMonthIndex, fechaActivacion);
        let anoInicioCiclo = currentYear;
        let mesInicioCiclo = selectedMonthIndex;
        if (fechaActivacion < cicloInfo.diaInicioCiclo && cicloDeterminante !== 1) {
            mesInicioCiclo = (selectedMonthIndex === 0) ? 11 : selectedMonthIndex - 1;
            if (selectedMonthIndex === 0) anoInicioCiclo--;
        }
        const fechaInicioCicloActual = new Date(anoInicioCiclo, mesInicioCiclo, cicloInfo.diaInicioCiclo);
        let fechaFinCicloActual = new Date(fechaInicioCicloActual);
        fechaFinCicloActual.setMonth(fechaFinCicloActual.getMonth() + 1);
        fechaFinCicloActual.setDate(fechaFinCicloActual.getDate() - 1);
        if (cicloDeterminante === 1) {
            fechaFinCicloActual = new Date(anoInicioCiclo, mesInicioCiclo, getDaysInMonth(anoInicioCiclo, mesInicioCiclo));
        }
        const fechaEmision = new Date(fechaFinCicloActual.getFullYear(), fechaFinCicloActual.getMonth(), cicloInfo.diaEmision);
        let anoVencimiento = fechaEmision.getFullYear();
        let mesVencimiento = (cicloDeterminante === 4) ? fechaEmision.getMonth() : fechaEmision.getMonth() + 1;
        if (mesVencimiento > 11) {
            mesVencimiento = 0;
            anoVencimiento++;
        }
        const fechaVencimiento = new Date(anoVencimiento, mesVencimiento, cicloInfo.diaVencimiento);
        fechaInicioElement.textContent = formatDayMonth(fechaInicioCicloActual.getDate(), fechaInicioCicloActual.getMonth());
        fechaFinElement.textContent = formatDayMonth(fechaFinCicloActual.getDate(), fechaFinCicloActual.getMonth());
        fechaEmisionElement.textContent = formatDayMonth(fechaEmision.getDate(), fechaEmision.getMonth());
        fechaVencimientoElement.textContent = formatDayMonth(fechaVencimiento.getDate(), fechaVencimiento.getMonth());
        const diffTime = fechaFinCicloActual - fechaActivacionDate;
        const diasProrrateoCalculados = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
        diasProrrateoElement.textContent = diasProrrateoCalculados;
        const diasBaseDivision = selectedMonthIndex === 1 ? getDaysInMonth(currentYear, selectedMonthIndex) : 30;
        const proporcionalPagar = (planTarifario / diasBaseDivision) * diasProrrateoCalculados;
        proporcionalPagarElement.textContent = 'S/ ' + proporcionalPagar.toFixed(2);
        let nextCycleStartDate = new Date(fechaFinCicloActual);
        nextCycleStartDate.setDate(nextCycleStartDate.getDate() + 1);
        let nextCycleEndDate = new Date(nextCycleStartDate);
        nextCycleEndDate.setMonth(nextCycleEndDate.getMonth() + 1);
        nextCycleEndDate.setDate(nextCycleEndDate.getDate() - 1);
        if (cicloDeterminante === 1) {
             nextCycleEndDate = new Date(nextCycleStartDate.getFullYear(), nextCycleStartDate.getMonth(), getDaysInMonth(nextCycleStartDate.getFullYear(), nextCycleStartDate.getMonth()));
        }
        mensajeTextoElement.innerHTML = `Estimado, para comentarle que en esta oportunidad Entel le estará activando su linea el día <strong>${formatDayMonth(fechaActivacionDate.getDate(), fechaActivacionDate.getMonth())}</strong>. La fecha regular de inicio de saldo es <strong>${formatDayMonth(nextCycleStartDate.getDate(), nextCycleStartDate.getMonth())}</strong>. Para que usted se mantenga conectado tendrá <strong>${diasProrrateoCalculados}</strong> días de prorrateo Con un costo de <strong>S/ ${proporcionalPagar.toFixed(2)}</strong> aproximadamente solo por este 1er mes. Además comentarle que su fecha de pago es el <strong>${formatDayMonth(fechaVencimiento.getDate(), fechaVencimiento.getMonth())}</strong>. Este pago le asegura saldo hasta la fecha <strong>${formatDayMonth(nextCycleEndDate.getDate(), nextCycleEndDate.getMonth())}</strong>.`;
    }
    // Event listeners
    [planTarifarioSelect, mesSeleccionado, lineasActivasSelect, cicloFactSelect].forEach(el => el.addEventListener('change', updateAllCalculations));
    fechaActivacionInput.addEventListener('input', updateAllCalculations);
    mesSeleccionado.addEventListener('change', updateDiasDelMes);
    lineasActivasSelect.addEventListener('change', toggleCicloFact);
    // Inicializar la app
    populateMeses();
    toggleCicloFact();
    updateAllCalculations();
}