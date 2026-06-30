from .models import Configuracion, TurnoCaja, Orden

def configuracion_global(request):
    """
    Inyecta la configuración global, el estado de la caja y órdenes críticas en el contexto de todas las plantillas.
    """
    config = Configuracion.load()
    caja_abierta = TurnoCaja.objects.filter(estado='Abierta').exists()
    
    # Órdenes listas para entrega y ya liquidadas (saldo = 0), que aún no han sido entregadas
    ordenes_pendientes_criticas = []
    if request.user.is_authenticated:
        ordenes_pendientes_criticas = Orden.objects.filter(
            estado_actual='Lista para entrega',
            saldo_pendiente=0
        ).select_related('cliente').order_by('fecha_recepcion')
        
    return {
        'config': config,
        'caja_abierta': caja_abierta,
        'ordenes_pendientes_criticas': ordenes_pendientes_criticas,
    }
