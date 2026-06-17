# Guías y Reglas de Desarrollo: LavaFácil

Este documento establece las directrices estrictas que el desarrollador (y el agente AI) deben seguir incondicionalmente durante todas las implementaciones de este proyecto, con el objetivo de entregar un software de calidad empresarial, profesional y altamente pulido.

## 1. Experiencia de Usuario (UX) No-Nativa y Premium
- **Cero Elementos Nativos:** Queda estrictamente prohibido el uso de alertas nativas (`alert()`, `confirm()`), selectores básicos de HTML (`<select>`), o selectores de fecha nativos del navegador. Todo debe ser reemplazado por componentes visuales del propio diseño (librerías como *Tom Select*, *Flatpickr* o modales/toasts personalizados).
- **Notificaciones Amigables (Toasts):** Toda acción del usuario (éxito, error, advertencia) debe tener retroalimentación inmediata mediante notificaciones flotantes animadas y coherentes con la paleta de colores.
- **Micro-interacciones:** Los botones, filas y tarjetas deben tener efectos de *hover* y transiciones suaves para que la aplicación se sienta "viva".

## 2. Visión Empresarial y Cero Cabos Sueltos
- **Anticipación de Casos Borde:** Siempre programar pensando en el peor escenario (ej. ¿Qué pasa si la base de datos está vacía? ¿Qué pasa si el usuario intenta entregar una orden no pagada? ¿Qué pasa si busca un cliente que no existe?).
- **Restricciones Rigurosas:** Aplicar límites estandarizados al proyecto sin desviarse del *Análisis de requisitos* entregado. No se deben crear módulos fantasma ni saltarse la lógica contable y de flujos descrita en el PDF/DOCX base.
- **Protección del Historial (Data Safety):** Jamás se debe realizar un borrado en cascada que destruya información contable o historial. Los servicios, clientes o pagos siempre deben validarse con `ProtectedError` para asegurar la integridad de la base de datos a futuro.

## 3. Orden y Arquitectura Limpia
- **Modularidad:** El código debe ser estructurado e intuitivo. Los bloques grandes de HTML deben fragmentarse en sub-plantillas (`partials/`) especialmente para componentes que se refrescan en vivo (HTMX).
- **DRY (Don't Repeat Yourself):** Reutilizar clases CSS globales en lugar de inventar estilos en línea a menos que sea estrictamente necesario o para micro-ajustes rápidos.
- **Optimización de Carga:** Separar los scripts complejos en sus respectivos archivos dentro de `static/js/` para mantener el código mantenible.

## 4. Eficiencia y Reactividad (Reglas Adicionales)
- **Reactividad Instantánea (HTMX):** El sistema debe sentirse como una aplicación móvil rápida. Las actualizaciones de datos (búsquedas, filtros, cambios de estado) se harán sin recargar la página, inyectando los datos al DOM directamente.
- **Doble Validación Inquebrantable:** El Frontend evitará que el usuario cometa errores (validando campos vacíos y montos negativos con color rojo), pero el Backend (Django) SIEMPRE tendrá la última palabra, validando de nuevo por seguridad para evitar cualquier intento de inyección o vulnerabilidad.
- **Optimización de Base de Datos (Select Related):** En Django, siempre que se liste información que depende de otra (como Órdenes junto a los nombres de sus Clientes), se obligará el uso de `select_related` o `prefetch_related` para no saturar el servidor con el problema de "N+1 queries", haciéndolo escalable si la lavandería llega a tener miles de registros.
