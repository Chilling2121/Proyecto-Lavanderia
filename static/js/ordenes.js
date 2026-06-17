// Variables generales para prendas
let rowCounter = 0;

// Pre-rellenar fecha estimada de entrega a +48 horas
const initDeliveryDate = () => {
    const dt = new Date();
    dt.setHours(dt.getHours() + 48);
    
    // Ajustar zona horaria local para formatear YYYY-MM-DDTHH:MM
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    const hours = String(dt.getHours()).padStart(2, '0');
    const minutes = String(dt.getMinutes()).padStart(2, '0');
    
    const formatted = `${year}-${month}-${day}T${hours}:${minutes}`;
    const element = document.getElementById('id_fecha_entrega_estimada');
    if (element) {
        element.value = formatted;
        
        // Initialize Flatpickr if available
        if (typeof flatpickr !== 'undefined') {
            flatpickr(element, {
                enableTime: true,
                dateFormat: "Y-m-d\\TH:i",
                altInput: true,
                altFormat: "d \\de F, Y \\- h:i K",
                locale: "es",
                defaultDate: dt,
                minDate: "today"
            });
        }
    }
};

// Autocompletar y seleccionar cliente desde HTMX
function selectCliente(id, nombre, telefono) {
    document.getElementById('selected_cliente_id').value = id;
    
    document.getElementById('selected-cliente-nombre').textContent = nombre;
    document.getElementById('selected-cliente-telefono').textContent = `Celular: ${telefono}`;
    
    document.getElementById('cliente-search-container').style.display = 'none';
    document.getElementById('selected-cliente-card').style.display = 'flex';
    document.getElementById('cliente-results-list').style.display = 'none';
    document.getElementById('cliente-results-list').innerHTML = '';
    document.getElementById('cliente_search').value = '';
    
    // Limpiar error de cliente si lo había
    document.getElementById('cliente-validation-error').style.display = 'none';
}

function clearSelectedCliente() {
    document.getElementById('selected_cliente_id').value = '';
    document.getElementById('cliente-search-container').style.display = 'block';
    document.getElementById('selected-cliente-card').style.display = 'none';
    setTimeout(() => document.getElementById('cliente_search').focus(), 50);
}

// Cerrar lista flotante de clientes si se hace clic afuera
document.addEventListener('click', (e) => {
    if (!e.target.closest('#cliente-search-container')) {
        const list = document.getElementById('cliente-results-list');
        if (list) list.style.display = 'none';
    }
});

// Controlar visibilidad de la lista de HTMX tras cargar contenido
document.addEventListener('htmx:afterSwap', (e) => {
    if (e.target.id === 'cliente-results-list') {
        e.target.style.display = e.target.children.length > 0 ? 'block' : 'none';
    }
});

