from .models import Configuracion, TurnoCaja

def configuracion_global(request):
    """
    Inyecta la configuración global y el estado de la caja en el contexto de todas las plantillas.
    """
    config = Configuracion.load()
    # Verificamos si existe alguna caja abierta actualmente
    caja_abierta = TurnoCaja.objects.filter(estado='Abierta').exists()
    
    return {
        'config': config,
        'caja_abierta': caja_abierta,
    }
