document.addEventListener('DOMContentLoaded', () => {
    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    // Asignaciones de ciclo por fecha de activación
    const asignacionesCicloFecha = {
        1: 4, 2: 4, 3: 4, 4: 4, 5: 4, 6: 4, 7: 4, 8: 4,
        9: 3, 10: 3, 11: 3, 12: 3, 13: 3, 14: 3, 15: 3,
        16: 5, 17: 5, 18: 5, 19: 5, 20: 5, 21: 5, 22: 5,
        23: 1, 24: 1, 25: 1, 26: 1, 27: 1, 28: 1, 29: 1, 30: 1, 31: 1
    };

    // TABLA DE EMISIÓN Y VENCIMIENTO para cada ciclo
    const datosCiclos = {
        1: { // Ciclo 1: del 1 al 31 del mismo mes
            diaInicioCiclo: 1,
            diaEmision: 31, // Always last day of month for full cycle.
            diaVencimiento: 16
        },
        3: { // Ciclo 3: del 16 al 15 del siguiente mes
            diaInicioCiclo: 16,
            diaEmision: 15,
            diaVencimiento: 2
        },
        5: { // Ciclo 5: del 23 al 22 del siguiente mes
            diaInicioCiclo: 23,
            diaEmision: 22,
            diaVencimiento: 7
        },
        4: { // Ciclo 4: del 9 al 8 del siguiente mes
            diaInicioCiclo: 9,
            diaEmision: 8,
            diaVencimiento: 24
        }
    };

    // Referencias a los elementos del DOM
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

    // --- TIMEOUT LÓGICA ---
    const INACTIVITY_TIMEOUT = 2 * 60 * 1000; // 5 minutos en milisegundos
    let timeoutId;

    function startTimeout() {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            alert('Su sesión ha expirado debido a inactividad.');
            window.location.href = 'login.html'; // Redirigir a la página de login
        }, INACTIVITY_TIMEOUT);
    }

    function resetTimeout() {
        startTimeout();
    }

    // Eventos para reiniciar el contador de inactividad
    document.addEventListener('mousemove', resetTimeout);
    document.addEventListener('keypress', resetTimeout);
    document.addEventListener('click', resetTimeout);
    document.addEventListener('scroll', resetTimeout); // Considera si quieres que el scroll reinicie el timeout


    // Iniciar el contador al cargar la página
    startTimeout();


    // --- FUNCIONES AUXILIARES DE FECHAS ---
    function getDaysInMonth(year, monthIndex) {
        return new Date(year, monthIndex + 1, 0).getDate();
    }

    function formatDayMonth(day, monthIndex) {
        return `${day} de ${meses[monthIndex]}`;
    }

    // --- Lógica del 2do desplegable (Meses y Días) ---

    function populateMeses() {
        mesSeleccionado.innerHTML = '';

        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.textContent = "Seleccione un mes";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        defaultOption.hidden = true;
        mesSeleccionado.appendChild(defaultOption);

        meses.forEach((mes, index) => {
            const option = document.createElement('option');
            option.value = index + 1; // 1-12
            option.textContent = mes;
            mesSeleccionado.appendChild(option);
        });
    }
    populateMeses();

    function updateDiasDelMes() {
        const selectedMonthIndex = parseInt(mesSeleccionado.value) - 1;
        const currentYear = new Date().getFullYear();

        if (isNaN(selectedMonthIndex) || mesSeleccionado.value === "") {
            diasDelMesElement.textContent = "";
        } else {
            const dias = getDaysInMonth(currentYear, selectedMonthIndex);
            diasDelMesElement.textContent = `El mes de ${meses[selectedMonthIndex]} tiene ${dias} días.`;
        }
    }

    mesSeleccionado.addEventListener('change', () => {
        updateDiasDelMes();
        updateAllCalculations();
    });
    updateDiasDelMes();

    // --- Lógica del Textbox (Fecha de activación) ---

    fechaActivacionInput.addEventListener('input', (event) => {
        const value = parseInt(event.target.value);
        fechaActivacionError.textContent = '';

        const selectedMonthIndex = parseInt(mesSeleccionado.value) - 1;
        const currentYear = new Date().getFullYear();
        const maxDays = (!isNaN(selectedMonthIndex) && mesSeleccionado.value !== "") ? getDaysInMonth(currentYear, selectedMonthIndex) : 31;

        if (event.target.value === "") {
            fechaActivacionError.textContent = "";
        } else if (isNaN(value) || value < 1 || value > 31) {
            fechaActivacionError.textContent = "Dato inválido: Ingrese un número entre 1 y 31.";
        } else if (value > maxDays) {
            fechaActivacionError.textContent = `El día ${value} no existe en ${meses[selectedMonthIndex]}. El mes tiene ${maxDays} días.`;
        } else {
            if (String(value).length > 2) {
                event.target.value = String(value).substring(0, 2);
            }
        }
        updateAllCalculations();
    });

    // --- Lógica de los desplegables de Ciclo y Líneas Activas ---

    function toggleCicloFact() {
        const clienteActivo = lineasActivasSelect.value === 'SI';
        cicloFactSelect.disabled = !clienteActivo;

        if (!clienteActivo) {
            cicloFactSelect.value = "";
        }
    }

    // --- FUNCION MAESTRA DE CÁLCULOS Y ACTUALIZACIÓN ---
    function updateAllCalculations() {
        const planTarifario = parseFloat(planTarifarioSelect.value);
        const selectedMonthIndex = parseInt(mesSeleccionado.value) - 1;
        const fechaActivacion = parseInt(fechaActivacionInput.value);
        const clienteActivo = lineasActivasSelect.value === 'SI';
        const currentYear = new Date().getFullYear();

        const defaultResultText = "Complete la información";

        // Función para limpiar y mostrar el texto por defecto
        const showDefaultResults = (message = defaultResultText) => {
            cicloResultadoElement.textContent = message;
            fechaInicioElement.textContent = message;
            fechaFinElement.textContent = message;
            fechaEmisionElement.textContent = message;
            fechaVencimientoElement.textContent = message;
            diasProrrateoElement.textContent = message;
            proporcionalPagarElement.textContent = 'S/ ' + message;
            mensajeTextoElement.textContent = message; // Clear message
        };

        // --- VALIDACIONES INICIALES ---
        if (isNaN(planTarifario) || planTarifarioSelect.value === "" ||
            isNaN(selectedMonthIndex) || mesSeleccionado.value === "" ||
            isNaN(fechaActivacion) || fechaActivacionInput.value === "" ||
            fechaActivacionError.textContent !== "" ||
            (clienteActivo && (isNaN(parseInt(cicloFactSelect.value)) || cicloFactSelect.value === ""))
        ) {
            showDefaultResults();
            return;
        }

        let cicloDeterminante;

        // Determinar el ciclo de facturación
        if (clienteActivo) {
            tituloCicloFactElement.textContent = "CICLO DE FACTURACIÓN ANTERIOR";
            cicloDeterminante = parseInt(cicloFactSelect.value);
            cicloResultadoElement.textContent = cicloDeterminante;
        } else {
            tituloCicloFactElement.textContent = "CICLO DE FACTURACIÓN A ASIGNAR";
            cicloDeterminante = asignacionesCicloFecha[fechaActivacion];
            cicloResultadoElement.textContent = cicloDeterminante || 'No asignado';
        }

        if (!cicloDeterminante || !datosCiclos[cicloDeterminante]) {
            showDefaultResults('Ciclo no válido');
            return;
        }

        const cicloInfo = datosCiclos[cicloDeterminante];

        // --- LÓGICA DE CÁLCULO DE FECHAS (INICIO/FIN) DEL CICLO ACTUAL ---
        let mesBaseCalculo = selectedMonthIndex; // Mes seleccionado por el usuario
        let anoBaseCalculo = currentYear;

        let fechaInicioCicloActualDate;
        let fechaFinCicloActualDate;

        // Determine if the start of the cycle falls in the previous month relative to the activation date
        // Only for cycles that cross month boundaries AND if activation is before the cycle start day
        if (fechaActivacion < cicloInfo.diaInicioCiclo && cicloDeterminante !== 1) {
            mesBaseCalculo = (selectedMonthIndex - 1 + 12) % 12;
            anoBaseCalculo = (selectedMonthIndex === 0) ? currentYear - 1 : currentYear;
        }
        
        fechaInicioCicloActualDate = new Date(anoBaseCalculo, mesBaseCalculo, cicloInfo.diaInicioCiclo);

        // Fecha de fin del ciclo actual
        if (cicloDeterminante === 1) { // Ciclo 1: del 1 al último día del MISMO mes
            fechaFinCicloActualDate = new Date(fechaInicioCicloActualDate.getFullYear(), fechaInicioCicloActualDate.getMonth(), getDaysInMonth(fechaInicioCicloActualDate.getFullYear(), fechaInicioCicloActualDate.getMonth()));
        } else { // Otros ciclos (3, 4, 5) que cruzan al siguiente mes
            let nextMonthIndex = (fechaInicioCicloActualDate.getMonth() + 1) % 12;
            let nextYear = (nextMonthIndex === 0 && fechaInicioCicloActualDate.getMonth() === 11) ? fechaInicioCicloActualDate.getFullYear() + 1 : fechaInicioCicloActualDate.getFullYear();

            fechaFinCicloActualDate = new Date(nextYear, nextMonthIndex, cicloInfo.diaInicioCiclo);
            fechaFinCicloActualDate.setDate(fechaFinCicloActualDate.getDate() - 1); // The day before the start of the next cycle
        }


        // --- LÓGICA DE CÁLCULO DE FECHAS DE EMISIÓN Y VENCIMIENTO ---
        let fechaEmisionDate;
        let fechaVencimientoDate;

        // Special handling for Ciclo 1: emission is last day of the month
        if (cicloDeterminante === 1) {
            const emissionMonthIndex = fechaFinCicloActualDate.getMonth();
            const emissionYear = fechaFinCicloActualDate.getFullYear();
            const lastDayOfEmissionMonth = getDaysInMonth(emissionYear, emissionMonthIndex);
            
            fechaEmisionDate = new Date(emissionYear, emissionMonthIndex, lastDayOfEmissionMonth);

            // Vencimiento is always the 16th of the month *after* emission
            let vencimientoMonthIndex = (fechaEmisionDate.getMonth() + 1) % 12;
            let vencimientoYear = fechaEmisionDate.getFullYear();
            if (vencimientoMonthIndex === 0 && fechaEmisionDate.getMonth() === 11) { // If emission was December, vencimiento is next year
                vencimientoYear = fechaEmisionDate.getFullYear() + 1;
            }
            fechaVencimientoDate = new Date(vencimientoYear, vencimientoMonthIndex, datosCiclos[1].diaVencimiento);

        } else { // Existing logic for other cycles (3, 4, 5) remains
            let emissionMonth = fechaFinCicloActualDate.getMonth();
            let emissionYear = fechaFinCicloActualDate.getFullYear();

            fechaEmisionDate = new Date(emissionYear, emissionMonth, cicloInfo.diaEmision);

            // --- Determine Vencimiento Date ---
            let vencimientoMonth = fechaEmisionDate.getMonth();
            let vencimientoYear = fechaEmisionDate.getFullYear();

            if (cicloDeterminante !== 4) {
                // For cycles other than 4, vencimiento is in the next month
                vencimientoMonth = (fechaEmisionDate.getMonth() + 1) % 12;
                vencimientoYear = (vencimientoMonth === 0 && fechaEmisionDate.getMonth() === 11) ? fechaEmisionDate.getFullYear() + 1 : fechaEmisionDate.getFullYear();
            }
            
            fechaVencimientoDate = new Date(vencimientoYear, vencimientoMonth, cicloInfo.diaVencimiento);
        }

        // --- Display dates (these are for the current cycle) ---
        fechaInicioElement.textContent = formatDayMonth(fechaInicioCicloActualDate.getDate(), fechaInicioCicloActualDate.getMonth());
        fechaFinElement.textContent = formatDayMonth(fechaFinCicloActualDate.getDate(), fechaFinCicloActualDate.getMonth());
        fechaEmisionElement.textContent = formatDayMonth(fechaEmisionDate.getDate(), fechaEmisionDate.getMonth());
        fechaVencimientoElement.textContent = formatDayMonth(fechaVencimientoDate.getDate(), fechaVencimientoDate.getMonth());

        // --- Cálculo de Días de Prorrateo ---
        let diasProrrateoCalculados = 0;
        const fechaActivacionDate = new Date(currentYear, selectedMonthIndex, fechaActivacion);

        // The prorate period is from the activation date up to the day before the *next* billing cycle starts.
        // This means it covers the period within the *current* cycle where the activation happened.

        let prorrateoEndDate = new Date(fechaFinCicloActualDate.getFullYear(), fechaFinCicloActualDate.getMonth(), fechaFinCicloActualDate.getDate());

        // If activation is *within* the determined cycle's period, calculate prorate.
        if (fechaActivacionDate <= prorrateoEndDate) {
            const diffTime = Math.abs(prorrateoEndDate.getTime() - fechaActivacionDate.getTime());
            diasProrrateoCalculados = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include the activation day
        } else {
            diasProrrateoCalculados = 0; // If activation is after the cycle ends (shouldn't happen with correct cycle determination)
        }

        diasProrrateoElement.textContent = diasProrrateoCalculados;

        // --- Cálculo de Proporcional a Pagar ---
        let diasBaseParaDivision;

        // If the prorate month (month of activation) is February, use its actual days.
        // Otherwise, use 30 days for calculation.
        if (selectedMonthIndex === 1) { // February
             diasBaseParaDivision = getDaysInMonth(currentYear, selectedMonthIndex);
        } else {
             diasBaseParaDivision = 30; // Default for other months
        }

        const proporcionalPagar = (planTarifario / diasBaseParaDivision) * diasProrrateoCalculados;

        if (isNaN(proporcionalPagar) || diasProrrateoCalculados === 0) {
            proporcionalPagarElement.textContent = 'S/ 0.00';
            mensajeTextoElement.textContent = "Complete la información para generar el mensaje.";
        } else {
            proporcionalPagarElement.textContent = 'S/ ' + proporcionalPagar.toFixed(2);

            // --- LÓGICA PARA CALCULAR EL PRÓXIMO CICLO ---
            let nextCycleStartDate;
            let nextCycleEndDate;

            // Start of next cycle is 1 day after current cycle ends
            nextCycleStartDate = new Date(fechaFinCicloActualDate);
            nextCycleStartDate.setDate(fechaFinCicloActualDate.getDate() + 1);

            // End of next cycle is based on the determined cycle type
            if (cicloDeterminante === 1) { // Next cycle is also Cycle 1
                nextCycleEndDate = new Date(nextCycleStartDate.getFullYear(), nextCycleStartDate.getMonth(), getDaysInMonth(nextCycleStartDate.getFullYear(), nextCycleStartDate.getMonth()));
            } else { // Next cycle is one of 3, 4, 5
                let nextMonthForNextCycleEnd = (nextCycleStartDate.getMonth() + 1) % 12;
                let nextYearForNextCycleEnd = (nextMonthForNextCycleEnd === 0 && nextCycleStartDate.getMonth() === 11) ? nextCycleStartDate.getFullYear() + 1 : nextCycleStartDate.getFullYear();
                
                nextCycleEndDate = new Date(nextYearForNextCycleEnd, nextMonthForNextCycleEnd, cicloInfo.diaInicioCiclo);
                nextCycleEndDate.setDate(nextCycleEndDate.getDate() - 1);
            }

            // Generate the new message with bolded values
            const mensaje = `Estimado,
            para comentarle que en esta oportunidad Entel le estará activando su linea el
            día <strong>${formatDayMonth(fechaActivacionDate.getDate(), fechaActivacionDate.getMonth())}</strong>. La
            fecha regular de inicio de saldo es
            <strong>${formatDayMonth(nextCycleStartDate.getDate(), nextCycleStartDate.getMonth())}</strong>. Para que usted se mantenga conectado
            tendrá <strong>${diasProrrateoCalculados}</strong> días de prorrateo Con un costo de <strong>S/ ${proporcionalPagar.toFixed(2)}</strong> aproximadamente solo por
            este 1er mes. Además comentarle que su fecha de pago es el <strong>${formatDayMonth(fechaVencimientoDate.getDate(), fechaVencimientoDate.getMonth())}</strong>. Este pago le asegura saldo hasta la fecha <strong>${formatDayMonth(nextCycleEndDate.getDate(), nextCycleEndDate.getDate() === 1 ? nextCycleEndDate.getMonth() : nextCycleEndDate.getMonth() )}</strong>.`;
            
            mensajeTextoElement.innerHTML = mensaje; // Use innerHTML to render bold tags
        }
    }

    // Event listeners que disparan la función maestra
    planTarifarioSelect.addEventListener('change', updateAllCalculations);
    mesSeleccionado.addEventListener('change', updateAllCalculations);
    lineasActivasSelect.addEventListener('change', () => {
        toggleCicloFact();
        updateAllCalculations();
    });
    cicloFactSelect.addEventListener('change', updateAllCalculations);
    fechaActivacionInput.addEventListener('input', updateAllCalculations);
    fechaActivacionInput.addEventListener('change', updateAllCalculations); // Add change listener for input too

    // Inicializar todo al cargar la página
    toggleCicloFact();
    updateAllCalculations();
});