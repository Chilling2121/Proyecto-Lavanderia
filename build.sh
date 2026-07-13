#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Building LavaFacil for production on Render..."

# Instalar dependencias
pip install -r requirements.txt

# Recopilar archivos estáticos para Whitenoise
python manage.py collectstatic --no-input

# Ejecutar migraciones de base de datos
python manage.py migrate

# Asegurar que los roles básicos existan en la base de datos
python create_groups.py || true