// Añadir fila de prenda
function addPrendaRow() {
    rowCounter++;
    const container = document.getElementById('prendas-container');
    document.getElementById('no-prendas-placeholder').style.display = 'none';
    document.getElementById('prendas-validation-error').style.display = 'none';
    document.getElementById('prendas-headers').style.display = 'grid';
    
    const row = document.createElement('div');
    row.className = 'prenda-row';
    row.id = `prenda-row-${rowCounter}`;
    row.style.display = 'grid';
    row.style.gridTemplateColumns = '1.4fr 1.6fr 55px 65px 1.1fr 75px 35px';
    row.style.gap = '0.75rem';
    row.style.alignItems = 'center';
    row.style.padding = '0.8rem 1rem';
    row.style.backgroundColor = 'var(--bg-app)';
    row.style.borderRadius = 'var(--radius-sm)';
    row.style.animation = 'slideDownRow 0.25s ease-out';
    
    // Crear opciones dinámicamente usando la variable global SERVICIOS inyectada en el HTML
    let opcionesServicio = '<option value="" disabled selected>Servicio...</option>';
    if (typeof SERVICIOS !== 'undefined') {
        SERVICIOS.forEach(s => {
            opcionesServicio += `<option value="${s.id}">${s.nombre}</option>`;
        });
    }
    
    // Contenido HTML de la fila
    row.innerHTML = `
        <!-- Tipo de Prenda -->
        <div style="min-width: 0;">
            <input type="text" class="input-tipo" placeholder="Prenda..." list="prendas-sugeridas" required
                   style="box-sizing: border-box; width: 100%; padding: 0.45rem 0.4rem; font-size: 0.82rem; font-family: var(--font); background-color: var(--bg-card); border: 1.5px solid var(--border); border-radius: var(--radius-sm); color: var(--text); text-overflow: ellipsis;">
        </div>
        
        <!-- Selector de Servicio -->
        <div style="min-width: 0;">
            <select class="select-servicio" onchange="onServiceChange(this)" required
                    style="box-sizing: border-box; width: 100%; padding: 0.45rem 0.2rem; font-size: 0.82rem; font-family: var(--font); background-color: var(--bg-card); border: 1.5px solid var(--border); border-radius: var(--radius-sm); color: var(--text); font-weight: 500; text-overflow: ellipsis;">
                ${opcionesServicio}
            </select>
        </div>
        
        <!-- Cantidad (Unitario) -->
        <div style="min-width: 0;">
            <input type="number" class="input-cantidad" value="1" min="1" oninput="calculateRow(this)"
                   style="box-sizing: border-box; width: 100%; padding: 0.45rem 0.1rem; text-align: center; font-size: 0.82rem; font-family: var(--font); background-color: var(--bg-card); border: 1.5px solid var(--border); border-radius: var(--radius-sm); color: var(--text); font-weight: 600;">
        </div>
        
        <!-- Peso (Kilogramos) -->
        <div style="min-width: 0;">
            <input type="number" class="input-peso" step="0.01" min="0.05" oninput="calculateRow(this)" placeholder="Kg" disabled
                   style="box-sizing: border-box; width: 100%; padding: 0.45rem 0.1rem; text-align: center; font-size: 0.82rem; font-family: var(--font); background-color: var(--bg-card); border: 1.5px solid var(--border); border-radius: var(--radius-sm); color: var(--text); font-weight: 600; opacity: 0.5;">
        </div>
        
        <!-- Observaciones específicas de prenda -->
        <div style="min-width: 0;">
            <input type="text" class="input-obs" placeholder="Detalles..."
                   style="box-sizing: border-box; width: 100%; padding: 0.45rem 0.4rem; font-size: 0.82rem; font-family: var(--font); background-color: var(--bg-card); border: 1.5px solid var(--border); border-radius: var(--radius-sm); color: var(--text); text-overflow: ellipsis;">
        </div>
        
        <!-- Subtotal de fila -->
        <div style="text-align: right; font-weight: 700; color: var(--text); font-size: 0.9rem; padding-right: 0.5rem;">
            $<span class="label-row-subtotal">0.00</span>
        </div>
        
        <!-- Botón Eliminar Fila -->
        <div style="display: flex; justify-content: center;">
            <button type="button" onclick="removePrendaRow(${rowCounter})" style="background: none; border: none; color: var(--danger); cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0.25rem; opacity: 0.8; transition: var(--transition);" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
        </div>
    `;
    
    container.appendChild(row);
    
    // Agregar listener para limpiar error de borde al escribir
    row.querySelector('.input-tipo').addEventListener('input', (e) => {
        e.target.style.borderColor = '';
    });
    const selectSvc = row.querySelector('.select-servicio');
    selectSvc.addEventListener('change', (e) => {
        e.target.style.borderColor = '';
    });
    
    // Initialize Tom Select for the newly added service select
    if (typeof TomSelect !== 'undefined') {
        new TomSelect(selectSvc, {
            create: false,
            sortField: { field: "text", direction: "asc" },
            placeholder: "Seleccione un servicio...",
            controlInput: '<input>',
        });
        
        // Also initialize Tom Select for the 'Prenda' input to replace datalist
        const prendaInput = row.querySelector('.input-tipo');
        new TomSelect(prendaInput, {
            create: true,
            createOnBlur: true,
            maxItems: 1,
            placeholder: "Prenda (ej: Camisa)",
            options: [
                {value: 'Camisa', text: 'Camisa'},
                {value: 'Pantalón', text: 'Pantalón'},
                {value: 'Saco / Chaqueta', text: 'Saco / Chaqueta'},
                {value: 'Abrigo', text: 'Abrigo'},
                {value: 'Vestido', text: 'Vestido'},
                {value: 'Terno / Traje', text: 'Terno / Traje'},
                {value: 'Jeans', text: 'Jeans'},
                {value: 'Edredón / Cobija', text: 'Edredón / Cobija'},
                {value: 'Sábanas', text: 'Sábanas'},
                {value: 'Toallas', text: 'Toallas'},
                {value: 'Zapatos', text: 'Zapatos'}
            ]
        });
    }
}

