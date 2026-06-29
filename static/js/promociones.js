window.togglePromocionModal = function(show) {
    const modal = document.getElementById('promocionModal');
    if (show) {
        document.getElementById('modalPromocionTitle').textContent = 'Nueva Promoción';
        document.getElementById('promocionForm').reset();
        document.getElementById('promocion_id').value = '';
        document.getElementById('promocionForm').action = '/promociones/nueva/';
        modal.style.display = 'flex';
    } else {
        modal.style.display = 'none';
    }
};

window.editPromocion = function(id, nombre, tipo, valor, fechaInicio, fechaFin) {
    document.getElementById('modalPromocionTitle').textContent = 'Editar Promoción';
    document.getElementById('promocion_id').value = id;
    document.getElementById('nombre_promocion').value = nombre;
    document.getElementById('tipo_promocion').value = tipo;
    
    const formattedValor = parseFloat(valor.replace(',', '.')).toString();
    document.getElementById('valor_promocion').value = formattedValor;
    
    document.getElementById('fecha_inicio_promocion').value = fechaInicio;
    document.getElementById('fecha_fin_promocion').value = fechaFin;
    
    document.getElementById('promocionForm').action = `/promociones/${id}/editar/`;
    document.getElementById('promocionModal').style.display = 'flex';
};

window.toggleDeletePromocionModal = function(show) {
    const modal = document.getElementById('deletePromocionModal');
    modal.style.display = show ? 'flex' : 'none';
};

window.confirmDeletePromocion = function(id) {
    document.getElementById('deletePromocionForm').action = `/promociones/${id}/eliminar/`;
    window.toggleDeletePromocionModal(true);
};

window.addEventListener('click', function(event) {
    const pModal = document.getElementById('promocionModal');
    const dModal = document.getElementById('deletePromocionModal');
    if (event.target === pModal) {
        window.togglePromocionModal(false);
    }
    if (event.target === dModal) {
        window.toggleDeletePromocionModal(false);
    }
});

document.body.addEventListener('showToast', function(evt) {
    if (typeof window.showToast === 'function') {
        window.showToast(evt.detail.message, evt.detail.type);
    } else if (typeof showToast === 'function') {
        showToast(evt.detail.message, evt.detail.type);
    }
});
