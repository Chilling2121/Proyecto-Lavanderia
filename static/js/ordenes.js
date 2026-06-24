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
        
        // Inicializar Flatpickr si está disponible
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

// Autocompletar y seleccionar cliente desde HTMX (usado en la versión standalone)
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
    if (!container) return;
    
    const placeholder = document.getElementById('no-prendas-placeholder');
    if (placeholder) placeholder.style.display = 'none';
    
    const errorEl = document.getElementById('prendas-validation-error');
    if (errorEl) errorEl.style.display = 'none';
    
    const headers = document.getElementById('prendas-headers');
    if (headers) headers.style.display = 'grid';
    
    const row = document.createElement('div');
    row.className = 'prenda-row';
    row.id = `prenda-row-${rowCounter}`;
    row.style.display = 'grid';
    row.style.gridTemplateColumns = '1.1fr 1.1fr 55px 45px 50px 1.1fr 65px 30px';
    row.style.gap = '0.5rem';
    row.style.alignItems = 'center';
    row.style.padding = '0.6rem 0.5rem';
    row.style.backgroundColor = 'var(--bg-app)';
    row.style.borderRadius = 'var(--radius-sm)';
    row.style.animation = 'slideDownRow 0.25s ease-out';
    
    // Crear opciones dinámicamente usando la variable global SERVICIOS
    let opcionesServicio = '<option value="" disabled selected>Servicio...</option>';
    const listaServicios = window.SERVICIOS || (typeof SERVICIOS !== 'undefined' ? SERVICIOS : []);
    listaServicios.forEach(s => {
        opcionesServicio += `<option value="${s.id}">${s.nombre}</option>`;
    });
    
    // Contenido HTML de la fila con Tarifa editable e input de tipo de prenda estándar (con datalist)
    row.innerHTML = `
        <!-- Tipo de Prenda (Texto libre con datalist de sugerencias) -->
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
        
        <!-- Tarifa / Precio Unitario (Editable!) -->
        <div style="min-width: 0;">
            <input type="number" class="input-tarifa" value="0.00" min="0" step="0.01" oninput="calculateRow(this)" required
                   style="box-sizing: border-box; width: 100%; padding: 0.45rem 0.1rem; text-align: center; font-size: 0.82rem; font-family: var(--font); background-color: var(--bg-card); border: 1.5px solid var(--border); border-radius: var(--radius-sm); color: var(--text); font-weight: 600;">
        </div>
        
        <!-- Cantidad -->
        <div style="min-width: 0;">
            <input type="number" class="input-cantidad" value="1" min="1" oninput="calculateRow(this)"
                   style="box-sizing: border-box; width: 100%; padding: 0.45rem 0.1rem; text-align: center; font-size: 0.82rem; font-family: var(--font); background-color: var(--bg-card); border: 1.5px solid var(--border); border-radius: var(--radius-sm); color: var(--text); font-weight: 600;">
        </div>
        
        <!-- Peso (Kg) -->
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
        <div style="text-align: right; font-weight: 700; color: var(--text); font-size: 0.88rem; padding-right: 0.25rem;">
            $<span class="label-row-subtotal">0.00</span>
        </div>
        
        <!-- Botón Eliminar Fila -->
        <div style="display: flex; justify-content: center;">
            <button type="button" onclick="removePrendaRow(${rowCounter})" style="background: none; border: none; color: var(--danger); cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0.25rem; opacity: 0.8; transition: var(--transition);" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
        </div>
    `;
    
    container.appendChild(row);
    
    // Agregar listener para limpiar error de borde al escribir
    row.querySelector('.input-tipo').addEventListener('input', (e) => {
        e.target.style.borderColor = '';
    });
    row.querySelector('.select-servicio').addEventListener('change', (e) => {
        e.target.style.borderColor = '';
    });
    row.querySelector('.input-tarifa').addEventListener('input', (e) => {
        e.target.style.borderColor = '';
    });
    
    // Inicializar Tom Select únicamente para el selector de servicios de la fila
    const selectSvc = row.querySelector('.select-servicio');
    if (typeof TomSelect !== 'undefined' && selectSvc) {
        new TomSelect(selectSvc, {
            create: false,
            sortField: { field: "text", direction: "asc" },
            placeholder: "Servicio...",
            controlInput: null,
            onChange: function() {
                // Forzar trigger de cambio para activar onServiceChange nativo
                onServiceChange(selectSvc);
            }
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
            if (container && container.children.length === 0) {
                const placeholder = document.getElementById('no-prendas-placeholder');
                if (placeholder) placeholder.style.display = 'flex';
                
                const headers = document.getElementById('prendas-headers');
                if (headers) headers.style.display = 'none';
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
    
    const tarifaInput = row.querySelector('.input-tarifa');
    const cantInput = row.querySelector('.input-cantidad');
    const pesoInput = row.querySelector('.input-peso');
    
    const listaServicios = window.SERVICIOS || (typeof SERVICIOS !== 'undefined' ? SERVICIOS : []);
    const servicio = listaServicios.find(s => s.id === serviceId);
    
    if (servicio) {
        // Cargar la tarifa base del servicio en el campo editable
        tarifaInput.value = parseFloat(servicio.tarifa).toFixed(2);
        
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
    
    const tarifaInput = row.querySelector('.input-tarifa');
    const cantInput = row.querySelector('.input-cantidad');
    const pesoInput = row.querySelector('.input-peso');
    const labelSubtotal = row.querySelector('.label-row-subtotal');
    
    const listaServicios = window.SERVICIOS || (typeof SERVICIOS !== 'undefined' ? SERVICIOS : []);
    const servicio = listaServicios.find(s => s.id === serviceId);
    let subtotal = 0.00;
    
    if (servicio) {
        const tarifa = parseFloat(tarifaInput.value) || 0.00;
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
    
    if (!inputDesc || !inputAnt) return;
    
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
    const labelSub = document.getElementById('label-subtotal');
    if (labelSub) labelSub.textContent = '$' + subtotal.toFixed(2);
    
    const inputSub = document.getElementById('input-subtotal');
    if (inputSub) inputSub.value = subtotal.toFixed(2);
    
    const labelTot = document.getElementById('label-total-pagar');
    if (labelTot) labelTot.textContent = '$' + totalPagar.toFixed(2);
    
    const inputTot = document.getElementById('input-total-pagar');
    if (inputTot) inputTot.value = totalPagar.toFixed(2);
    
    const labelSaldo = document.getElementById('label-saldo-pendiente');
    if (labelSaldo) labelSaldo.textContent = '$' + saldoPendiente.toFixed(2);
}

// Función centralizada de validación y recopilación de prendas
function runOrderValidationAndSerialization(form) {
    let hasError = false;
    
    // 1. Validar Cliente seleccionado
    const clienteIdInput = form.querySelector('#selected_cliente_id');
    const clienteId = clienteIdInput ? clienteIdInput.value : '';
    const clienteError = form.querySelector('#cliente-validation-error');
    if (!clienteId) {
        hasError = true;
        if (clienteError) clienteError.style.display = 'block';
        const searchInput = form.querySelector('#cliente_search');
        if (searchInput) searchInput.focus();
    } else {
        if (clienteError) clienteError.style.display = 'none';
    }
    
    // 2. Validar Fecha Estimada
    const fechaEstimadaInput = form.querySelector('#id_fecha_entrega_estimada');
    const fechaEstimada = fechaEstimadaInput ? fechaEstimadaInput.value : '';
    const dateError = form.querySelector('#date-validation-error');
    if (!fechaEstimada) {
        hasError = true;
        if (dateError) dateError.style.display = 'block';
    } else {
        if (dateError) dateError.style.display = 'none';
    }
    
    // 3. Validar prendas agregadas
    const rows = form.querySelectorAll('.prenda-row');
    const prendasError = form.querySelector('#prendas-validation-error');
    if (rows.length === 0) {
        hasError = true;
        if (prendasError) prendasError.style.display = 'block';
    } else {
        if (prendasError) prendasError.style.display = 'none';
        
        // Validar que cada fila tenga su tipo de prenda e inputs completos
        rows.forEach(row => {
            const tipoInput = row.querySelector('.input-tipo');
            const selectServ = row.querySelector('.select-servicio');
            const tarifaInput = row.querySelector('.input-tarifa');
            const pesoInput = row.querySelector('.input-peso');
            
            if (!tipoInput.value.trim()) {
                hasError = true;
                tipoInput.style.borderColor = 'var(--danger)';
                tipoInput.focus();
            } else {
                tipoInput.style.borderColor = '';
            }
            
            if (!selectServ.value) {
                hasError = true;
                selectServ.style.borderColor = 'var(--danger)';
                // Si usa Tom Select, pintar el control correspondiente
                const tsControl = row.querySelector('.ts-control');
                if (tsControl) tsControl.style.borderColor = 'var(--danger)';
                selectServ.focus();
            }
            
            if (tarifaInput && (tarifaInput.value === '' || parseFloat(tarifaInput.value) < 0)) {
                hasError = true;
                tarifaInput.style.borderColor = 'var(--danger)';
                tarifaInput.focus();
            } else if (tarifaInput) {
                tarifaInput.style.borderColor = '';
            }
            
            if (!pesoInput.disabled && (!pesoInput.value || parseFloat(pesoInput.value) <= 0)) {
                hasError = true;
                pesoInput.style.borderColor = 'var(--danger)';
                pesoInput.focus();
            } else {
                pesoInput.style.borderColor = '';
            }
        });
    }
    
    if (hasError) {
        if (typeof showToast === 'function') {
            showToast("Por favor complete los campos requeridos marcados en rojo.", "error");
        }
        return false;
    }
    
    // Recopilar prendas en formato JSON
    const items = [];
    rows.forEach(row => {
        const tipo = row.querySelector('.input-tipo').value.trim();
        const servicioId = row.querySelector('.select-servicio').value;
        const tarifa = row.querySelector('.input-tarifa').value;
        const cantidad = row.querySelector('.input-cantidad').value;
        const peso = row.querySelector('.input-peso').value;
        const obs = row.querySelector('.input-obs').value.trim();
        
        items.push({
            tipo_prenda: tipo,
            servicio_id: parseInt(servicioId),
            precio_unitario: parseFloat(tarifa) || 0.00,
            cantidad: parseInt(cantidad) || 1,
            peso: peso ? parseFloat(peso) : null,
            es_delicada: false,
            observaciones: obs
        });
    });
    
    const prendasJsonInput = form.querySelector('#prendas_json');
    if (prendasJsonInput) {
        prendasJsonInput.value = JSON.stringify(items);
    }
    
    return true;
}

// Inicialización delegada para dar soporte a formularios cargados dinámicamente por HTMX
document.addEventListener('DOMContentLoaded', () => {
    initDeliveryDate();
    
    // Inicializar Tom Select para Método de Pago en carga inicial
    if (typeof TomSelect !== 'undefined') {
        const metodoPagoSelect = document.getElementById('id_metodo_pago');
        if (metodoPagoSelect && !metodoPagoSelect.tomselect) {
            new TomSelect(metodoPagoSelect, {
                create: false,
                sortField: { field: "text", direction: "asc" }
            });
        }
    }
});

// Escuchar evento de envío del formulario usando delegación global
document.addEventListener('submit', function(e) {
    const form = e.target.closest('#order-creation-form');
    if (form) {
        const isValid = runOrderValidationAndSerialization(form);
        if (!isValid) {
            e.preventDefault();
            e.stopPropagation();
        }
    }
});

// Interceptar peticiones HTMX para validar antes del envío asíncrono
document.addEventListener('htmx:configRequest', (event) => {
    if (event.detail.elt && event.detail.elt.id === 'order-creation-form') {
        const isValid = runOrderValidationAndSerialization(event.detail.elt);
        if (!isValid) {
            event.preventDefault(); // Cancela la petición de HTMX
        }
    }
});
