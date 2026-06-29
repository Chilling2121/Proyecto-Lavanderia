import re

def update_sidebar():
    filepath = 'templates/includes/sidebar.html'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if '{% load auth_extras %}' not in content:
        content = content.replace('<!-- BARRA LATERAL (SIDEBAR) -->', '<!-- BARRA LATERAL (SIDEBAR) -->\n{% load auth_extras %}')

    items = {
        'dashboard': '{% if request.user|has_group:"Administrador,Cajero" %}\n        <li class="sidebar-item {% if active_tab == \'dashboard\' %}active{% endif %}">',
        'clientes': '{% if request.user|has_group:"Administrador,Cajero" %}\n        <li class="sidebar-item {% if active_tab == \'clientes\' %}active{% endif %}">',
        'ordenes': '{% if request.user|has_group:"Administrador,Cajero" %}\n        <li class="sidebar-item {% if active_tab == \'ordenes\' %}active{% endif %}">',
        'servicios': '{% if request.user|has_group:"Administrador,Cajero" %}\n        <li class="sidebar-item {% if active_tab == \'servicios\' %}active{% endif %}">',
        'pagos': '{% if request.user|has_group:"Administrador,Cajero" %}\n        <li class="sidebar-item {% if active_tab == \'pagos\' %}active{% endif %}">',
        'promociones': '{% if request.user|has_group:"Administrador,Cajero" %}\n        <li class="sidebar-item {% if active_tab == \'promociones\' %}active{% endif %}">',
        'reportes': '{% if request.user|has_group:"Administrador" %}\n        <li class="sidebar-item {% if active_tab == \'reportes\' %}active{% endif %}">',
        'usuarios': '{% if request.user|has_group:"Administrador" %}\n        <li class="sidebar-item {% if active_tab == \'usuarios\' %}active{% endif %}">',
        'configuracion': '{% if request.user|has_group:"Administrador" %}\n        <li class="sidebar-item {% if active_tab == \'configuracion\' %}active{% endif %}">'
    }

    for key, replacement in items.items():
        pattern = r'(<li class="sidebar-item \{% if active_tab == \'' + key + r'\' %\}active\{% endif %\}.*?</li>)'
        
        # We need to use re.sub with a function or just do it block by block
        # A simple string manipulation is better
        # Find the start of the block
        start_tag = f'<li class="sidebar-item {{% if active_tab == \'{key}\' %}}active{{% endif %}}">'
        
        if start_tag in content:
            # find end of block </li>
            block_start_idx = content.find(start_tag)
            block_end_idx = content.find('</li>', block_start_idx) + 5
            
            block_content = content[block_start_idx:block_end_idx]
            
            if '{% if' not in block_content: # prevent double wrapping
                new_block = replacement.split('\n', 1)[0] + '\n' + block_content + '\n        {% endif %}'
                content = content[:block_start_idx] + new_block + content[block_end_idx:]

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Sidebar actualizada.")

if __name__ == '__main__':
    update_sidebar()
