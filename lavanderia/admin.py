from django.contrib import admin
from .models import Cliente, Servicio, Promocion, Orden, PrendaOrden, SeguimientoLavado, Pago

@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'telefono', 'correo', 'fecha_registro')
    search_fields = ('nombre', 'telefono', 'correo')

@admin.register(Servicio)
class ServicioAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'tarifa', 'tipo_cobro')
    search_fields = ('nombre',)

@admin.register(Promocion)
class PromocionAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'tipo', 'valor', 'fecha_inicio', 'fecha_fin', 'esta_activa')
    list_filter = ('esta_activa', 'tipo')
    search_fields = ('nombre',)

class PrendaOrdenInline(admin.TabularInline):
    model = PrendaOrden
    extra = 1

class SeguimientoLavadoInline(admin.TabularInline):
    model = SeguimientoLavado
    extra = 1

class PagoInline(admin.TabularInline):
    model = Pago
    extra = 1

@admin.register(Orden)
class OrdenAdmin(admin.ModelAdmin):
    list_display = ('id', 'cliente', 'fecha_recepcion', 'total_a_pagar', 'saldo_pendiente', 'estado_pago', 'estado_actual')
    list_filter = ('estado_pago', 'estado_actual', 'fecha_recepcion')
    search_fields = ('id', 'cliente__nombre')
    inlines = [PrendaOrdenInline, SeguimientoLavadoInline, PagoInline]
