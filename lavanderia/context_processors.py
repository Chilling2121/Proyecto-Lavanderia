from .models import Configuracion

def configuracion_global(request):
    """
    Inyecta la configuración global de la lavandería en el contexto de todas las plantillas.
    Esto permite usar {{ config.nombre_negocio }} en cualquier HTML.
    """
    config = Configuracion.load()
    return {
        'config': config
    }
