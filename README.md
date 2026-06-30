# LavaFácil - Sistema de Gestión de Lavanderías

LavaFácil es un software premium de gestión para lavanderías y tintorerías desarrollado sobre Django (Python) que cuenta con un panel de control interactivo, seguimiento de prendas, control de turnos de caja chica, facturación física en tickets POS, notificaciones inteligentes de WhatsApp, y exportación empresarial a CSV y PDF.

## Requisitos de Sistema

- Python 3.12 o superior
- SQLite (desarrollo local por defecto) o MySQL (producción/local avanzado)

## Instalación y Configuración

Sigue estos pasos para instalar y desplegar el sistema localmente desde el repositorio de GitHub:

### 1. Clonar el repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd "Proyecto Lava"
```

### 2. Crear y activar el entorno virtual
En Windows:
```powershell
python -m venv .venv
.venv\Scripts\activate
```
En macOS/Linux:
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 4. Configurar variables de entorno
Crea una copia del archivo `.env.example` y nómbrala `.env`:
```bash
# En Windows (CMD/PowerShell) o Linux/macOS
copy .env.example .env
```
Abre el archivo `.env` y ajusta las configuraciones de tu base de datos (por defecto usará SQLite si dejas `DB_ENGINE=sqlite`). Si utilizas MySQL, asegúrate de cambiar `DB_ENGINE=mysql` y crear la base de datos correspondiente en tu motor de MySQL local.

### 5. Ejecutar migraciones
Crea las tablas en tu base de datos corriendo las migraciones de Django:
```bash
python manage.py migrate
```

### 6. Inicializar grupos de roles (¡IMPORTANTE!)
El sistema utiliza roles de seguridad obligatorios (`Administrador`, `Cajero`, `Operador`). Ejecuta el siguiente script para crearlos en la base de datos antes de iniciar sesión:
```bash
python create_groups.py
```

### 7. Crear usuario administrador
Genera la cuenta principal para acceder a la administración y asignarle su respectivo rol de Administrador:
```bash
python manage.py createsuperuser
```
*(Sigue las instrucciones en consola para asignar usuario, correo y contraseña. Luego ingresa al administrador Django en `/admin` y añade tu nuevo usuario al grupo `Administrador`).*

### 8. Iniciar el servidor de desarrollo
Inicia el sistema localmente con:
```bash
python manage.py runserver
```
El sistema estará disponible en tu navegador en: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

## Estructura del Proyecto

- `lavanderia/`: Aplicación principal de Django (Vistas, Modelos, Formularios, Context Processors).
- `lavafacil/`: Configuración del proyecto de Django (Settings, URLs, WSGI).
- `templates/`: Plantillas HTML y fragmentos dinámicos con HTMX.
- `static/`: Recursos estáticos (Diseño CSS modular, JS interactivo e imágenes).
