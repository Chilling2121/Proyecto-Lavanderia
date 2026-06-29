import re

def update_views():
    filepath = 'lavanderia/views.py'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    if 'from .decorators import group_required' not in content:
        content = content.replace('from django.contrib.auth.decorators import login_required', 
                                  'from django.contrib.auth.decorators import login_required\nfrom .decorators import group_required')
    
    # Reemplazo de home_redirect
    home_redirect_old = """def home_redirect(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    return redirect('login')"""
    
    home_redirect_new = """def home_redirect(request):
    if request.user.is_authenticated:
        if request.user.groups.filter(name='Operador').exists() and not request.user.groups.filter(name__in=['Administrador', 'Cajero']).exists():
            return redirect('seguimiento_list')
        return redirect('dashboard')
    return redirect('login')"""
    
    content = content.replace(home_redirect_old, home_redirect_new)
    
    # Mapping of functions to their groups
    # Default is @login_required. We replace it with @group_required('Administrador', 'Cajero') etc.
    
    admin_cajero_views = [
        'dashboard', 'clientes_list', 'clientes_search', 'cliente_historial', 
        'cliente_create', 'cliente_edit', 'servicios_list', 'servicios_search_api',
        'ordenes_list', 'ordenes_search', 'orden_cliente_search_api', 'orden_create', 
        'orden_create_partial', 'orden_detail', 'orden_register_payment', 'orden_ticket',
        'pagos_list', 'pagos_search'
    ]
    
    admin_views = [
        'cliente_delete', 'servicio_create', 'servicio_edit', 'servicio_delete',
        'usuarios_list', 'usuarios_search', 'usuario_create', 'usuario_update', 
        'usuario_toggle_status', 'reportes_dashboard', 'configuracion_update'
    ]
    
    all_views = [
        'seguimiento_list', 'seguimiento_advance_status'
    ]
    
    for view in admin_cajero_views:
        pattern = r'@login_required\s*\n\s*def ' + view + r'\('
        replacement = f"@login_required\n@group_required('Administrador', 'Cajero')\ndef {view}("
        content = re.sub(pattern, replacement, content)
        
    for view in admin_views:
        pattern = r'@login_required\s*\n\s*def ' + view + r'\('
        replacement = f"@login_required\n@group_required('Administrador')\ndef {view}("
        content = re.sub(pattern, replacement, content)
        
    for view in all_views:
        pattern = r'@login_required\s*\n\s*def ' + view + r'\('
        replacement = f"@login_required\n@group_required('Administrador', 'Cajero', 'Operador')\ndef {view}("
        content = re.sub(pattern, replacement, content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
if __name__ == '__main__':
    update_views()
    print("Vistas actualizadas correctamente.")
