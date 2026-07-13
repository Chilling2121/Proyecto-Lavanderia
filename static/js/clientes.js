function toggleModal(show) {
    const modal = document.getElementById('new-client-modal');
    if (!modal) return;
    modal.style.display = show ? 'flex' : 'none';
    if (!show) {
        clearErrors('new-client-form', 'id_cedula', 'id-cedula-error');
        clearErrors('new-client-form', 'id_nombre', 'id-name-error');
        clearErrors('new-client-form', 'id_apellido', 'id-lastname-error');
        clearErrors('new-client-form', 'id_telefono', 'id-tel-error');
    }
}

function toggleEditModal(show) {
    const modal = document.getElementById('edit-client-modal');
    if (!modal) return;
    modal.style.display = show ? 'flex' : 'none';
    if (!show) {
        clearErrors('edit-client-form', 'edit_cedula', 'edit-cedula-error');
        clearErrors('edit-client-form', 'edit_nombre', 'edit-name-error');
        clearErrors('edit-client-form', 'edit_apellido', 'edit-lastname-error');
        clearErrors('edit-client-form', 'edit_telefono', 'edit-tel-error');
    }
}

function toggleDeleteModal(show) {
    const modal = document.getElementById('delete-confirm-modal');
    if (!modal) return;
    modal.style.display = show ? 'flex' : 'none';
}

function openEditModal(id, cedula, nombre, apellido, telefono, correo, direccion) {
    const form = document.getElementById('edit-client-form');
    if (!form) return;
    form.action = `/clientes/editar/${id}/`;
    
    document.getElementById('edit_cedula').value = cedula;
    document.getElementById('edit_nombre').value = nombre;
    document.getElementById('edit_apellido').value = apellido;
    document.getElementById('edit_telefono').value = telefono;
    document.getElementById('edit_correo').value = correo;
    document.getElementById('edit_direccion').value = direccion;
    
    toggleEditModal(true);
}

function openDeleteModal(id, nombreCompleto) {
    const text = document.getElementById('delete-modal-text');
    if (!text) return;
    text.innerHTML = `¿Estás seguro de que deseas eliminar a <strong>${nombreCompleto}</strong>?<br><small style="color: var(--danger); display: inline-block; margin-top: 0.5rem;">Esta acción eliminará de forma permanente al cliente y todas sus órdenes asociadas.</small>`;
    
    const btn = document.getElementById('btn-confirm-delete');
    btn.setAttribute('hx-delete', `/clientes/eliminar/${id}/`);
    btn.setAttribute('hx-target', `#row-${id}`);
    
    // Re-procesar el botón para que HTMX capture los nuevos atributos si htmx está disponible
    if (typeof htmx !== 'undefined') {
        htmx.process(btn);
    }
    
    toggleDeleteModal(true);
}

window.onclick = function(event) {
    const newModal = document.getElementById('new-client-modal');
    const editModal = document.getElementById('edit-client-modal');
    const deleteModal = document.getElementById('delete-confirm-modal');
    if (event.target == newModal) {
        toggleModal(false);
    }
    if (event.target == editModal) {
        toggleEditModal(false);
    }
    if (event.target == deleteModal) {
        toggleDeleteModal(false);
    }
}

const restrictToNumbers = (input) => {
    if (!input) return;
    input.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');
    });
};

const clearErrors = (formId, inputId, errorId) => {
    const input = document.getElementById(inputId);
    const errorDiv = document.getElementById(errorId);
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
    if (input) {
        input.style.borderColor = '';
        input.style.boxShadow = '';
    }
}

function validarCedulaEcuatoriana(cedula) {
    if (cedula === '9999999999') return true;
    if (!/^\d{10}$/.test(cedula)) return false;
    
    const provincia = parseInt(cedula.substring(0, 2), 10);
    if (provincia < 1 || (provincia > 24 && provincia !== 30)) return false;
    
    const tercerDigito = parseInt(cedula.charAt(2), 10);
    if (tercerDigito >= 6) return false;
    
    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let suma = 0;
    for (let i = 0; i < 9; i++) {
        let val = parseInt(cedula.charAt(i), 10) * coeficientes[i];
        if (val >= 10) val -= 9;
        suma += val;
    }
    
    const verificador = parseInt(cedula.charAt(9), 10);
    const residuo = suma % 10;
    const valEsperado = residuo === 0 ? 0 : 10 - residuo;
    
    return verificador === valEsperado;
}

