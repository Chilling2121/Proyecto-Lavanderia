from django.shortcuts import render
from functools import wraps
from lavanderia.models import RegistroAuditoria

def group_required(*group_names):
    """
    Requiere que el usuario pertenezca a al menos uno de los grupos especificados.
    Si el usuario es superuser, siempre pasa. Si no tiene permiso, lanza 403 y audita.
    """
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            user = request.user
            if user.is_authenticated:
                if user.is_superuser or user.groups.filter(name__in=group_names).exists():
                    return view_func(request, *args, **kwargs)
                else:
                    # Registrar intrusión silenciosamente
                    ip = request.META.get('REMOTE_ADDR')
                    RegistroAuditoria.objects.create(
                        usuario=user,
                        accion=f'Intento de acceso denegado por falta de privilegios.',
                        modulo=request.path,
                        nivel_severidad='WARNING',
                        ip_address=ip
                    )
                    return render(request, 'acceso_denegado.html', status=403)
            # Si no está logueado, lo maneja @login_required de todas formas
            from django.contrib.auth.views import redirect_to_login
            return redirect_to_login(request.get_full_path())
        return _wrapped_view
    return decorator
