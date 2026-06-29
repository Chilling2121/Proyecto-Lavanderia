(function() {
    function initPaymentPanel() {
        const panel = document.getElementById("payment-panel-inner");
        if (!panel) return;
        
        const metodoSelect = document.getElementById("pago-metodo-select");
        const efectivoGroup = document.getElementById("efectivo-entregado-group");
        const montoInput = document.getElementById("pago-monto-input");
        const efectivoInput = document.getElementById("pago-efectivo-recibido");
        const cambioMsg = document.getElementById("cambio-dinamico-msg");
        const cambioVal = document.getElementById("cambio-dinamico-val");
        const cambioGroup = document.getElementById("confirmacion-cambio-group");
        const cambioCheckbox = document.getElementById("confirmar-cambio-entregado");
        const cambioCheckboxVal = document.getElementById("cambio-checkbox-val");
        
        const maxDeuda = parseFloat(panel.getAttribute("data-saldo-pendiente")) || 0;

        function updateCambio() {
            const monto = parseFloat(montoInput.value) || 0;
            const entregado = parseFloat(efectivoInput.value) || 0;
            
            // Si el usuario ingresa un monto que supera la deuda pendiente, el cobro real se limita a maxDeuda
            let cobroEfectivo = Math.min(monto, maxDeuda);
            let cambio = 0;
            
            // Caso 1: Ingresó efectivo entregado en el campo específico
            if (entregado > cobroEfectivo) {
                cambio = entregado - cobroEfectivo;
                if (cambioVal) cambioVal.textContent = cambio.toFixed(2);
                if (cambioMsg) cambioMsg.style.display = "block";
            }
            // Caso 2: Ingresó directamente el billete más grande en el campo "Monto"
            else if (monto > maxDeuda) {
                cambio = monto - maxDeuda;
                if (cambioVal) cambioVal.textContent = cambio.toFixed(2);
                if (cambioMsg) cambioMsg.style.display = "block";
            } else {
                if (cambioMsg) cambioMsg.style.display = "none";
            }

            // Mostrar y hacer obligatorio el checkbox si hay cambio y es en Efectivo
            if (cambio > 0 && metodoSelect && metodoSelect.value === "Efectivo") {
                if (cambioCheckboxVal) cambioCheckboxVal.textContent = cambio.toFixed(2);
                if (cambioGroup) cambioGroup.style.display = "flex";
                if (cambioCheckbox) cambioCheckbox.required = true;
            } else {
                if (cambioGroup) cambioGroup.style.display = "none";
                if (cambioCheckbox) {
                    cambioCheckbox.required = false;
                    cambioCheckbox.checked = false;
                }
            }
        }

        if (metodoSelect && efectivoGroup) {
            metodoSelect.addEventListener("change", function() {
                if (metodoSelect.value === "Efectivo") {
                    efectivoGroup.style.display = "flex";
                } else {
                    efectivoGroup.style.display = "none";
                    if (efectivoInput) efectivoInput.value = "";
                    if (cambioMsg) cambioMsg.style.display = "none";
                }
                updateCambio();
            });
            // Ejecutar al inicio para asegurar estado correcto
            if (metodoSelect.value !== "Efectivo") {
                efectivoGroup.style.display = "none";
            }
        }

        if (montoInput && efectivoInput) {
            montoInput.addEventListener("input", updateCambio);
            efectivoInput.addEventListener("input", updateCambio);
        }
        
        // Ejecutar updateCambio inicial
        updateCambio();
    }

    // Inicializar al cargar el DOM
    document.addEventListener("DOMContentLoaded", initPaymentPanel);
    
    // Y re-inicializar cuando HTMX haga un swap en el contenedor del panel
    document.body.addEventListener("htmx:afterSwap", function(e) {
        if (e.target.id === "payment-panel-inner" || e.target.querySelector("#payment-panel-inner")) {
            initPaymentPanel();
        }
    });
})();
