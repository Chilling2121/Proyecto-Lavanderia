document.addEventListener('DOMContentLoaded', () => {
    // Inicializar Flatpickr con idioma español en rango
    const fechaRango = document.getElementById("fecha_rango");
    const clearFechaBtn = document.getElementById("clear_fecha");
    
    if (fechaRango) {
        const fp = flatpickr("#fecha_rango", {
            mode: "range",
            dateFormat: "Y-m-d",
            locale: "es",
            maxDate: "today",
            onChange: function(selectedDates, dateStr, instance) {
                // Mostrar u ocultar el boton de limpiar
                if (clearFechaBtn) {
                    clearFechaBtn.style.display = dateStr ? 'block' : 'none';
                }
                
                // Forzar trigger de cambio para que HTMX capture el valor
                const input = document.getElementById('fecha_rango');
                if (input && (selectedDates.length === 2 || dateStr === "")) {
                    input.dispatchEvent(new Event('change'));
                }
            }
        });
        
        if (clearFechaBtn) {
            clearFechaBtn.addEventListener('click', () => {
                fp.clear(); // Limpia Flatpickr (esto dispara onChange con dateStr="")
            });
        }
    }

    // Inicializar Tom Select para selects
    const metodoPago = document.getElementById("metodo_pago");
    if (metodoPago && typeof TomSelect !== 'undefined') {
        new TomSelect("#metodo_pago", {
            create: false,
            controlInput: null,
            wrapperClass: 'ts-wrapper ts-no-typing',
            onInitialize: function() {
                if (this.control_input) {
                    this.control_input.readOnly = true;
                    this.control_input.disabled = true;
                    this.control_input.style.display = 'none';
                }
            },
            onChange: function() {
                this.input.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
    }
    const tipoPago = document.getElementById("tipo_pago");
    if (tipoPago && typeof TomSelect !== 'undefined') {
        new TomSelect("#tipo_pago", {
            create: false,
            controlInput: null,
            wrapperClass: 'ts-wrapper ts-no-typing',
            onInitialize: function() {
                if (this.control_input) {
                    this.control_input.readOnly = true;
                    this.control_input.disabled = true;
                    this.control_input.style.display = 'none';
                }
            },
            onChange: function() {
                this.input.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
    }
});
