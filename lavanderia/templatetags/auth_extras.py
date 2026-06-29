from django import template
from django.contrib.auth.models import Group

register = template.Library()

@register.filter(name='has_group')
def has_group(user, group_name):
    """
    Uso en template: {% if request.user|has_group:"Administrador" %}
    Para múltiples grupos separados por coma: {% if request.user|has_group:"Administrador,Cajero" %}
    """
    if not user.is_authenticated:
        return False
        
    if user.is_superuser:
        return True
        
    group_names = [name.strip() for name in group_name.split(',')]
    return user.groups.filter(name__in=group_names).exists()
