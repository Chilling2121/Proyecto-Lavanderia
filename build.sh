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

# Crear superusuario automáticamente si se proveen las credenciales (Útil para planes Free)
if [[ -n "$DJANGO_SUPERUSER_USERNAME" && -n "$DJANGO_SUPERUSER_PASSWORD" ]]; then
    echo "Intentando crear superusuario automático..."
    python manage.py createsuperuser --noinput --email "admin@lavafacil.com" || true
fi
