(function() {
    function initPaymentPanel() {
        const panel = document.getElementById("payment-panel-inner");
        if (!panel) return;
        
        const metodoSelect = document.getElementById("pago-metodo-select");
        const montoInput = document.getElementById("pago-monto-input");
        const efectivoEntregadoInput = document.getElementById("pago-efectivo-entregado");
        const efectivoWrapper = document.getElementById("efectivo-entregado-wrapper");
        const cambioPreview = document.getElementById("cambio-preview");

        const saldoAttr = panel.getAttribute("data-saldo-pendiente") || "0";
        const maxDeuda = parseFloat(saldoAttr.replace(',', '.')) || 0;

        const efectivoDisponibleAttr = panel.getAttribute("data-efectivo-disponible") || "0";
        const efectivoDisponible = parseFloat(efectivoDisponibleAttr.replace(',', '.')) || 0;

        const simboloMoneda = panel.getAttribute("data-simbolo-moneda") || '$';

        // Inicializar Tom Select para el selector de método de pago
        if (typeof TomSelect !== 'undefined' && metodoSelect && !metodoSelect.tomselect) {
            new TomSelect(metodoSelect, {
                create: false,
                controlInput: null,
                wrapperClass: 'ts-wrapper ts-no-typing',
                sortField: { field: "text", direction: "asc" },
                onInitialize: function() {
                    if (this.control_input) {
                        this.control_input.readOnly = true;
                        this.control_input.disabled = true;
                        this.control_input.style.display = 'none';
                    }
                },
                onChange: function() {
                    toggleEfectivoEntregado();
                    calcularCambioPreview();
                }
            });
        }

        function getMetodo() {
            if (metodoSelect && metodoSelect.tomselect) {
                return metodoSelect.tomselect.getValue();
            }
            return metodoSelect ? metodoSelect.value : 'Efectivo';
        }

        // Mostrar/ocultar campo "Efectivo entregado" según método de pago
        function toggleEfectivoEntregado() {
            if (!efectivoWrapper) return;
            const metodo = getMetodo();
            if (metodo === 'Efectivo') {
                efectivoWrapper.style.display = 'flex';
            } else {
                efectivoWrapper.style.display = 'none';
                if (efectivoEntregadoInput) efectivoEntregadoInput.value = '';
                if (cambioPreview) cambioPreview.style.display = 'none';
            }
        }

        // Calcular y mostrar vista previa de cambio en tiempo real
        function calcularCambioPreview() {
            if (!cambioPreview || !montoInput) return;

            const metodo = getMetodo();
            const monto = parseFloat(montoInput.value) || 0;
            const efectivoEntregado = parseFloat(efectivoEntregadoInput ? efectivoEntregadoInput.value : '') || 0;

            // Solo calcular cambio para pagos en efectivo
            if (metodo !== 'Efectivo') {
                cambioPreview.style.display = 'none';
                return;
            }

            let cambio = 0;
            let descripcion = '';

            if (monto > maxDeuda && maxDeuda > 0) {
                // El monto supera la deuda → el sistema registrará solo la deuda y dará cambio
                cambio = monto - maxDeuda;
                descripcion = `El cliente entrega más que la deuda. Se cobrará solo la deuda (${maxDeuda.toFixed(2)}).`;
            } else if (efectivoEntregado > monto && monto > 0) {
                // El cajero especificó cuánto recibió y es mayor al monto
                cambio = efectivoEntregado - monto;
                descripcion = '';
            }

            if (cambio > 0) {
                let alertText = `🪙 Cambio a devolver: ${simboloMoneda}${cambio.toFixed(2)}`;

                if (descripcion) {
                    alertText += ` — ${descripcion}`;
                }

                if (cambio > efectivoDisponible) {
                    alertText = `⚠️ Cambio necesario: ${simboloMoneda}${cambio.toFixed(2)} — La caja solo tiene ${simboloMoneda}${efectivoDisponible.toFixed(2)}. Fondos insuficientes.`;
                    cambioPreview.style.background = 'hsl(350, 80%, 96%)';
                    cambioPreview.style.color = 'var(--danger)';
                } else {
                    cambioPreview.style.background = 'hsl(142, 72%, 95%)';
                    cambioPreview.style.color = 'var(--success)';
                }

                cambioPreview.textContent = alertText;
                cambioPreview.style.display = 'block';
            } else {
                cambioPreview.style.display = 'none';
            }
        }

        // Restringir monto para pagos electrónicos (no pueden exceder la deuda)
        function restrictMontoElectronico() {
            const metodo = getMetodo();
            if (metodo !== 'Efectivo' && montoInput) {
                let monto = parseFloat(montoInput.value) || 0;
                if (monto > maxDeuda) {
                    montoInput.value = maxDeuda.toFixed(2);
                }
            }
        }

        // Event listeners
        if (montoInput) {
            montoInput.addEventListener("input", function() {
                restrictMontoElectronico();
                calcularCambioPreview();
            });
        }

        if (efectivoEntregadoInput) {
            efectivoEntregadoInput.addEventListener("input", calcularCambioPreview);
        }

        if (metodoSelect && !metodoSelect.tomselect) {
            metodoSelect.addEventListener("change", function() {
                toggleEfectivoEntregado();
                calcularCambioPreview();
            });
        }

        // Inicializar estado al cargar
        toggleEfectivoEntregado();
    }

    // Inicializar al cargar el DOM
    document.addEventListener("DOMContentLoaded", initPaymentPanel);
    
    // Y re-inicializar cuando HTMX haga un swap en el contenedor del panel
    document.body.addEventListener("htmx:afterSwap", function(e) {
        if (e.target.id === "payment-panel" || e.target.id === "payment-panel-inner" || e.target.querySelector("#payment-panel-inner")) {
            setTimeout(initPaymentPanel, 50);
        }
    });
})();
