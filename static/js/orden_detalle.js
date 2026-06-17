function confirmAdvanceStatus() {
    toggleAdvanceModal(true);
}

function toggleAdvanceModal(show) {
    const modal = document.getElementById('advance-status-modal');
    if (modal) {
        modal.style.display = show ? 'flex' : 'none';
    }
}

// Cerrar modal al hacer clic fuera
window.addEventListener('click', function(event) {
    const modal = document.getElementById('advance-status-modal');
    if (event.target === modal) {
        toggleAdvanceModal(false);
    }
});

// Mostrar toast al avanzar estado exitosamente
document.addEventListener('htmx:afterSwap', function(event) {
    if (event.detail.target.id === 'status-panel') {
        if (typeof showToast === 'function') {
            showToast('Estado de la orden actualizado con éxito.', 'success');
        }
    }
    if (event.detail.target.id === 'payment-panel') {
        if (typeof showToast === 'function' && event.detail.xhr.status === 200) {
            showToast('Pago registrado con éxito.', 'success');
        }
    }
});
