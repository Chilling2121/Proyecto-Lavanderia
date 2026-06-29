document.addEventListener('DOMContentLoaded', () => {
    // Inicializar Flatpickr con idioma español en rango
    const fechaRango = document.getElementById("fecha_rango");
    if (fechaRango) {
        flatpickr("#fecha_rango", {
            mode: "range",
            dateFormat: "Y-m-d",
            locale: "es",
            maxDate: "today",
            onChange: function(selectedDates, dateStr, instance) {
                // Forzar trigger de cambio para que HTMX capture el valor
                const input = document.getElementById('fecha_rango');
                if (input && (selectedDates.length === 2 || dateStr === "")) {
                    input.dispatchEvent(new Event('change'));
                }
            }
        });
    }

    // Inicializar Tom Select para selects
    const metodoPago = document.getElementById("metodo_pago");
    if (metodoPago && typeof TomSelect !== 'undefined') {
        new TomSelect("#metodo_pago", {
            create: false,
            controlInput: null
        });
    }
    const tipoPago = document.getElementById("tipo_pago");
    if (tipoPago && typeof TomSelect !== 'undefined') {
        new TomSelect("#tipo_pago", {
            create: false,
            controlInput: null
        });
    }
});