// Eliminar fila de prenda
function removePrendaRow(id) {
    const row = document.getElementById(`prenda-row-${id}`);
    if (row) {
        row.style.animation = 'slideUpRow 0.2s ease-in forwards';
        setTimeout(() => {
            row.remove();
            
            // Mostrar placeholder si no quedan prendas
            const container = document.getElementById('prendas-container');
            if (container.children.length === 0) {
                document.getElementById('no-prendas-placeholder').style.display = 'flex';
                document.getElementById('prendas-headers').style.display = 'none';
            }
            
            // Recalcular totales generales
            calculateOrderTotals();
        }, 200);
    }
}

// Evento de cambio de servicio en una fila
function onServiceChange(select) {
    const row = select.closest('.prenda-row');
    const serviceId = parseInt(select.value);
    
    const cantInput = row.querySelector('.input-cantidad');
    const pesoInput = row.querySelector('.input-peso');
    
    // Buscar el servicio en la lista
    const servicio = SERVICIOS.find(s => s.id === serviceId);
    
    if (servicio) {
        // Verificar tipo de cobro
        if (servicio.tipo_cobro.toLowerCase().includes('kg')) {
            // Cobro por Peso
            cantInput.disabled = true;
            cantInput.style.opacity = '0.5';
            cantInput.value = 1;
            
            pesoInput.disabled = false;
            pesoInput.style.opacity = '1';
            pesoInput.required = true;
            if (!pesoInput.value) pesoInput.value = 1.0;
        } else {
            // Cobro por Unidad (Por Prenda)
            cantInput.disabled = false;
            cantInput.style.opacity = '1';
            
            pesoInput.disabled = true;
            pesoInput.style.opacity = '0.5';
            pesoInput.value = '';
            pesoInput.required = false;
        }
    }
    
    calculateRow(select);
}

// Calcular el costo de una fila
function calculateRow(element) {
    const row = element.closest('.prenda-row');
    const select = row.querySelector('.select-servicio');
    const serviceId = parseInt(select.value);
    
    const cantInput = row.querySelector('.input-cantidad');
    const pesoInput = row.querySelector('.input-peso');
    const labelSubtotal = row.querySelector('.label-row-subtotal');
    
    const servicio = SERVICIOS.find(s => s.id === serviceId);
    let subtotal = 0.00;
    
    if (servicio) {
        const tarifa = parseFloat(servicio.tarifa);
        if (servicio.tipo_cobro.toLowerCase().includes('kg')) {
            const peso = parseFloat(pesoInput.value) || 0.00;
            subtotal = tarifa * peso;
        } else {
            const cantidad = parseInt(cantInput.value) || 0;
            subtotal = tarifa * cantidad;
        }
    }
    
    labelSubtotal.textContent = subtotal.toFixed(2);
    
    calculateOrderTotals();
}

// Calcular los totales de la orden entera
function calculateOrderTotals() {
    let subtotal = 0.00;
    
    // Sumar todos los subtotales de las filas de prendas
    document.querySelectorAll('.label-row-subtotal').forEach(label => {
        subtotal += parseFloat(label.textContent) || 0.00;
    });
    
    // Capturar descuento y anticipo
    const inputDesc = document.getElementById('input-descuento');
    const inputAnt = document.getElementById('input-anticipo');
    
    let descuento = parseFloat(inputDesc.value) || 0.00;
    let anticipo = parseFloat(inputAnt.value) || 0.00;
    
    // Corregir valores negativos
    if (descuento < 0) { descuento = 0; inputDesc.value = '0.00'; }
    if (anticipo < 0) { anticipo = 0; inputAnt.value = '0.00'; }
    
    // Evitar que el descuento sea mayor que el subtotal
    if (descuento > subtotal) {
        descuento = subtotal;
        inputDesc.value = subtotal.toFixed(2);
    }
    
    const totalPagar = subtotal - descuento;
    
    // Evitar que el anticipo sea mayor que el total a pagar
    if (anticipo > totalPagar) {
        anticipo = totalPagar;
        inputAnt.value = totalPagar.toFixed(2);
    }
    
    const saldoPendiente = totalPagar - anticipo;
    
    // Actualizar etiquetas visuales e inputs ocultos
    document.getElementById('label-subtotal').textContent = '$' + subtotal.toFixed(2);
    document.getElementById('input-subtotal').value = subtotal.toFixed(2);
    
    document.getElementById('label-total-pagar').textContent = '$' + totalPagar.toFixed(2);
    document.getElementById('input-total-pagar').value = totalPagar.toFixed(2);
    
    document.getElementById('label-saldo-pendiente').textContent = '$' + saldoPendiente.toFixed(2);
}

