import os
import sys
import django

# Asegurar que el directorio actual esté en el PYTHONPATH
sys.path.append(os.getcwd())

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lavafacil.settings')
django.setup()

from django.core.management import call_command
from django.contrib.auth.models import User, Group
from lavanderia.models import Cliente, Servicio

def main():
    print("==================================================")
    print("INICIALIZANDO BASE DE DATOS Y DATOS DE PRUEBA")
    print("==================================================")

    # 1. Ejecutar migraciones para crear las tablas
    print("\n[1/5] Ejecutando migraciones de base de datos...")
    call_command('migrate')
    print(">>> Tablas creadas exitosamente.")

    # 2. Crear grupos de roles empresariales
    print("\n[2/5] Creando roles y grupos empresariales...")
    groups = ['Administrador', 'Cajero', 'Operador']
    for name in groups:
        Group.objects.get_or_create(name=name)
    print(">>> Roles (Administrador, Cajero, Operador) configurados.")

    # 3. Crear superusuario inicial de administrador
    print("\n[3/5] Creando usuario administrador inicial...")
    if not User.objects.filter(username='admin').exists():
        admin_user = User.objects.create_superuser('admin', 'admin@lavafacil.com', 'admin123')
        # Asignarle también el grupo Administrador
        admin_group = Group.objects.get(name='Administrador')
        admin_user.groups.add(admin_group)
        print(">>> Superusuario creado:")
        print("   - Usuario: admin")
        print("   - Contraseña: admin123")
    else:
        print(">>> El usuario 'admin' ya existe en el sistema.")

    # 4. Crear catálogo de servicios de prueba
    print("\n[4/5] Creando catálogo inicial de servicios...")
    services_data = [
        {"nombre": "Lavado Normal", "descripcion": "Lavado regular de prendas diarias", "tarifa": 1.50, "tipo_cobro": "Por Kg"},
        {"nombre": "Lavado Delicado", "descripcion": "Prendas delicadas, encajes o seda", "tarifa": 2.00, "tipo_cobro": "Por Kg"},
        {"nombre": "Lavado en Seco", "descripcion": "Limpieza en seco profesional", "tarifa": 5.00, "tipo_cobro": "Por Prenda"},
        {"nombre": "Planchado", "descripcion": "Servicio de planchado profesional", "tarifa": 1.00, "tipo_cobro": "Por Prenda"},
        {"nombre": "Edredones", "descripcion": "Lavado de edredones y colchas pesadas", "tarifa": 8.00, "tipo_cobro": "Por Prenda"},
    ]

    for s in services_data:
        obj, created = Servicio.objects.get_or_create(
            nombre=s["nombre"],
            defaults={
                "descripcion": s["descripcion"],
                "tarifa": s["tarifa"],
                "tipo_cobro": s["tipo_cobro"]
            }
        )
        if created:
            print(f"   + Servicio '{s['nombre']}' registrado.")
        else:
            print(f"   = Servicio '{s['nombre']}' ya existe.")

    # 5. Crear clientes de prueba iniciales
    print("\n[5/5] Creando clientes de prueba iniciales...")
    clients_data = [
        {"nombre": "Carlos Pérez", "telefono": "0987654321", "correo": "carlos@gmail.com", "direccion": "Av. Universitaria"},
        {"nombre": "Josselyn Delgado", "telefono": "0999888777", "correo": "josselyn@gmail.com", "direccion": "Calle 12"},
    ]

    for c in clients_data:
        obj, created = Cliente.objects.get_or_create(
            nombre=c["nombre"],
            defaults={
                "telefono": c["telefono"],
                "correo": c["correo"],
                "direccion": c["direccion"]
            }
        )
        if created:
            print(f"   + Cliente '{c['nombre']}' registrado.")
        else:
            print(f"   = Cliente '{c['nombre']}' ya existe.")

    print("\n==================================================")
    print("INICIALIZACION COMPLETADA CON EXITO!")
    print("==================================================")

if __name__ == '__main__':
    main()
