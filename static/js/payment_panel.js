(function() {
    function initPaymentPanel() {
        const panel = document.getElementById("payment-panel-inner");
        if (!panel) return;
        
        const metodoSelect = document.getElementById("pago-metodo-select");
        const montoInput = document.getElementById("pago-monto-input");
        const saldoAttr = panel.getAttribute("data-saldo-pendiente") || "0";
        const maxDeuda = parseFloat(saldoAttr.replace(',', '.')) || 0;

        // Inicializar Tom Select si está disponible
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
                }
            });
        }

        function restrictMonto() {
            let monto = parseFloat(montoInput.value) || 0;
            // Validar que el monto no exceda la deuda pendiente
            if (monto > maxDeuda) {
                montoInput.value = maxDeuda.toFixed(2);
            }
        }

        if (montoInput) {
            montoInput.addEventListener("input", restrictMonto);
        }
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
