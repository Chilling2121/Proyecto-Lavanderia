# LavaFácil - Sistema de Gestión para Lavanderías

LavaFácil es una aplicación web moderna y profesional diseñada para la gestión operativa y financiera de lavanderías. Permite controlar el registro de clientes, la recepción de prendas, el cálculo de tarifas automáticas por unidad o peso (Kg), el seguimiento del estado de lavado en tiempo real y el control de transacciones de caja diaria.

---

## Requisitos Previos

Asegúrate de tener instalado en tu máquina:
- **Python 3.10 o superior**
- **Git**
- **MySQL** (Opcional, el sistema incluye soporte automático para **SQLite** si no se configura MySQL).

---

## Guía de Instalación Local

Sigue estos pasos detallados para poner en marcha el proyecto en tu entorno local:

### 1. Clonar el repositorio
Abre tu terminal y clona el proyecto:
```bash
git clone https://github.com/Chilling2121/Proyecto-Lavanderia.git
cd Proyecto-Lavanderia
```

### 2. Crear y activar el entorno virtual
Es sumamente recomendable aislar las dependencias en un entorno virtual de Python:

**En Windows (PowerShell/CMD):**
```powershell
python -m venv .venv
.venv\Scripts\activate
```

**En Linux / macOS:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Instalar las dependencias
Con el entorno virtual activo, instala todos los paquetes necesarios:
```bash
pip install -r requirements.txt
```

### 4. Configurar las Variables de Entorno
Crea un archivo llamado `.env` en la raíz del proyecto. Puedes tomar como base el archivo de ejemplo:

```bash
# Copiar el ejemplo (en Windows)
copy .env.example .env

# Copiar el ejemplo (en Linux/macOS)
cp .env.example .env
```

Abre el archivo `.env` y ajusta las configuraciones necesarias. Por defecto, viene preconfigurado para usar **SQLite**, por lo que puedes dejarlo tal cual para levantar el servidor rápido en tu máquina de desarrollo.

### 5. Ejecutar Migraciones de Base de Datos
Crea las tablas correspondientes en la base de datos local:
```bash
python manage.py migrate
```

### 6. Cargar Roles Corporativos (Semilla)
Ejecuta el script para crear los grupos y roles de acceso necesarios en la aplicación:
```bash
python create_groups.py
```

### 7. Crear un Superusuario (Administrador Principal)
Para poder acceder a todas las secciones y administrar la aplicación, crea tu cuenta de administrador de Django:
```bash
python manage.py createsuperuser
```
*(Sigue las instrucciones en la terminal para definir tu usuario, correo y contraseña).*

### 8. Iniciar el Servidor de Desarrollo
¡Todo listo! Arranca el servidor local de Django:
```bash
python manage.py runserver
```

Abre tu navegador e ingresa a: **`http://127.0.0.1:8000/`** e inicia sesión con la cuenta de superusuario que acabas de crear.

---

## Estructura de Roles Corporativos en LavaFácil

El sistema restringe el acceso a las vistas dependiendo del puesto asignado al empleado (Grupos de Django):

1. **Administrador:** Acceso ilimitado a todas las vistas, incluyendo Gestión de Usuarios, Configuración y Reportes financieros de caja.
2. **Cajero:** Orientado a la atención al cliente. Puede crear clientes, gestionar órdenes de servicio, recibir abonos e imprimir tickets. Tiene restringida la administración de usuarios y estadísticas globales.
3. **Operador:** Exclusivo para el personal de lavado. Únicamente puede ver la pantalla de **Seguimiento de Lavado** para avanzar prendas en la línea de producción. No tiene acceso a datos de dinero ni de clientes.