const setupFormValidation = (formId, fields) => {
    const form = document.getElementById(formId);
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        let hasError = false;
        let firstErrorInput = null;
        
        // 1. Validar Cédula
        const cedulaInput = document.getElementById(fields.cedulaId);
        const cedulaVal = cedulaInput.value.trim();
        let cedulaErrorDiv = document.getElementById(fields.cedulaErrorId);
        if (!cedulaErrorDiv) {
            cedulaErrorDiv = document.createElement('div');
            cedulaErrorDiv.id = fields.cedulaErrorId;
            cedulaErrorDiv.style.color = 'var(--danger)';
            cedulaErrorDiv.style.fontSize = '0.85rem';
            cedulaErrorDiv.style.fontWeight = '600';
            cedulaErrorDiv.style.marginTop = '0.35rem';
            cedulaErrorDiv.style.display = 'none';
            cedulaInput.parentNode.parentNode.appendChild(cedulaErrorDiv);
        }
        
        if (!validarCedulaEcuatoriana(cedulaVal)) {
            hasError = true;
            cedulaErrorDiv.textContent = 'La cédula ingresada no es válida (debe tener 10 dígitos y cumplir el algoritmo o ser 9999999999).';
            cedulaErrorDiv.style.display = 'block';
            cedulaInput.style.borderColor = 'var(--danger)';
            cedulaInput.style.boxShadow = '0 0 0 4px rgba(239, 68, 68, 0.1)';
            if (!firstErrorInput) firstErrorInput = cedulaInput;
        } else {
            cedulaErrorDiv.style.display = 'none';
            cedulaInput.style.borderColor = '';
            cedulaInput.style.boxShadow = '';
        }
        
        // 2. Validar Nombres
        const nombreInput = document.getElementById(fields.nombreId);
        const nombreVal = nombreInput.value.trim();
        let nameErrorDiv = document.getElementById(fields.nombreErrorId);
        if (!nameErrorDiv) {
            nameErrorDiv = document.createElement('div');
            nameErrorDiv.id = fields.nombreErrorId;
            nameErrorDiv.style.color = 'var(--danger)';
            nameErrorDiv.style.fontSize = '0.85rem';
            nameErrorDiv.style.fontWeight = '600';
            nameErrorDiv.style.marginTop = '0.35rem';
            nameErrorDiv.style.display = 'none';
            nombreInput.parentNode.parentNode.appendChild(nameErrorDiv);
        }
        
        if (nombreVal === '') {
            hasError = true;
            nameErrorDiv.textContent = 'Los nombres son requeridos.';
            nameErrorDiv.style.display = 'block';
            nombreInput.style.borderColor = 'var(--danger)';
            nombreInput.style.boxShadow = '0 0 0 4px rgba(239, 68, 68, 0.1)';
            if (!firstErrorInput) firstErrorInput = nombreInput;
        } else {
            nameErrorDiv.style.display = 'none';
            nombreInput.style.borderColor = '';
            nombreInput.style.boxShadow = '';
        }

        // 3. Validar Apellidos
        const apellidoInput = document.getElementById(fields.apellidoId);
        const apellidoVal = apellidoInput.value.trim();
        let lastnameErrorDiv = document.getElementById(fields.apellidoErrorId);
        if (!lastnameErrorDiv) {
            lastnameErrorDiv = document.createElement('div');
            lastnameErrorDiv.id = fields.apellidoErrorId;
            lastnameErrorDiv.style.color = 'var(--danger)';
            lastnameErrorDiv.style.fontSize = '0.85rem';
            lastnameErrorDiv.style.fontWeight = '600';
            lastnameErrorDiv.style.marginTop = '0.35rem';
            lastnameErrorDiv.style.display = 'none';
            apellidoInput.parentNode.parentNode.appendChild(lastnameErrorDiv);
        }
        
        if (apellidoVal === '') {
            hasError = true;
            lastnameErrorDiv.textContent = 'Los apellidos son requeridos.';
            lastnameErrorDiv.style.display = 'block';
            apellidoInput.style.borderColor = 'var(--danger)';
            apellidoInput.style.boxShadow = '0 0 0 4px rgba(239, 68, 68, 0.1)';
            if (!firstErrorInput) firstErrorInput = apellidoInput;
        } else {
            lastnameErrorDiv.style.display = 'none';
            apellidoInput.style.borderColor = '';
            apellidoInput.style.boxShadow = '';
        }
        
        // 4. Validar Teléfono
        const telInput = document.getElementById(fields.telefonoId);
        const telVal = telInput.value.trim();
        let telErrorDiv = document.getElementById(fields.telefonoErrorId);
        if (!telErrorDiv) {
            telErrorDiv = document.createElement('div');
            telErrorDiv.id = fields.telefonoErrorId;
            telErrorDiv.style.color = 'var(--danger)';
            telErrorDiv.style.fontSize = '0.85rem';
            telErrorDiv.style.fontWeight = '600';
            telErrorDiv.style.marginTop = '0.35rem';
            telErrorDiv.style.display = 'none';
            telInput.parentNode.parentNode.appendChild(telErrorDiv);
        }
        
        if (telVal.length !== 10 || !/^\d{10}$/.test(telVal)) {
            hasError = true;
            telErrorDiv.textContent = 'El celular debe tener exactamente 10 dígitos numéricos (ej. 0991234567).';
            telErrorDiv.style.display = 'block';
            telInput.style.borderColor = 'var(--danger)';
            telInput.style.boxShadow = '0 0 0 4px rgba(239, 68, 68, 0.1)';
            if (!firstErrorInput) firstErrorInput = telInput;
        } else {
            telErrorDiv.style.display = 'none';
            telInput.style.borderColor = '';
            telInput.style.boxShadow = '';
        }
        
        if (hasError) {
            e.preventDefault();
            if (firstErrorInput) firstErrorInput.focus();
        }
    });

    // Listeners para limpiar errores en tiempo real
    document.getElementById(fields.cedulaId).addEventListener('input', () => {
        clearErrors(formId, fields.cedulaId, fields.cedulaErrorId);
    });
    document.getElementById(fields.nombreId).addEventListener('input', () => {
        clearErrors(formId, fields.nombreId, fields.nombreErrorId);
    });
    document.getElementById(fields.apellidoId).addEventListener('input', () => {
        clearErrors(formId, fields.apellidoId, fields.apellidoErrorId);
    });
    document.getElementById(fields.telefonoId).addEventListener('input', () => {
        clearErrors(formId, fields.telefonoId, fields.telefonoErrorId);
    });
};

