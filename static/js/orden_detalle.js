// Mostrar toast al avanzar estado o registrar pago exitosamente
document.addEventListener('htmx:afterSwap', function(event) {
    if (event.detail.target.id === 'payment-panel') {
        if (typeof showToast === 'function' && event.detail.xhr.status === 200) {
            showToast('Pago registrado con éxito.', 'success');
        }
    }
});

