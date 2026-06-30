// ==========================================
// SISTEMA DE NOTIFICACIONES TOAST
// ==========================================
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast-item ${type}`;
    toast.style.minWidth = '320px';
    toast.style.maxWidth = '450px';
    toast.style.padding = '1rem 1.25rem';
    toast.style.borderRadius = 'var(--radius)';
    toast.style.backgroundColor = 'var(--bg-card)';
    
    let borderColor = 'var(--primary)';
    let iconSvg = '';
    if (type === 'error' || type === 'danger') {
        borderColor = 'var(--danger)';
        iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    } else if (type === 'success') {
        borderColor = 'var(--success)';
        iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else {
        iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }
    
    toast.style.borderLeft = `5px solid ${borderColor}`;
    toast.style.boxShadow = 'var(--shadow-lg)';
    toast.style.pointerEvents = 'auto';
    toast.style.animation = 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.justifyContent = 'space-between';
    toast.style.gap = '1rem';
    
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
            ${iconSvg}
            <span style="font-size: 0.9rem; font-weight: 600; color: var(--text);">${message}</span>
        </div>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.25rem; display: flex; align-items: center; justify-content: center; opacity: 0.7; transition: var(--transition); flex-shrink: 0;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

document.addEventListener('DOMContentLoaded', () => {
    const toasts = document.querySelectorAll('.toast-item');
    toasts.forEach(toast => {
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    });
});

// Inicializar librerías personalizadas en contenido cargado dinámicamente (HTMX)
document.addEventListener('htmx:afterSwap', (e) => {
    if (typeof TomSelect !== 'undefined') {
        const paymentSelects = e.target.querySelectorAll('select[name="metodo_pago"]');
        paymentSelects.forEach(select => {
            if (!select.tomselect) {
                new TomSelect(select, {
                    create: false,
                    sortField: { field: "text", direction: "asc" }
                });
            }
        });
    }
});

// ==========================================
// ==========================================
// MODAL DE CONFIRMACIÓN PERSONALIZADO
// ==========================================
window.customConfirm = function(message, onConfirm) {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.4)';
    overlay.style.backdropFilter = 'blur(4px)';
    overlay.style.zIndex = '9999';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.2s ease-out';

    const modal = document.createElement('div');
    modal.style.backgroundColor = 'var(--bg-app)';
    modal.style.borderRadius = 'var(--radius)';
    modal.style.boxShadow = 'var(--shadow-lg)';
    modal.style.padding = '1.5rem';
    modal.style.maxWidth = '400px';
    modal.style.width = '90%';
    modal.style.transform = 'scale(0.95) translateY(10px)';
    modal.style.transition = 'transform 0.2s ease-out';
    modal.style.border = '1px solid var(--border)';
    modal.style.fontFamily = 'var(--font)';

    modal.innerHTML = `
        <div style="display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1.5rem;">
            <div style="background-color: hsl(350, 80%, 95%); color: var(--danger); padding: 0.5rem; border-radius: 50%; display: flex; flex-shrink: 0;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <div>
                <h3 style="margin: 0 0 0.5rem 0; font-size: 1.1rem; color: var(--text);">Confirmar Acción</h3>
                <p style="margin: 0; color: var(--text-muted); font-size: 0.95rem; line-height: 1.5;">${message}</p>
            </div>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
            <button id="btn-cancelar" style="padding: 0.6rem 1.25rem; background: var(--bg-app); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text); font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: var(--font);" onmouseover="this.style.backgroundColor='var(--bg-card)'" onmouseout="this.style.backgroundColor='var(--bg-app)'">Cancelar</button>
            <button id="btn-confirmar" style="padding: 0.6rem 1.25rem; background: var(--danger); border: none; border-radius: var(--radius-sm); color: white; font-weight: 600; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.2); font-family: var(--font);" onmouseover="this.style.filter='brightness(1.1)'" onmouseout="this.style.filter='none'">Confirmar</button>
        </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        modal.style.transform = 'scale(1) translateY(0)';
    });

    const close = () => {
        overlay.style.opacity = '0';
        modal.style.transform = 'scale(0.95) translateY(10px)';
        setTimeout(() => overlay.remove(), 200);
    };

    modal.querySelector('#btn-cancelar').addEventListener('click', close);
    modal.querySelector('#btn-confirmar').addEventListener('click', () => {
        close();
        if (onConfirm) onConfirm();
    });
};

// Interceptar todos los hx-confirm globalmente
document.body.addEventListener('htmx:confirm', function(e) {
    if (!e.detail.question) return; // Si no hay hx-confirm, dejar pasar normalmente
    
    e.preventDefault();
    window.customConfirm(e.detail.question, function() {
        e.detail.issueRequest(true); // Omitir el confirm estándar
    });
});

// Interceptar errores de validación nativos/HTMX para mostrar toast de advertencia
document.body.addEventListener('htmx:validation:failed', function(e) {
    // Para identificar qué campo falló
    const elt = e.detail.elt;
    if (elt && elt.validationMessage) {
        if (typeof showToast === 'function') {
            showToast("Campo requerido: " + elt.validationMessage, "error");
        }
        // Enfocar el elemento y ponerle borde rojo temporal
        elt.focus();
        const oldBorder = elt.style.borderColor;
        elt.style.borderColor = 'var(--danger)';
        setTimeout(() => { elt.style.borderColor = oldBorder; }, 3000);
    } else {
        if (typeof showToast === 'function') {
            showToast("Por favor, complete todos los campos obligatorios.", "error");
        }
    }
});

// Interceptar errores htmx:responseError globales
document.body.addEventListener('htmx:responseError', function(evt) {
    if (evt.detail.xhr.status === 400 && typeof showToast === 'function') {
        showToast(evt.detail.xhr.responseText, "error");
    }
});

// Escuchar evento personalizado para eliminación de servicios
document.body.addEventListener('servicioDeleted', function(evt) {
    if (typeof showToast === 'function') {
        showToast("El servicio '" + evt.detail.value + "' ha sido eliminado con éxito.", "success");
    }
});

// Interceptar evento 'invalid' nativo para usar showToast en todos los formularios
document.addEventListener('invalid', function(e) {
    // Prevenir la burbuja nativa por defecto del navegador
    e.preventDefault();
    
    const elt = e.target;
    if (typeof showToast === 'function') {
        let labelText = '';
        // Intentar buscar una etiqueta label asociada al elemento
        const label = document.querySelector(`label[for="${elt.id}"]`) || elt.closest('div')?.querySelector('label');
        if (label) {
            labelText = label.textContent.replace('*', '').trim() + ': ';
        }
        showToast(labelText + elt.validationMessage, "error");
    }
    
    // Marcar el borde del input en rojo temporalmente
    const oldBorder = elt.style.borderColor;
    elt.style.borderColor = 'var(--danger)';
    setTimeout(() => { elt.style.borderColor = oldBorder; }, 3000);
    
    // Enfocar el elemento con error
    elt.focus();
}, true); // Usar capture phase (true) ya que el evento 'invalid' no burbujea


