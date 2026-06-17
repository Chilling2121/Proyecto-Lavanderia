import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lavafacil.settings')
django.setup()

from django.contrib.auth.models import Group

groups = ['Administrador', 'Cajero', 'Operador']
for g in groups:
    Group.objects.get_or_create(name=g)

print("Grupos creados exitosamente.")
