from django.core.exceptions import PermissionDenied
from django.contrib.auth.decorators import user_passes_test

def group_required(*group_names):
    """
    Requiere que el usuario pertenezca a al menos uno de los grupos especificados.
    Si el usuario es superuser, siempre pasa.
    """
    def in_groups(user):
        if user.is_authenticated:
            if user.is_superuser or user.groups.filter(name__in=group_names).exists():
                return True
        # En lugar de lanzar una excepcin dura que asusta al usuario,
        # retornamos False para que user_passes_test lo redirija al login.
        return False
    return user_passes_test(in_groups)
