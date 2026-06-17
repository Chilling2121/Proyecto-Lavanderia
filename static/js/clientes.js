function toggleModal(show) {
    const modal = document.getElementById('new-client-modal');
    if (!modal) return;
    modal.style.display = show ? 'flex' : 'none';
    if (!show) {
        clearErrors('new-client-form', 'id_telefono', 'id-tel-error');
        clearErrors('new-client-form', 'id_nombre', 'id-name-error');
    }
}

function toggleEditModal(show) {
    const modal = document.getElementById('edit-client-modal');
    if (!modal) return;
    modal.style.display = show ? 'flex' : 'none';
    if (!show) {
        clearErrors('edit-client-form', 'edit_telefono', 'edit-tel-error');
        clearErrors('edit-client-form', 'edit_nombre', 'edit-name-error');
    }
}

function toggleDeleteModal(show) {
    const modal = document.getElementById('delete-confirm-modal');
    if (!modal) return;
    modal.style.display = show ? 'flex' : 'none';
}

function openEditModal(id, nombre, telefono, correo, direccion) {
    const form = document.getElementById('edit-client-form');
    if (!form) return;
    form.action = `/clientes/editar/${id}/`;
    
    document.getElementById('edit_nombre').value = nombre;
    document.getElementById('edit_telefono').value = telefono;
    document.getElementById('edit_correo').value = correo;
    document.getElementById('edit_direccion').value = direccion;
    
    toggleEditModal(true);
}

function openDeleteModal(id, nombre) {
    const text = document.getElementById('delete-modal-text');
    if (!text) return;
    text.innerHTML = `¿Estás seguro de que deseas eliminar a <strong>${nombre}</strong>?<br><small style="color: var(--danger); display: inline-block; margin-top: 0.5rem;">Esta acción eliminará de forma permanente al cliente y todas sus órdenes asociadas.</small>`;
    
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

const setupFormValidation = (formId, inputId, errorId, nameInputId, nameErrorId) => {
    const form = document.getElementById(formId);
    const input = document.getElementById(inputId);
    const nameInput = document.getElementById(nameInputId);
    
    if (!form || !input || !nameInput) return;
    
    form.addEventListener('submit', (e) => {
        let hasError = false;
        
        // Validar nombre
        const nameVal = nameInput.value.trim();
        let nameErrorDiv = document.getElementById(nameErrorId);
        if (!nameErrorDiv) {
            nameErrorDiv = document.createElement('div');
            nameErrorDiv.id = nameErrorId;
            nameErrorDiv.style.color = 'var(--danger)';
            nameErrorDiv.style.fontSize = '0.85rem';
            nameErrorDiv.style.fontWeight = '600';
            nameErrorDiv.style.marginTop = '0.35rem';
            nameErrorDiv.style.display = 'none';
            nameInput.parentNode.parentNode.appendChild(nameErrorDiv);
        }
        
        if (nameVal === '') {
            hasError = true;
            nameErrorDiv.textContent = 'El nombre completo es requerido.';
            nameErrorDiv.style.display = 'block';
            nameInput.style.borderColor = 'var(--danger)';
            nameInput.style.boxShadow = '0 0 0 4px rgba(239, 68, 68, 0.1)';
        } else {
            nameErrorDiv.style.display = 'none';
            nameInput.style.borderColor = '';
            nameInput.style.boxShadow = '';
        }
        
        // Validar teléfono
        const val = input.value.trim();
        let errorDiv = document.getElementById(errorId);
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = errorId;
            errorDiv.style.color = 'var(--danger)';
            errorDiv.style.fontSize = '0.85rem';
            errorDiv.style.fontWeight = '600';
            errorDiv.style.marginTop = '0.35rem';
            errorDiv.style.display = 'none';
            input.parentNode.parentNode.appendChild(errorDiv);
        }
        
        if (val.length !== 10 || !/^\d{10}$/.test(val)) {
            hasError = true;
            errorDiv.textContent = 'El celular debe tener exactamente 10 dígitos numéricos (ej. 0991234567).';
            errorDiv.style.display = 'block';
            input.style.borderColor = 'var(--danger)';
            input.style.boxShadow = '0 0 0 4px rgba(239, 68, 68, 0.1)';
        } else {
            errorDiv.style.display = 'none';
            input.style.borderColor = '';
            input.style.boxShadow = '';
        }
        
        if (hasError) {
            e.preventDefault();
            if (nameVal === '') {
                nameInput.focus();
            } else {
                input.focus();
            }
        }
    });

    input.addEventListener('input', () => {
        clearErrors(formId, inputId, errorId);
    });
    
    nameInput.addEventListener('input', () => {
        clearErrors(formId, nameInputId, nameErrorId);
    });
};

document.addEventListener('DOMContentLoaded', () => {
    restrictToNumbers(document.getElementById('id_telefono'));
    restrictToNumbers(document.getElementById('edit_telefono'));
    
    setupFormValidation('new-client-form', 'id_telefono', 'id-tel-error', 'id_nombre', 'id-name-error');
    setupFormValidation('edit-client-form', 'edit_telefono', 'edit-tel-error', 'edit_nombre', 'edit-name-error');

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
        const hasPlaceholder = container.querySelector('svg') && container.querySelector('p');
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
