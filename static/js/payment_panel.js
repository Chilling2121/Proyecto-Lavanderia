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
        const efectivoDisponible = parseFloat(panel.getAttribute("data-efectivo-disponible")) || 0;

        function updateCambio() {
            let monto = parseFloat(montoInput.value) || 0;
            const entregado = parseFloat(efectivoInput.value) || 0;
            
            // Habilitar submitBtn por defecto
            const submitBtn = panel.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.style.opacity = "";
                submitBtn.style.cursor = "";
            }

            // Validar que el monto no exceda la deuda pendiente
            if (monto > maxDeuda) {
                monto = maxDeuda;
                montoInput.value = maxDeuda.toFixed(2);
            }
            
            let cambio = 0;
            const isEfectivo = metodoSelect && metodoSelect.value === "Efectivo";

            // Validar efectivo entregado si es menor que el monto cobrado
            if (isEfectivo && entregado > 0 && entregado < monto) {
                if (cambioMsg) {
                    cambioMsg.innerHTML = `<span style="color:var(--danger); display:block; font-size:0.78rem; font-weight:700; margin-top:0.25rem;">⚠️ El efectivo entregado debe ser mayor o igual al monto ($${monto.toFixed(2)})</span>`;
                    cambioMsg.style.display = "block";
                }
                if (cambioGroup) cambioGroup.style.display = "none";
                if (cambioCheckbox) {
                    cambioCheckbox.required = false;
                    cambioCheckbox.checked = false;
                }
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.style.opacity = "0.5";
                    submitBtn.style.cursor = "not-allowed";
                }
                return;
            }

            // Calcular vuelto
            if (isEfectivo && entregado > monto) {
                cambio = entregado - monto;
            }

            // Validar si el cambio supera el efectivo disponible físico en la caja
            if (isEfectivo && cambio > efectivoDisponible) {
                if (cambioMsg) {
                    cambioMsg.innerHTML = `⚠️ Cambio estimado: $${cambio.toFixed(2)} <span style="color:var(--danger); display:block; margin-top:0.25rem; font-size:0.78rem; font-weight:700;">¡Efectivo insuficiente en caja! (Disponible: $${efectivoDisponible.toFixed(2)})</span>`;
                    cambioMsg.style.display = "block";
                }
                if (cambioGroup) cambioGroup.style.display = "none";
                if (cambioCheckbox) {
                    cambioCheckbox.required = false;
                    cambioCheckbox.checked = false;
                }
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.style.opacity = "0.5";
                    submitBtn.style.cursor = "not-allowed";
                }
                return;
            }

            // Flujo normal: Mostrar el vuelto estimado
            if (cambio > 0) {
                if (cambioMsg) {
                    cambioMsg.innerHTML = `Cambio estimado: $<span id="cambio-dinamico-val">${cambio.toFixed(2)}</span>`;
                    cambioMsg.style.display = "block";
                }
                if (cambioCheckboxVal) cambioCheckboxVal.textContent = cambio.toFixed(2);
                if (cambioGroup) cambioGroup.style.display = "flex";
                if (cambioCheckbox) cambioCheckbox.required = true;
            } else {
                if (cambioMsg) cambioMsg.style.display = "none";
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