// Validación y envío del formulario
document.addEventListener('DOMContentLoaded', () => {
    initDeliveryDate();
    
    // Inicializar Tom Select para Método de Pago
    if (typeof TomSelect !== 'undefined') {
        const metodoPagoSelect = document.getElementById('id_metodo_pago');
        if (metodoPagoSelect) {
            new TomSelect(metodoPagoSelect, {
                create: false,
                sortField: { field: "text", direction: "asc" }
            });
        }
    }
    
    const form = document.getElementById('order-creation-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            let hasError = false;
            
            // 1. Validar Cliente seleccionado
            const clienteId = document.getElementById('selected_cliente_id').value;
            const clienteError = document.getElementById('cliente-validation-error');
            if (!clienteId) {
                hasError = true;
                clienteError.style.display = 'block';
                document.getElementById('cliente_search').focus();
            } else {
                clienteError.style.display = 'none';
            }
            
            // 2. Validar Fecha Estimada
            const fechaEstimada = document.getElementById('id_fecha_entrega_estimada').value;
            const dateError = document.getElementById('date-validation-error');
            if (!fechaEstimada) {
                hasError = true;
                dateError.style.display = 'block';
            } else {
                dateError.style.display = 'none';
            }
            
            // 3. Validar prendas agregadas
            const rows = document.querySelectorAll('.prenda-row');
            const prendasError = document.getElementById('prendas-validation-error');
            if (rows.length === 0) {
                hasError = true;
                prendasError.style.display = 'block';
            } else {
                prendasError.style.display = 'none';
                
                // Validar que cada fila tenga su tipo de prenda e inputs completos
                rows.forEach(row => {
                    const tipoInput = row.querySelector('.input-tipo');
                    const selectServ = row.querySelector('.select-servicio');
                    const pesoInput = row.querySelector('.input-peso');
                    
                    if (!tipoInput.value.trim()) {
                        hasError = true;
                        tipoInput.style.borderColor = 'var(--danger)';
                        tipoInput.focus();
                    }
                    
                    if (!selectServ.value) {
                        hasError = true;
                        selectServ.style.borderColor = 'var(--danger)';
                        selectServ.focus();
                    }
                    
                    if (!pesoInput.disabled && (!pesoInput.value || parseFloat(pesoInput.value) <= 0)) {
                        hasError = true;
                        pesoInput.style.borderColor = 'var(--danger)';
                        pesoInput.focus();
                    }
                });
            }
            
            if (hasError) {
                if (typeof showToast === 'function') {
                    showToast("Por favor complete los campos requeridos marcados en rojo.", "error");
                }
                return;
            }
            
            // Recopilar prendas en formato JSON
            const items = [];
            rows.forEach(row => {
                const tipo = row.querySelector('.input-tipo').value.trim();
                const servicioId = row.querySelector('.select-servicio').value;
                const cantidad = row.querySelector('.input-cantidad').value;
                const peso = row.querySelector('.input-peso').value;
                
                const esDelicada = false; // Por defecto
                const obs = row.querySelector('.input-obs').value.trim();
                
                items.push({
                    tipo_prenda: tipo,
                    servicio_id: parseInt(servicioId),
                    cantidad: parseInt(cantidad) || 1,
                    peso: peso ? parseFloat(peso) : null,
                    es_delicada: esDelicada,
                    observaciones: obs
                });
            });
            
            document.getElementById('prendas_json').value = JSON.stringify(items);
            
            // Enviar formulario
            this.submit();
        });
    }
});