document.addEventListener('DOMContentLoaded', () => {
    restrictToNumbers(document.getElementById('id_cedula'));
    restrictToNumbers(document.getElementById('edit_cedula'));
    restrictToNumbers(document.getElementById('id_telefono'));
    restrictToNumbers(document.getElementById('edit_telefono'));
    
    setupFormValidation('new-client-form', {
        cedulaId: 'id_cedula',
        cedulaErrorId: 'id-cedula-error',
        nombreId: 'id_nombre',
        nombreErrorId: 'id-name-error',
        apellidoId: 'id_apellido',
        apellidoErrorId: 'id-lastname-error',
        telefonoId: 'id_telefono',
        telefonoErrorId: 'id-tel-error'
    });
    
    setupFormValidation('edit-client-form', {
        cedulaId: 'edit_cedula',
        cedulaErrorId: 'edit-cedula-error',
        nombreId: 'edit_nombre',
        nombreErrorId: 'edit-name-error',
        apellidoId: 'edit_apellido',
        apellidoErrorId: 'edit-lastname-error',
        telefonoId: 'edit_telefono',
        telefonoErrorId: 'edit-tel-error'
    });

    const tbody = document.getElementById('clientes-tbody');
    if (tbody) {
        tbody.addEventListener('click', (e) => {
            const tr = e.target.closest('tr');
            if (!tr || !tr.id.startsWith('row-')) return;
            
            document.querySelectorAll('#clientes-tbody tr').forEach(r => {
                r.classList.remove('selected-row');
            });
            
            tr.classList.add('selected-row');
        });
    }

    if (window.location.hash === '#nuevo') {
        toggleModal(true);
        history.replaceState(null, null, window.location.pathname);
    }
});

document.addEventListener('htmx:afterSwap', (event) => {
    if (event.detail.target.id === 'historial-container') {
        const container = event.detail.target;
        const hasPlaceholder = !container.querySelector('.card-header-row');
        if (hasPlaceholder) {
            container.style.borderStyle = 'dashed';
            container.style.borderWidth = '2px';
            container.style.justifyContent = 'center';
            container.style.alignItems = 'center';
            container.style.textAlign = 'center';
            container.style.color = 'var(--text-muted)';
        } else {
            container.style.borderStyle = 'solid';
            container.style.borderWidth = '1px';
            container.style.justifyContent = 'flex-start';
            container.style.alignItems = 'stretch';
            container.style.textAlign = 'left';
            container.style.color = 'var(--text)';
        }
    }
});

document.addEventListener('clientDeleted', (event) => {
    const nombre = event.detail.value;
    if (typeof showToast === 'function') {
        showToast(`Cliente "${nombre}" y su historial de órdenes eliminados con éxito.`, 'success');
    }
});

document.addEventListener('htmx:afterRequest', (event) => {
    if (event.detail.xhr.status === 200 && event.detail.requestConfig.verb === 'DELETE') {
        const targetId = event.detail.target.id;
        const row = document.getElementById(targetId);
        if (row && row.classList.contains('selected-row')) {
            const container = document.getElementById('historial-container');
            if (container) {
                container.innerHTML = `
                    <div style="max-width: 320px; display: flex; flex-direction: column; align-items: center; gap: 1rem;">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted); opacity: 0.6;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        <p style="font-size: 0.95rem; font-weight: 500; line-height: 1.4;">Selecciona un cliente de la tabla para cargar su historial de servicios aquí en tiempo real.</p>
                    </div>
                `;
                container.style.borderStyle = 'dashed';
                container.style.borderWidth = '2px';
                container.style.justifyContent = 'center';
                container.style.alignItems = 'center';
                container.style.textAlign = 'center';
                container.style.color = 'var(--text-muted)';
            }
        }
    }
});
